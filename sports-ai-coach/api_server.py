"""
api_server.py - Smart Gym AI Coach
Python API Server - يربط الموديل مع الـ Web App
ضعي هذا الملف في D:\coach_ai
"""
import os
import sys
import json
import tempfile
import traceback
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

# ================== ENDPOINTS ==================

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status":        "ok",
        "models_loaded": MODELS_LOADED,
        "service":       "Smart Gym AI API",
    })


@app.route("/api/analyze", methods=["POST", "OPTIONS"])
def analyze():
    """تحليل فيديو وإرجاع النتيجة"""
    if request.method == "OPTIONS":
        return jsonify({}), 200

    if not MODELS_LOADED:
        return jsonify({"error": "Models not loaded - run build_references.py first"}), 500

    if "video" not in request.files:
        return jsonify({"error": "No video file uploaded"}), 400

    video_file = request.files["video"]

    # حفظ الفيديو مؤقتاً
    suffix = ".mp4"
    if video_file.filename and "." in video_file.filename:
        suffix = "." + video_file.filename.rsplit(".", 1)[-1]

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        video_file.save(tmp.name)
        tmp_path = tmp.name

    try:
        result = predict_video(tmp_path)
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


@app.route("/api/recommend", methods=["POST", "OPTIONS"])
def recommend():
    """توصيات التمارين"""
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data    = request.json or {}
    goal    = data.get("goal_en",        "fitness")
    level   = data.get("level_en",       "beginner")
    muscles = data.get("target_muscles", ["chest"])
    equip   = data.get("equipment_list", ["no equipment"])

    try:
        recs   = get_recommendations(
            goal_en        = goal,
            level_en       = level,
            target_muscles = muscles,
            equipment_list = equip,
            n              = 6,
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
    print(f"🌐 Running on:    http://localhost:{port}")
    print(f"📡 Endpoints:")
    print(f"   GET  /api/health")
    print(f"   POST /api/analyze   (multipart video)")
    print(f"   POST /api/recommend (json)")
    print("=" * 50)
    app.run(host="0.0.0.0", port=port, debug=False)
