"""
api_server.py - Smart Gym AI Coach
Python API Server - connects the model with the Web App
Place this file in D:\coach_ai_completenew\coach_ai
"""
import os
import sys
import json
import tempfile
import traceback
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(dotenv_path=Path(__file__).parent / ".env")
from flask import Flask, request, jsonify
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(BASE_DIR)
sys.path.append(BASE_DIR)

app = Flask(__name__)
CORS(app)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# ================== LOAD MODELS ==================
print("🔄 Loading models...")
try:
    from predict_final import predict_video, sample_frames
    from recommend import get_recommendations, EXERCISES_DB, LANG
    print("✅ Models loaded successfully!")
    MODELS_LOADED = True
except Exception as e:
    print(f"⚠️  Could not load models: {e}")
    traceback.print_exc()
    MODELS_LOADED = False

# ================== LOAD RAG ==================
print("🔄 Loading RAG system...")
try:
    from coach_chat import chat_with_analysis, chat_general
    RAG_LOADED = True
    print("✅ RAG system loaded!")
except Exception as e:
    print(f"⚠️  RAG not loaded: {e}")
    RAG_LOADED = False

# ================== ENDPOINTS ==================

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status":        "ok",
        "models_loaded": MODELS_LOADED,
        "rag_loaded":    RAG_LOADED,
        "service":       "Smart Gym AI API",
    })


@app.route("/api/analyze", methods=["POST", "OPTIONS"])
def analyze():
    """Analyze video and return result"""
    if request.method == "OPTIONS":
        return jsonify({}), 200

    if not MODELS_LOADED:
        return jsonify({"error": "Models not loaded"}), 500

    if "video" not in request.files:
        return jsonify({"error": "No video file uploaded"}), 400

    video_file = request.files["video"]
    suffix = ".mp4"
    if video_file.filename and "." in video_file.filename:
        ext = video_file.filename.rsplit(".", 1)[-1].lower()
        suffix = f".{ext}"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        video_file.save(tmp.name)
        tmp_path = tmp.name

    # Convert webm to mp4 if needed
    if suffix == ".webm":
        try:
            import subprocess
            mp4_path = tmp_path.replace(".webm", ".mp4")
            result = subprocess.run(
                ["ffmpeg", "-i", tmp_path, "-c:v", "libx264", "-preset", "fast", mp4_path, "-y"],
                capture_output=True, timeout=60
            )
            if result.returncode == 0:
                os.unlink(tmp_path)
                tmp_path = mp4_path
            # If ffmpeg fails, try with cv2 directly
        except Exception as e:
            print(f"[ffmpeg] not available, trying directly: {e}")

    try:
        source = request.args.get("source", request.form.get("source", "upload"))
        print(f"  [API] source={source}")
        result = predict_video(tmp_path, source=source)
        os.unlink(tmp_path)

        if "error" in result:
            return jsonify({"error": result["error"]}), 400

        return jsonify({
            "className":      result.get("exercise",           "Unknown"),
            "confidence":     result.get("confidence",         0),
            "level":          result.get("level",              None),
            "dtw_feedback":   result.get("dtw_feedback",       None),
            "dtw_distance":   result.get("dtw_distance",       None),
            "corrections":    result.get("specific_feedbacks", []),
            "quality_issues": result.get("quality_issues",     []),
        })

    except Exception as e:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/chat", methods=["POST", "OPTIONS"])
def chat():
    """
    RAG Chat endpoint
    Handles both inner chat (with analysis) and outer chat (general)
    """
    if request.method == "OPTIONS":
        return jsonify({}), 200

    if not RAG_LOADED:
        return jsonify({
            "message": "RAG system not loaded. Please install: pip install langchain langchain-community faiss-cpu sentence-transformers"
        }), 200

    data      = request.json or {}
    question  = data.get("question", "")
    language  = data.get("language", "en")
    chat_type = data.get("type", "general")
    user_name = data.get("user_name", None)

    if not question:
        return jsonify({"error": "No question provided"}), 400

    try:
        if chat_type == "analysis":
            response = chat_with_analysis(
                question=question,
                exercise_name=data.get("exercise_name", ""),
                confidence=float(data.get("confidence", 0)),
                level=data.get("level", ""),
                corrections=data.get("corrections", []),
                language=language,
                user_name=user_name,
            )
        else:
            response = chat_general(
                question=question,
                language=language,
                user_name=user_name,
            )

        return jsonify({"message": response})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/recommend", methods=["POST", "OPTIONS"])
def recommend():
    """Exercise recommendations"""
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data    = request.json or {}
    goal    = data.get("goal_en",        "fitness")
    level   = data.get("level_en",       "beginner")
    muscles = data.get("target_muscles", ["chest"])
    equip   = data.get("equipment_list", ["no equipment"])

    try:
        recs   = get_recommendations(
            goal_en=goal, level_en=level,
            target_muscles=muscles, equipment_list=equip, n=6,
        )
        result = []
        for exercise, score in recs:
            info = EXERCISES_DB.get(exercise, {})
            result.append({
                "exercise":    exercise,
                "score":       score,
                "description": info.get("desc", {}).get(LANG, info.get("desc", {}).get("en", "")),
                "muscles":     info.get("muscle_groups", []),
                "equipment":   info.get("equipment",     []),
                "calories":    info.get("calories",       0),
            })
        return jsonify({"recommendations": result})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print("=" * 50)
    print("🏋️   Smart Gym AI - Python API Server")
    print("=" * 50)
    print(f"✅ Models loaded: {MODELS_LOADED}")
    print(f"✅ RAG loaded:    {RAG_LOADED}")
    print(f"🌐 Running on:    http://localhost:{port}")
    print(f"📡 Endpoints:")
    print(f"   GET  /api/health")
    print(f"   POST /api/analyze   (multipart video)")
    print(f"   POST /api/chat      (RAG chat)")
    print(f"   POST /api/recommend (json)")
    print("=" * 50)
    app.run(host="0.0.0.0", port=port, debug=False)
