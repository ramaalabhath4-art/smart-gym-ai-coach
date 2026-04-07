"""
main.py - نظام تحليل التمارين الرياضية الذكي
Smart Gym Exercise Analysis System
"""
import os
import cv2
import numpy as np
import joblib
import locale
from tensorflow.keras.models import load_model
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import mediapipe as mp

import pathlib
os.chdir(pathlib.Path(__file__).parent)

# ================== LANGUAGE ==================

def detect_language():
    try:
        lang = locale.getdefaultlocale()[0] or ""
        if lang.startswith("ar"): return "ar"
        if lang.startswith("fr"): return "fr"
        if lang.startswith("de"): return "de"
        if lang.startswith("es"): return "es"
        return "en"
    except:
        return "en"

LANG = detect_language()

T = {
    "welcome":      {"en": "Smart Gym Exercise Analysis System", "ar": "نظام تحليل التمارين الرياضية الذكي"},
    "menu":         {"en": "Main Menu", "ar": "القائمة الرئيسية"},
    "opt1":         {"en": "Get Exercise Recommendations", "ar": "احصل على توصيات تمارين"},
    "opt2":         {"en": "Analyze Video File", "ar": "تحليل فيديو"},
    "opt3":         {"en": "Live Camera Analysis", "ar": "تحليل مباشر بالكاميرا"},
    "opt4":         {"en": "Exit", "ar": "خروج"},
    "choose":       {"en": "Choose: ", "ar": "اختر: "},
    "enter_video":  {"en": "Enter video path: ", "ar": "أدخل مسار الفيديو: "},
    "analyzing":    {"en": "Analyzing...", "ar": "جاري التحليل..."},
    "result":       {"en": "Result", "ar": "النتيجة"},
    "exercise":     {"en": "Exercise", "ar": "التمرين"},
    "confidence":   {"en": "Confidence", "ar": "الثقة"},
    "level":        {"en": "Performance Level", "ar": "مستوى الأداء"},
    "feedback":     {"en": "Feedback", "ar": "التغذية الراجعة"},
    "quality":      {"en": "Video Quality", "ar": "جودة الفيديو"},
    "press_q":      {"en": "Press Q to stop recording", "ar": "اضغط Q لإيقاف التسجيل"},
    "recording":    {"en": "Recording... Press Q to stop", "ar": "جاري التسجيل... اضغط Q للإيقاف"},
    "saved":        {"en": "Video saved", "ar": "تم حفظ الفيديو"},
    "no_video":     {"en": "File not found", "ar": "الملف غير موجود"},
}

def t(key):
    return T.get(key, {}).get(LANG, T.get(key, {}).get("en", key))

# ================== LOAD MODELS ==================

print("Loading models...")
model   = load_model("model_lstm_final.keras")
scaler  = joblib.load("scaler.pkl")
encoder = joblib.load("encoder.pkl")
actions = list(encoder.classes_)

try:
    references = np.load("references.npy", allow_pickle=True).item()
except:
    references = {}

NUM_FRAMES = 15

# ================== DETECTORS ==================

pose_options = vision.PoseLandmarkerOptions(
    base_options=python.BaseOptions(model_asset_path="pose_landmarker_full.task"),
    running_mode=vision.RunningMode.IMAGE
)
pose_detector = vision.PoseLandmarker.create_from_options(pose_options)

hand_options = vision.HandLandmarkerOptions(
    base_options=python.BaseOptions(model_asset_path="hand_landmarker.task"),
    running_mode=vision.RunningMode.IMAGE,
    num_hands=2
)
hand_detector = vision.HandLandmarker.create_from_options(hand_options)

# ================== FEATURE FUNCTIONS ==================

def normalize_pose(landmarks):
    center = (landmarks[23][:3] + landmarks[24][:3]) / 2
    coords = landmarks[:, :3] - center
    scale  = np.max(np.linalg.norm(coords, axis=1))
    coords = coords / (scale + 1e-6)
    visibility = landmarks[:, 3].reshape(-1, 1)
    return np.concatenate([coords, visibility], axis=1).flatten()

def calculate_angle(a, b, c):
    ba = a - b
    bc = c - b
    cosine = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
    return np.degrees(np.arccos(np.clip(cosine, -1.0, 1.0)))

def compute_angles(lm):
    return np.array([
        calculate_angle(lm[11], lm[13], lm[15]),
        calculate_angle(lm[12], lm[14], lm[16]),
        calculate_angle(lm[23], lm[25], lm[27]),
        calculate_angle(lm[24], lm[26], lm[28]),
        calculate_angle(lm[13], lm[11], lm[23]),
        calculate_angle(lm[14], lm[12], lm[24]),
        calculate_angle(lm[11], lm[12], lm[24]),
        calculate_angle(lm[23], lm[24], lm[26]),
    ], dtype=np.float32)

def is_good_frame(landmarks):
    if landmarks is None: return False
    if np.any(np.isnan(landmarks)) or np.any(np.isinf(landmarks)): return False
    visibility = landmarks[:, 3]
    return np.mean(visibility) >= 0.5 and np.sum(visibility > 0.5) >= 20

def extract_keypoints(frame):
    rgb      = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result   = pose_detector.detect(mp_image)
    if not result.pose_landmarks:
        return None
    lm = np.array([[l.x, l.y, l.z, l.visibility] for l in result.pose_landmarks[0]])
    if not is_good_frame(lm): return None
    return np.concatenate([normalize_pose(lm), compute_angles(lm[:, :3])]).astype(np.float32)

# ================== HELPER FUNCTIONS ==================

def compute_motion(sequence):
    poses       = sequence[:, :132].reshape(NUM_FRAMES, 33, 4)
    left_wrist  = poses[:, 15, :2]
    right_wrist = poses[:, 16, :2]
    left_knee   = poses[:, 25, :2]
    right_knee  = poses[:, 26, :2]
    left_hip    = poses[:, 23, :2]
    right_hip   = poses[:, 24, :2]
    def speed(p): return float(np.mean(np.linalg.norm(np.diff(p, axis=0), axis=1)))
    def sync(p1, p2):
        if np.std(p1[:,1])<1e-6 or np.std(p2[:,1])<1e-6: return 0.0
        return float(np.corrcoef(p1[:,1], p2[:,1])[0,1])
    def rng(p): return float(np.max(p[:,1]) - np.min(p[:,1]))
    return {
        "wrist_speed_left":  speed(left_wrist),
        "wrist_speed_right": speed(right_wrist),
        "wrist_sync":        sync(left_wrist, right_wrist),
        "knee_range":        (rng(left_knee)+rng(right_knee))/2,
        "hip_range":         (rng(left_hip)+rng(right_hip))/2,
        "wrist_speed_diff":  abs(speed(left_wrist)-speed(right_wrist)),
    }

def check_position(sequence):
    pose       = sequence[7][:132].reshape(33,4)
    shoulder_y = (pose[11][1]+pose[12][1])/2
    ankle_y    = (pose[27][1]+pose[28][1])/2
    hip_y      = (pose[23][1]+pose[24][1])/2
    knee_y     = (pose[25][1]+pose[26][1])/2
    if abs(shoulder_y-ankle_y)<0.25: return "lying"
    if abs(hip_y-knee_y)<0.15: return "sitting"
    return "standing"

def check_hand_grip(frames):
    scores = []
    for frame in frames:
        rgb      = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result   = hand_detector.detect(mp_image)
        if not result.hand_landmarks: continue
        for hand_lm in result.hand_landmarks:
            index_mcp = np.array([hand_lm[5].x, hand_lm[5].y])
            pinky_mcp = np.array([hand_lm[17].x, hand_lm[17].y])
            dx = abs(index_mcp[0]-pinky_mcp[0])
            dy = abs(index_mcp[1]-pinky_mcp[1])
            scores.append(1.0 if dy>dx else 0.0)
    if not scores: return None
    avg = np.mean(scores)
    if avg>0.5: return "hammer curl"
    elif avg<0.45: return "barbell biceps curl"
    return None

def fix_similar(predicted, sequence, pred, top3_labels):
    pose = sequence[7][:132].reshape(33,4)
    if predicted == "deadlift":
        ka = (calculate_angle(pose[23][:3],pose[25][:3],pose[27][:3]) +
              calculate_angle(pose[24][:3],pose[26][:3],pose[28][:3]))/2
        if ka > 120: return "romanian deadlift"
    if predicted == "bench press":
        sy = (pose[11][1]+pose[12][1])/2
        hy = (pose[23][1]+pose[24][1])/2
        tilt = sy - hy
        if "decline bench press" in top3_labels:
            dp = float(pred[actions.index("decline bench press")])
            ip = float(pred[actions.index("incline bench press")])
            if dp>ip and dp>0.05: return "decline bench press"
        if abs(tilt)>0.08: return "incline bench press"
    if predicted == "leg extension":
        sy = (pose[11][1]+pose[12][1])/2
        ay = (pose[27][1]+pose[28][1])/2
        hp = float(pred[actions.index("hip thrust")]) if "hip thrust" in actions else 0.0
        if abs(sy-ay)<0.40 or hp>0.05 or "hip thrust" in top3_labels:
            return "hip thrust"
    return predicted

def dtw_distance(seq1, seq2):
    n,m = len(seq1), len(seq2)
    dtw = np.full((n+1,m+1), np.inf)
    dtw[0,0] = 0
    for i in range(1,n+1):
        for j in range(1,m+1):
            cost = np.linalg.norm(seq1[i-1]-seq2[j-1])
            dtw[i,j] = cost + min(dtw[i-1,j], dtw[i,j-1], dtw[i-1,j-1])
    return dtw[n,m]

def check_dtw(sequence, predicted):
    if predicted not in references: return None, None, None
    ref      = references[predicted]
    distance = dtw_distance(sequence[:,132:], ref[:,132:])
    if distance<500:   return "⭐⭐⭐ Excellent", "Great form! Keep it up", distance
    elif distance<1000:return "⭐⭐ Good", "Good form with minor improvements needed", distance
    elif distance<1500:return "⭐ Fair", "Form needs improvement", distance
    else:              return "⚠️ Needs Work", "Please review your exercise form", distance

def validate_quality(frames, sequence):
    issues = []
    bg_diffs = [float(np.mean(cv2.absdiff(
        cv2.cvtColor(frames[i-1],cv2.COLOR_BGR2GRAY),
        cv2.cvtColor(frames[i],  cv2.COLOR_BGR2GRAY)
    ))) for i in range(1,len(frames))]
    if np.mean(bg_diffs)>40:
        issues.append("⚠️ Camera is moving - Please stabilize your camera")
    vis = sequence[:,:132].reshape(NUM_FRAMES,33,4)[:,:,3]
    if np.mean(vis)<0.55:
        issues.append("⚠️ Poor lighting - Ensure good lighting conditions")
    pose      = sequence[7][:132].reshape(33,4)
    body_size = abs(pose[0][1]-pose[28][1])
    if body_size<0.25:
        issues.append("⚠️ Too far from camera - Please move closer")
    elif body_size>0.95:
        issues.append("⚠️ Too close to camera - Please move back")
    wm = float(np.std(sequence[:,:132].reshape(NUM_FRAMES,33,4)[:,15,1]))
    if wm<0.005:
        issues.append("⚠️ No movement detected - Make sure you are exercising")
    return issues

def get_specific_feedback(sequence, predicted):
    pose = sequence[7][:132].reshape(33,4)
    def ang(a,b,c): return calculate_angle(pose[a][:3],pose[b][:3],pose[c][:3])
    feedbacks = []
    if predicted in ["squat","deadlift","romanian deadlift"]:
        ka = (ang(23,25,27)+ang(24,26,28))/2
        ba = ang(11,23,25)
        if ka<80: feedbacks.append("⚠️ Knees going too far forward - Don't pass toes")
        if ba<150: feedbacks.append("⚠️ Back is rounded - Keep your back straight")
    elif predicted in ["bench press","incline bench press","decline bench press"]:
        ea = (ang(11,13,15)+ang(12,14,16))/2
        if ea<70: feedbacks.append("⚠️ Elbows too bent - Lower the weight more")
        if ea>160: feedbacks.append("⚠️ Don't fully extend elbows - Maintain control")
    elif predicted in ["hammer curl","barbell biceps curl"]:
        ea = (ang(11,13,15)+ang(12,14,16))/2
        ss = abs(pose[11][1]-pose[12][1])
        if ss>0.05: feedbacks.append("⚠️ Shoulders uneven - Stabilize your body")
        if ea>150: feedbacks.append("⚠️ Curl higher - Full range of motion")
    elif predicted=="push-up":
        ba = ang(11,23,27)
        if ba<160: feedbacks.append("⚠️ Back is sagging - Keep body straight")
    elif predicted=="plank":
        hh = (pose[23][1]+pose[24][1])/2
        sh = (pose[11][1]+pose[12][1])/2
        if abs(hh-sh)>0.1: feedbacks.append("⚠️ Hips too high or low - Keep straight line")
    elif predicted=="pull up":
        ea = (ang(11,13,15)+ang(12,14,16))/2
        if ea>120: feedbacks.append("⚠️ Pull higher - Full range of motion")
    elif predicted=="shoulder press":
        ea = (ang(11,13,15)+ang(12,14,16))/2
        if ea<80: feedbacks.append("⚠️ Press higher - Full range of motion")
    if not feedbacks: feedbacks.append("✅ Great form! Keep it up")
    return feedbacks

POSITION_RULES = {
    "squat":"standing","deadlift":"standing","hammer curl":"standing",
    "barbell biceps curl":"standing","lateral raise":"standing",
    "romanian deadlift":"standing","t bar row":"standing",
    "tricep pushdown":"standing","pull up":"standing",
    "hip thrust":"lying","bench press":"lying","push-up":"lying",
    "plank":"lying","leg raises":"lying","decline bench press":"lying",
    "incline bench press":"lying","lat pulldown":"sitting",
    "leg extension":"sitting","chest fly machine":"sitting",
    "russian twist":"sitting","tricep dips":"sitting",
}
CURL_CLASSES = {"hammer curl","barbell biceps curl"}

# ================== PREDICT ==================

def predict_from_frames(frames):
    sequence = []
    last_kp  = None
    for frame in frames:
        kp = extract_keypoints(frame)
        if kp is None:
            kp = last_kp if last_kp is not None else np.zeros(140, dtype=np.float32)
        else:
            last_kp = kp.copy()
        sequence.append(kp)
    while len(sequence)<NUM_FRAMES:
        sequence.append(sequence[-1].copy())
    sequence = np.array(sequence[:NUM_FRAMES], dtype=np.float32)

    motion     = compute_motion(sequence)
    seq_scaled = scaler.transform(sequence)
    seq_input  = seq_scaled.reshape(1,NUM_FRAMES,140)
    pred       = model.predict(seq_input, verbose=0)[0]
    pred_idx   = int(np.argmax(pred))
    confidence = float(pred[pred_idx])
    predicted  = actions[pred_idx]
    top3        = np.argsort(pred)[-3:][::-1]
    top3_labels = [actions[i] for i in top3]

    predicted = fix_similar(predicted, sequence, pred, top3_labels)

    position          = check_position(sequence)
    expected_position = POSITION_RULES.get(predicted)
    if expected_position:
        if expected_position=="lying" and position=="standing":
            return {"error": f"⚠️ {predicted} requires lying position!"}
        elif expected_position=="standing" and position=="lying":
            return {"error": f"⚠️ {predicted} requires standing position!"}

    if confidence<0.55:
        return {"error": "❓ Unknown exercise or unclear movement"}

    if predicted in CURL_CLASSES:
        hand_result = check_hand_grip(frames)
        if hand_result:
            bi = actions.index("barbell biceps curl")
            hi = actions.index("hammer curl")
            mb = float(pred[bi]); mh = float(pred[hi])
            ct = mb+mh+1e-6
            bv = 0.35*(mb/ct)+0.65*(1.0 if hand_result=="barbell biceps curl" else 0.0)
            hv = 0.35*(mh/ct)+0.65*(1.0 if hand_result=="hammer curl" else 0.0)
            predicted  = "barbell biceps curl" if bv>=hv else "hammer curl"
            confidence = max(bv,hv)

    quality  = validate_quality(frames, sequence)
    dtw_res  = check_dtw(sequence, predicted)
    feedback = get_specific_feedback(sequence, predicted)

    return {
        "exercise":   predicted,
        "confidence": round(confidence,2),
        "level":      dtw_res[0],
        "dtw_note":   dtw_res[1],
        "feedback":   feedback,
        "quality":    quality,
    }

def print_result(result):
    print("\n" + "="*50)
    if "error" in result:
        print(f"❌ {result['error']}")
        return
    print(f"✅ {t('exercise')}: {result['exercise'].upper()} ({result['confidence']:.0%})")
    print(f"📊 {t('level')}:    {result['level']}")
    print(f"💡 {t('feedback')}:")
    for fb in result['feedback']:
        print(f"   {fb}")
    if result['quality']:
        print(f"📷 {t('quality')}:")
        for q in result['quality']:
            print(f"   {q}")
    print("="*50)

# ================== SAMPLE FRAMES ==================

def sample_frames_from_video(video_path):
    cap   = cv2.VideoCapture(video_path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total<5:
        cap.release()
        return []
    frame_ids = np.linspace(0, total-1, NUM_FRAMES, dtype=int)
    frames    = []
    for fid in frame_ids:
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(fid))
        ret, frame = cap.read()
        if ret: frames.append(frame)
    cap.release()
    return frames

# ================== LIVE CAMERA ==================

def check_random_movement(frames_recorded):
    if len(frames_recorded) < NUM_FRAMES:
        return True, "عدد الـ frames قليل جداً"
    kps = []
    for frame in frames_recorded[::max(1, len(frames_recorded)//NUM_FRAMES)][:NUM_FRAMES]:
        kp = extract_keypoints(frame)
        if kp is not None:
            kps.append(kp)
    if len(kps) < 5:
        return True, "لم يتم الكشف عن الجسم بشكل كافٍ"
    kps = np.array(kps)
    wrist_y = kps[:, :132].reshape(len(kps), 33, 4)[:, 15, 1]
    if len(wrist_y) > 2:
        direction_changes = int(np.sum(np.diff(np.sign(np.diff(wrist_y))) != 0))
        if direction_changes > 8:
            return True, "الحركة عشوائية وغير منتظمة"
    motion = float(np.std(wrist_y))
    if motion < 0.005:
        return True, "لا توجد حركة كافية"
    return False, ""


def show_instructions():
    print("\n" + "="*50)
    print("📋 تعليمات التسجيل الصحيح:")
    print("="*50)
    print("  📏 المسافة:  ابتعد 1.5-2 متر عن الكاميرا")
    print("  💡 الإضاءة:  تأكد من إضاءة جيدة أمامك")
    print("  📹 الكاميرا: ثبتها في مكان ثابت")
    print("  🧍 الوضعية:  يجب أن يظهر جسمك كاملاً")
    print("  🔄 الحركة:   افعل التمرين بشكل منتظم ومتسلسل")
    print("  ⏱️  المدة:    سجل 5-10 ثوانٍ من التمرين")
    print("="*50)
    print("\n▶️  اضغط SPACE للبدء | Q للإيقاف والتحليل")


def record_and_analyze(retry=0):
    if retry == 0:
        show_instructions()
    else:
        print(f"\n🔄 المحاولة {retry + 1}")
        show_instructions()

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Camera not found!")
        return

    fourcc          = cv2.VideoWriter_fourcc(*'mp4v')
    out_path        = "recorded_exercise.mp4"
    fps             = 30
    w               = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h               = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out             = cv2.VideoWriter(out_path, fourcc, fps, (w, h))
    recording       = False
    frames_recorded = []

    while True:
        ret, frame = cap.read()
        if not ret: break
        display = frame.copy()
        if recording:
            out.write(frame)
            frames_recorded.append(frame.copy())
            cv2.circle(display, (30, 30), 15, (0, 0, 255), -1)
            cv2.putText(display, f"REC {len(frames_recorded)//fps}s",
                       (50, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)
        else:
            cv2.putText(display, "SPACE = Start Recording",
                       (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)
        cv2.putText(display, "Q = Stop & Analyze",
                   (10, h-60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)
        cv2.putText(display, "Keep full body in frame!",
                   (10, h-30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,255,255), 2)
        cv2.imshow("Smart Gym - Live Analysis", display)
        key = cv2.waitKey(1) & 0xFF
        if key == ord(' '):
            recording = True
            print("🔴 Recording started...")
        elif key == ord('q') or key == ord('Q'):
            break

    cap.release()
    out.release()
    cv2.destroyAllWindows()

    if not frames_recorded:
        print("❌ No frames recorded!")
        return

    print(f"✅ {t('saved')}: {out_path} ({len(frames_recorded)} frames)")
    print(f"\n{t('analyzing')}...")

    # تحقق من الحركة
    is_random, random_reason = check_random_movement(frames_recorded)
    if is_random:
        print(f"\n⚠️ الحركة غير صالحة: {random_reason}")
        print("\n📋 يرجى تصحيح الآتي:")
        print("  1️⃣  تأكد أن جسمك كاملاً في إطار الكاميرا")
        print("  2️⃣  افعل التمرين بحركة منتظمة ومتسلسلة")
        print("  3️⃣  ثبت الكاميرا في مكان ثابت")
        print("  4️⃣  تأكد من الإضاءة الجيدة")
        if retry < 2:
            again = input("\n🔄 هل تريد إعادة التسجيل؟ (y/n): ").strip().lower()
            if again in ['y', 'yes', 'نعم']:
                record_and_analyze(retry=retry+1)
                return
        else:
            print("\n❌ تم تجاوز عدد المحاولات")
            return

    if len(frames_recorded) >= NUM_FRAMES:
        indices = np.linspace(0, len(frames_recorded)-1, NUM_FRAMES, dtype=int)
        frames  = [frames_recorded[i] for i in indices]
    else:
        frames = frames_recorded

    result = predict_from_frames(frames)

    if "quality" in result and result["quality"]:
        critical = [q for q in result["quality"] if
                   any(w in q.lower() for w in ["moving","lighting","close","far"])]
        if len(critical) >= 2 and retry < 2:
            print("\n⚠️ جودة الفيديو غير كافية!")
            for q in result["quality"]:
                print(f"   {q}")
            again = input("\n🔄 هل تريد إعادة التسجيل؟ (y/n): ").strip().lower()
            if again in ['y', 'yes', 'نعم']:
                record_and_analyze(retry=retry+1)
                return

    print_result(result)

# ================== RECOMMENDATION ==================

from recommend import get_recommendations, print_plan, get_user_input

# ================== MAIN MENU ==================

def main():
    print("\n" + "="*60)
    print(f"🏋️  {t('welcome')}")
    print(f"🌍 Language: {LANG.upper()}")
    print("="*60)

    while True:
        print(f"\n📋 {t('menu')}:")
        print(f"  1. {t('opt1')}")
        print(f"  2. {t('opt2')}")
        print(f"  3. {t('opt3')}")
        print(f"  4. {t('opt4')}")

        choice = input(f"\n{t('choose')}").strip()

        if choice == "1":
            # توصيات التمارين
            user_info       = get_user_input()
            recommendations = get_recommendations(
                goal_en        = user_info["goal_en"],
                level_en       = user_info["level_en"],
                target_muscles = user_info["target_muscles"],
                equipment_list = user_info["equipment_list"],
                n=6
            )
            print_plan(user_info, recommendations)

        elif choice == "2":
            # تحليل فيديو
            video_path = input(f"\n📁 {t('enter_video')}").strip().strip('"')
            if not os.path.exists(video_path):
                print(f"❌ {t('no_video')}: {video_path}")
                continue
            print(f"\n{t('analyzing')}...")
            frames = sample_frames_from_video(video_path)
            if not frames:
                print("❌ Could not read video!")
                continue
            result = predict_from_frames(frames)
            print_result(result)

        elif choice == "3":
            # كاميرا لايف
            record_and_analyze()

        elif choice == "4":
            print("\n👋 Goodbye! / مع السلامة!")
            break
        else:
            print("❌ Invalid choice!")

if __name__ == "__main__":
    main()
