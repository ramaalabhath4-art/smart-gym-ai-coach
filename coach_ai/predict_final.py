import os
import cv2
import mediapipe as mp
import numpy as np
import joblib
from tensorflow.keras.models import load_model
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

import pathlib
os.chdir(pathlib.Path(__file__).parent)

model = load_model("model_lstm_final.keras", compile=False)
scaler  = joblib.load("scaler.pkl")
encoder = joblib.load("encoder.pkl")
actions = list(encoder.classes_)

try:
    references = np.load("references.npy", allow_pickle=True).item()
    print(f"✅ References loaded: {len(references)} exercises")
except:
    references = {}
    print("No references - run build_references.py first")

NUM_FRAMES = 15

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
    if landmarks is None:
        return False
    if np.any(np.isnan(landmarks)) or np.any(np.isinf(landmarks)):
        return False
    visibility = landmarks[:, 3]
    return np.mean(visibility) >= 0.5 and np.sum(visibility > 0.5) >= 20

def extract_keypoints(frame):
    rgb      = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result   = pose_detector.detect(mp_image)
    if not result.pose_landmarks:
        return None
    lm = np.array([[l.x, l.y, l.z, l.visibility] for l in result.pose_landmarks[0]])
    if not is_good_frame(lm):
        return None
    norm   = normalize_pose(lm)
    angles = compute_angles(lm[:, :3])
    return np.concatenate([norm, angles]).astype(np.float32)

def fix_similar_exercises(predicted, sequence, pred, top3_labels):
    pose = sequence[7][:132].reshape(33, 4)
    if predicted == "deadlift":
        left_knee  = calculate_angle(pose[23][:3], pose[25][:3], pose[27][:3])
        right_knee = calculate_angle(pose[24][:3], pose[26][:3], pose[28][:3])
        knee_angle = (left_knee + right_knee) / 2
        print(f"  [Fix] Knee angle: {knee_angle:.1f}")
        if knee_angle > 120:
            print(f"  [Fix] deadlift → romanian deadlift ✅")
            return "romanian deadlift"
    if predicted == "bench press":
        shoulder_y = (pose[11][1] + pose[12][1]) / 2
        hip_y      = (pose[23][1] + pose[24][1]) / 2
        tilt       = shoulder_y - hip_y
        print(f"  [Fix] Body tilt: {tilt:.3f}")
        if "decline bench press" in top3_labels:
            decline_prob = float(pred[actions.index("decline bench press")])
            incline_prob = float(pred[actions.index("incline bench press")])
            print(f"  [Fix] decline_prob: {decline_prob:.3f} | incline_prob: {incline_prob:.3f}")
            if decline_prob > incline_prob and decline_prob > 0.05:
                print(f"  [Fix] bench press → decline bench press ✅")
                return "decline bench press"
        if abs(tilt) > 0.08:
            print(f"  [Fix] bench press → incline bench press ✅")
            return "incline bench press"
    if predicted == "leg extension":
        shoulder_y    = (pose[11][1] + pose[12][1]) / 2
        ankle_y       = (pose[27][1] + pose[28][1]) / 2
        hip_in_top3   = "hip thrust" in top3_labels
        hip_prob      = float(pred[actions.index("hip thrust")]) if "hip thrust" in actions else 0.0
        is_horizontal = abs(shoulder_y - ankle_y) < 0.40
        print(f"  [Fix] is_horizontal: {is_horizontal} | hip_prob: {hip_prob:.3f}")
        if is_horizontal or hip_prob > 0.05 or hip_in_top3:
            print(f"  [Fix] leg extension → hip thrust ✅")
            return "hip thrust"
    if predicted == "t bar row":
        wrist_dist = abs(pose[15][0] - pose[16][0])
        print(f"  [Fix] t bar row wrist_dist: {wrist_dist:.3f}")
        if wrist_dist < 0.25:
            print(f"  [Fix] t bar row → unknown_exercise ✅")
            return "unknown_exercise"
    return predicted

def dtw_distance(seq1, seq2):
    n, m      = len(seq1), len(seq2)
    dtw       = np.full((n + 1, m + 1), np.inf)
    dtw[0, 0] = 0
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost      = np.linalg.norm(seq1[i-1] - seq2[j-1])
            dtw[i, j] = cost + min(dtw[i-1, j], dtw[i, j-1], dtw[i-1, j-1])
    return dtw[n, m]

def check_form_with_dtw(sequence, predicted):
    if predicted not in references:
        return None, None, None
    reference  = references[predicted]
    seq_angles = sequence[:, 132:]
    ref_angles = reference[:, 132:]
    distance   = dtw_distance(seq_angles, ref_angles)
    if distance < 500:
        level    = "ممتاز ⭐⭐⭐"
        feedback = "أداء رائع! استمر هكذا"
    elif distance < 1000:
        level    = "جيد ⭐⭐"
        feedback = "أداء جيد مع بعض التحسينات"
    elif distance < 1500:
        level    = "مقبول ⭐"
        feedback = "تحتاج لتحسين الأداء"
    else:
        level    = "يحتاج تدريب ⚠️"
        feedback = "راجع طريقة أداء التمرين"
    return level, feedback, distance

def get_specific_feedback(sequence, predicted):
    pose = sequence[7][:132].reshape(33, 4)
    def angle_at(a, b, c):
        return calculate_angle(pose[a][:3], pose[b][:3], pose[c][:3])
    feedbacks = []
    if predicted in ["squat", "deadlift", "romanian deadlift"]:
        knee_angle = (angle_at(23, 25, 27) + angle_at(24, 26, 28)) / 2
        back_angle = angle_at(11, 23, 25)
        if knee_angle < 80:
            feedbacks.append("⚠️ الركبة منحنية كثيراً - لا تتجاوز أصابع القدم")
        if back_angle < 150:
            feedbacks.append("⚠️ الظهر منحني - حافظ على استقامة الظهر")
    elif predicted in ["bench press", "incline bench press", "decline bench press"]:
        elbow_angle = (angle_at(11, 13, 15) + angle_at(12, 14, 16)) / 2
        if elbow_angle < 70:
            feedbacks.append("⚠️ المرفق منحني كثيراً - اخفض الثقل أكثر")
        if elbow_angle > 160:
            feedbacks.append("⚠️ لا تمد المرفق بالكامل")
    elif predicted in ["hammer curl", "barbell biceps curl"]:
        elbow_angle        = (angle_at(11, 13, 15) + angle_at(12, 14, 16)) / 2
        shoulder_stability = abs(pose[11][1] - pose[12][1])
        if shoulder_stability > 0.05:
            feedbacks.append("⚠️ الكتفان غير متوازيان - ثبت جسمك")
        if elbow_angle > 150:
            feedbacks.append("⚠️ ارفع الثقل أعلى - نطاق حركة كامل")
    elif predicted == "push-up":
        back_angle = angle_at(11, 23, 27)
        if back_angle < 160:
            feedbacks.append("⚠️ الظهر منحني - حافظ على جسم مستقيم")
    elif predicted == "plank":
        hip_height      = (pose[23][1] + pose[24][1]) / 2
        shoulder_height = (pose[11][1] + pose[12][1]) / 2
        if abs(hip_height - shoulder_height) > 0.1:
            feedbacks.append("⚠️ الحوض مرتفع أو منخفض - حافظ على خط مستقيم")
    elif predicted == "pull up":
        elbow_angle = (angle_at(11, 13, 15) + angle_at(12, 14, 16)) / 2
        if elbow_angle > 120:
            feedbacks.append("⚠️ ارفع جسمك أعلى - نطاق حركة كامل")
    elif predicted == "shoulder press":
        elbow_angle = (angle_at(11, 13, 15) + angle_at(12, 14, 16)) / 2
        if elbow_angle < 80:
            feedbacks.append("⚠️ المرفق منخفض جداً - ارفع الثقل أعلى")
    elif predicted == "hip thrust":
        hip_height      = (pose[23][1] + pose[24][1]) / 2
        shoulder_height = (pose[11][1] + pose[12][1]) / 2
        if hip_height > shoulder_height + 0.1:
            feedbacks.append("⚠️ ارفع الحوض أعلى - نطاق حركة كامل")
    elif predicted == "lateral raise":
        elbow_angle = (angle_at(11, 13, 15) + angle_at(12, 14, 16)) / 2
        if elbow_angle < 150:
            feedbacks.append("⚠️ ارفع الذراعين أعلى - نطاق حركة كامل")
    elif predicted == "lat pulldown":
        elbow_angle = (angle_at(11, 13, 15) + angle_at(12, 14, 16)) / 2
        if elbow_angle > 120:
            feedbacks.append("⚠️ اسحب أكثر لأسفل - نطاق حركة كامل")
    if not feedbacks:
        feedbacks.append("✅ الأداء صحيح! استمر")
    return feedbacks

def compute_motion(sequence):
    poses       = sequence[:, :132].reshape(NUM_FRAMES, 33, 4)
    left_wrist  = poses[:, 15, :2]
    right_wrist = poses[:, 16, :2]
    left_knee   = poses[:, 25, :2]
    right_knee  = poses[:, 26, :2]
    left_hip    = poses[:, 23, :2]
    right_hip   = poses[:, 24, :2]
    nose        = poses[:, 0,  :2]
    left_shoulder  = poses[:, 11, :2]
    right_shoulder = poses[:, 12, :2]
    def speed(p):
        return float(np.mean(np.linalg.norm(np.diff(p, axis=0), axis=1)))
    def sync(p1, p2):
        if np.std(p1[:, 1]) < 1e-6 or np.std(p2[:, 1]) < 1e-6:
            return 0.0
        return float(np.corrcoef(p1[:, 1], p2[:, 1])[0, 1])
    def rng(p):
        return float(np.max(p[:, 1]) - np.min(p[:, 1]))
    return {
        "wrist_speed_left":  speed(left_wrist),
        "wrist_speed_right": speed(right_wrist),
        "wrist_sync":        sync(left_wrist, right_wrist),
        "knee_range":        (rng(left_knee) + rng(right_knee)) / 2,
        "hip_range":         (rng(left_hip)  + rng(right_hip))  / 2,
        "wrist_speed_diff":  abs(speed(left_wrist) - speed(right_wrist)),
        "head_range":        rng(nose),
        "shoulder_range":    (rng(left_shoulder) + rng(right_shoulder)) / 2,
        "body_speed":        (speed(left_wrist) + speed(right_wrist) + speed(left_hip) + speed(right_hip)) / 4,
    }

def is_unknown(predicted, confidence, motion, position, top3_labels, sequence):
    if predicted == "unknown_exercise":
        return True, "حركة غير معروفة"
    if confidence < 0.40:
        return True, "ثقة منخفضة جداً — يرجى تكرار التمرين بشكل صحيح"
    total_motion = (
        motion.get("knee_range", 0) + motion.get("hip_range", 0) +
        motion.get("wrist_speed_left", 0) + motion.get("wrist_speed_right", 0) +
        motion.get("shoulder_range", 0)
    )
    if total_motion < 0.02:
        return True, "لا توجد حركة كافية — يرجى تكرار التمرين"
    head_range  = motion.get("head_range", 0)
    body_speed  = motion.get("body_speed", 0)
    wrist_left  = motion.get("wrist_speed_left", 0)
    wrist_right = motion.get("wrist_speed_right", 0)
    if head_range > 0.02 and body_speed < 0.005 and wrist_left < 0.005 and wrist_right < 0.005:
        return True, "حركة الرأس فقط لا تُعدّ تمريناً"
    if predicted == "t bar row" and position == "standing":
        pose = sequence[7][:132].reshape(33, 4)
        back_angle = calculate_angle(pose[11][:3], pose[23][:3], pose[25][:3])
        print(f"  [Unknown] t bar row back_angle: {back_angle:.1f}")
        if back_angle > 140:
            print(f"  [Unknown] t bar row → unknown (squat no weight) ✅")
            return True, "حركة غير معروفة"
    if confidence < 0.55:
        if position == "lying" and predicted in {"push-up", "plank"}:
            pass
        elif position == "lying" and "plank" in top3_labels:
            return False, ""
        else:
            return True, "ثقة منخفضة"
    if predicted == "squat" and motion["knee_range"] < 0.02:
        return True, "حركة الركبة صغيرة جداً للـ squat"
    if predicted == "deadlift" and motion["hip_range"] < 0.005:
        return True, "حركة الحوض صغيرة جداً للـ deadlift"
    if predicted in {"hammer curl", "barbell biceps curl"}:
        avg_speed = (motion["wrist_speed_left"] + motion["wrist_speed_right"]) / 2
        if avg_speed < 0.005:
            return True, "اليدان لا تتحركان"
    if predicted == "leg raises" and position == "standing":
        return True, "قد يكون squat بدون أوزان - غير معروف"
    if predicted == "leg raises" and motion["knee_range"] > 0.10:
        return True, "حركة غير واضحة"
    if predicted in {"plank", "push-up"} and position == "standing":
        return True, f"{predicted} يجب أن يكون مستلقياً"
    return False, ""

def check_position(sequence):
    pose       = sequence[7][:132].reshape(33, 4)
    shoulder_y = (pose[11][1] + pose[12][1]) / 2
    ankle_y    = (pose[27][1] + pose[28][1]) / 2
    hip_y      = (pose[23][1] + pose[24][1]) / 2
    knee_y     = (pose[25][1] + pose[26][1]) / 2
    if abs(shoulder_y - ankle_y) < 0.25:
        return "lying"
    if abs(hip_y - knee_y) < 0.15:
        return "sitting"
    return "standing"

def check_hand_grip(frames):
    scores = []
    for frame in frames:
        rgb      = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result   = hand_detector.detect(mp_image)
        if not result.hand_landmarks:
            continue
        for hand_lm in result.hand_landmarks:
            index_mcp = np.array([hand_lm[5].x,  hand_lm[5].y])
            pinky_mcp = np.array([hand_lm[17].x, hand_lm[17].y])
            dx = abs(index_mcp[0] - pinky_mcp[0])
            dy = abs(index_mcp[1] - pinky_mcp[1])
            scores.append(1.0 if dy > dx else 0.0)
    if not scores:
        return None
    avg = np.mean(scores)
    print(f"  [Hand] avg: {avg:.2f}")
    if avg > 0.5:
        return "hammer curl"
    elif avg < 0.45:
        return "barbell biceps curl"
    return None

def check_standing_distance(sequence):
    pose        = sequence[7][:132].reshape(33, 4)
    left_ankle  = pose[27][:2]
    right_ankle = pose[28][:2]
    distance    = abs(left_ankle[0] - right_ankle[0])
    if distance < 0.05:
        return "feet_too_close"
    elif distance > 0.5:
        return "feet_too_wide"
    return "feet_ok"

POSITION_RULES = {
    "squat":               "standing",
    "deadlift":            "standing",
    "hammer curl":         "standing",
    "barbell biceps curl": "standing",
    "lateral raise":       "standing",
    "romanian deadlift":   "standing",
    "t bar row":           "standing",
    "tricep pushdown":     "standing",
    "pull up":             "standing",
    "hip thrust":          "lying",
    "bench press":         "lying",
    "push-up":             "lying",
    "plank":               "lying",
    "leg raises":          "lying",
    "decline bench press": "lying",
    "incline bench press": "lying",
}

CURL_CLASSES = {"hammer curl", "barbell biceps curl"}

# ================== MOVEMENT DIRECTION RULES ==================
MOVEMENT_RULES = {
    "squat":               {"primary": "vertical",   "joints": [23, 24, 25, 26], "min_range": 0.05},
    "deadlift":            {"primary": "vertical",   "joints": [23, 24, 11, 12], "min_range": 0.04},
    "romanian deadlift":   {"primary": "vertical",   "joints": [23, 24, 11, 12], "min_range": 0.04},
    "barbell biceps curl": {"primary": "vertical",   "joints": [15, 16, 13, 14], "min_range": 0.04},
    "hammer curl":         {"primary": "vertical",   "joints": [15, 16, 13, 14], "min_range": 0.04},
    "lateral raise":       {"primary": "horizontal", "joints": [15, 16, 13, 14], "min_range": 0.03},
    "shoulder press":      {"primary": "vertical",   "joints": [15, 16, 13, 14], "min_range": 0.04},
    "bench press":         {"primary": "vertical",   "joints": [15, 16, 13, 14], "min_range": 0.03},
    "incline bench press": {"primary": "vertical",   "joints": [15, 16, 13, 14], "min_range": 0.03},
    "decline bench press": {"primary": "vertical",   "joints": [15, 16, 13, 14], "min_range": 0.03},
    "push-up":             {"primary": "vertical",   "joints": [11, 12, 23, 24], "min_range": 0.03},
    "plank":               {"primary": "static",     "joints": [11, 12, 23, 24], "min_range": 0.00},
    "pull up":             {"primary": "vertical",   "joints": [11, 12, 13, 14], "min_range": 0.04},
    "lat pulldown":        {"primary": "vertical",   "joints": [13, 14, 15, 16], "min_range": 0.04},
    "t bar row":           {"primary": "vertical",   "joints": [13, 14, 15, 16], "min_range": 0.03},
    "hip thrust":          {"primary": "vertical",   "joints": [23, 24],         "min_range": 0.04},
    "leg extension":       {"primary": "vertical",   "joints": [25, 26, 27, 28], "min_range": 0.03},
    "leg raises":          {"primary": "vertical",   "joints": [25, 26, 27, 28], "min_range": 0.04},
    "tricep pushdown":     {"primary": "vertical",   "joints": [13, 14, 15, 16], "min_range": 0.03},
    "tricep dips":         {"primary": "vertical",   "joints": [11, 12, 13, 14], "min_range": 0.04},
    "chest fly machine":   {"primary": "horizontal", "joints": [13, 14, 15, 16], "min_range": 0.03},
    "russian twist":       {"primary": "horizontal", "joints": [11, 12, 15, 16], "min_range": 0.03},
}

def check_movement_direction(sequence, predicted):
    rule = MOVEMENT_RULES.get(predicted)
    if not rule:
        return True, ""
    poses = sequence[:, :132].reshape(NUM_FRAMES, 33, 4)
    joints    = rule["joints"]
    min_range = rule["min_range"]
    primary   = rule["primary"]
    if primary == "static":
        return True, ""
    vertical_ranges   = [float(np.max(poses[:, j, 1]) - np.min(poses[:, j, 1])) for j in joints]
    horizontal_ranges = [float(np.max(poses[:, j, 0]) - np.min(poses[:, j, 0])) for j in joints]
    avg_vertical   = float(np.mean(vertical_ranges))
    avg_horizontal = float(np.mean(horizontal_ranges))
    total_range    = avg_vertical + avg_horizontal
    print(f"  [Movement] {predicted}: vertical={avg_vertical:.3f} | horizontal={avg_horizontal:.3f} | required={primary}")
    if total_range < min_range:
        return False, "لا توجد حركة كافية للتمرين"
    if primary == "vertical" and avg_horizontal > avg_vertical * 2.0:
        return False, "الحركة جانبية — يجب أن تكون للأعلى والأسفل"
    if primary == "horizontal" and avg_vertical > avg_horizontal * 2.0:
        return False, "الحركة رأسية — يجب أن تكون جانبية"
    return True, ""

def validate_video_quality(frames, sequence, source="upload"):
    issues = []
    bg_diffs = []
    for i in range(1, len(frames)):
        diff = cv2.absdiff(
            cv2.cvtColor(frames[i-1], cv2.COLOR_BGR2GRAY),
            cv2.cvtColor(frames[i],   cv2.COLOR_BGR2GRAY)
        )
        bg_diffs.append(float(np.mean(diff)))
    avg_diff = float(np.mean(bg_diffs))
    if avg_diff > 40:
        issues.append("⚠️ الكاميرا تتحرك - ثبّت الكاميرا على حامل")
    poses   = sequence[:, :132].reshape(NUM_FRAMES, 33, 4)
    wrist_y = poses[:, 15, 1]
    direction_changes = int(np.sum(np.diff(np.sign(np.diff(wrist_y))) != 0))
    if source == "camera" and direction_changes > 8:
        issues.append("⚠️ الحركة غير منتظمة - كرر التمرين بشكل صحيح")
    visibility = sequence[:, :132].reshape(NUM_FRAMES, 33, 4)[:, :, 3]
    avg_vis    = float(np.mean(visibility))
    if avg_vis < 0.55:
        issues.append("⚠️ الإضاءة ضعيفة - تأكد من الإضاءة الجيدة")
    pose      = sequence[7][:132].reshape(33, 4)
    body_size = abs(pose[0][1] - pose[28][1])
    if body_size < 0.25:
        issues.append("⚠️ أنت بعيد جداً - اقترب من الكاميرا")
    elif body_size > 0.95:
        issues.append("⚠️ أنت قريب جداً - ابتعد قليلاً")
    wrist_motion = float(np.std(poses[:, 15, 1]) + np.std(poses[:, 16, 1]))
    if wrist_motion < 0.005:
        issues.append("⚠️ لا توجد حركة كافية - تأكد أنك تؤدي التمرين")
    return issues

def sample_frames(video_path, num_frames=15):
    cap   = cv2.VideoCapture(video_path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total < 5:
        cap.release()
        return []
    frame_ids = np.linspace(0, total - 1, num_frames, dtype=int)
    frames    = []
    for fid in frame_ids:
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(fid))
        ret, frame = cap.read()
        if ret:
            frames.append(frame)
    cap.release()
    return frames

def predict_video(video_path, source="upload"):
    if source == "camera":
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps
        cap.release()
        print(f"  [Camera] Duration: {duration:.1f}s | FPS: {fps} | Frames: {total_frames}")
        if duration < 5:
            return {
                "error": f"❌ Video zu kurz ({duration:.1f}s). Bitte mindestens 5 Sekunden aufnehmen.",
                "error_ar": f"❌ الفيديو قصير ({duration:.1f}ث). سجّل 5 ثواني على الأقل.",
                "error_de": f"❌ Video zu kurz ({duration:.1f}s). Bitte mindestens 5 Sekunden aufnehmen."
            }

    frames = sample_frames(video_path, NUM_FRAMES)
    if not frames:
        return {"error": "❌ Empty video"}

    sequence = []
    last_kp  = None
    for frame in frames:
        kp = extract_keypoints(frame)
        if kp is None:
            kp = last_kp if last_kp is not None else np.zeros(140, dtype=np.float32)
        else:
            last_kp = kp.copy()
        sequence.append(kp)

    while len(sequence) < NUM_FRAMES:
        sequence.append(sequence[-1].copy())

    sequence = np.array(sequence, dtype=np.float32)
    motion   = compute_motion(sequence)
    quality_issues = validate_video_quality(frames, sequence, source)

    if source == "camera":
        poses = sequence[:, :132].reshape(NUM_FRAMES, 33, 4)

        key_points = [11, 12, 23, 24, 25, 26, 27, 28, 15, 16]
        mid_frame  = poses[NUM_FRAMES // 2]
        key_vis    = [mid_frame[kp, 3] for kp in key_points]
        avg_key_vis   = float(np.mean(key_vis))
        visible_count = sum(1 for v in key_vis if v > 0.5)
        print(f"  [Keypoints] avg_vis: {avg_key_vis:.2f} | visible: {visible_count}/{len(key_points)}")
        if avg_key_vis < 0.4 or visible_count < 6:
            return {
                "error": "❌ Körper nicht vollständig sichtbar. Bitte weiter von der Kamera entfernen.",
                "error_ar": "❌ الجسم غير مرئي بالكامل. ابتعدي عن الكاميرا.",
                "error_de": "❌ Körper nicht vollständig sichtbar. Bitte weiter von der Kamera entfernen."
            }

        frame_diffs = [float(np.mean(np.abs(poses[i, :, :2] - poses[i-1, :, :2]))) for i in range(1, NUM_FRAMES)]
        avg_diff = float(np.mean(frame_diffs))
        std_diff = float(np.std(frame_diffs))
        print(f"  [Motion] avg={avg_diff:.4f} | std={std_diff:.4f} | ratio={std_diff/avg_diff:.2f}")
        if avg_diff < 0.002:
            return {
                "error": "❌ Keine Bewegung erkannt. Bitte Übung mehrmals wiederholen.",
                "error_ar": "❌ لم تُكتشف حركة. كرر التمرين عدة مرات.",
                "error_de": "❌ Keine Bewegung erkannt. Bitte Übung mehrmals wiederholen."
            }

        if std_diff > avg_diff * 1.2 and avg_diff < 0.08:
            return {
                "error": "❌ Bewegung zu unregelmäßig. Bitte Übung kontrolliert wiederholen.",
                "error_ar": "❌ الحركة عشوائية. أدِّي التمرين بشكل منتظم ومتكرر.",
                "error_de": "❌ Bewegung zu unregelmäßig. Bitte Übung kontrolliert wiederholen."
            }

        # تحقق من انتظام حركة المعصم (للكاميرا فقط)
        wrist_y_left  = poses[:, 15, 1]
        wrist_y_right = poses[:, 16, 1]
        changes_left  = int(np.sum(np.diff(np.sign(np.diff(wrist_y_left)))  != 0))
        changes_right = int(np.sum(np.diff(np.sign(np.diff(wrist_y_right))) != 0))
        avg_changes   = (changes_left + changes_right) / 2
        print(f"  [WristDir] changes_left={changes_left} | changes_right={changes_right} | avg={avg_changes:.1f}")
        if avg_changes > 10:
            return {
                "error": "❌ Bewegung zu unregelmäßig. Bitte Übung kontrolliert wiederholen.",
                "error_ar": "❌ الحركة عشوائية — كرري التمرين بشكل منتظم.",
                "error_de": "❌ Bewegung zu unregelmäßig. Bitte Übung kontrolliert wiederholen."
            }

        wrist_motion = float(np.std(poses[:, 15, 1]) + np.std(poses[:, 16, 1]))
        body_motion  = float(np.std(poses[:, 23, 1]) + np.std(poses[:, 24, 1]) +
                             np.std(poses[:, 11, 1]) + np.std(poses[:, 12, 1]))
        if wrist_motion > 0.05 and body_motion < 0.01:
            return {
                "error": "❌ Nur Handbewegung erkannt. Bitte Übung vollständig ausführen.",
                "error_ar": "❌ حركة الأيدي فقط. أدِّ التمرين بشكل كامل.",
                "error_de": "❌ Nur Handbewegung erkannt. Bitte Übung vollständig ausführen."
            }

        wrist_horizontal = float(np.std(poses[:, 15, 0]) + np.std(poses[:, 16, 0]))
        wrist_vertical   = float(np.std(poses[:, 15, 1]) + np.std(poses[:, 16, 1]))
        hip_horizontal   = float(np.std(poses[:, 23, 0]) + np.std(poses[:, 24, 0]))
        if wrist_horizontal > wrist_vertical * 1.5 and hip_horizontal > 0.03:
            return {
                "error": "❌ Seitliche Bewegung erkannt. Bitte die Übung korrekt ausführen.",
                "error_ar": "❌ حركة جانبية. أدِّ التمرين بشكل صحيح.",
                "error_de": "❌ Seitliche Bewegung erkannt. Bitte die Übung korrekt ausführen."
            }

    seq_scaled = scaler.transform(sequence)
    seq_input  = seq_scaled.reshape(1, NUM_FRAMES, 140)

    pred       = model.predict(seq_input, verbose=0)[0]
    pred_idx   = int(np.argmax(pred))
    confidence = float(pred[pred_idx])
    predicted  = actions[pred_idx]

    top3        = np.argsort(pred)[-3:][::-1]
    top3_labels = [actions[i] for i in top3]
    print(f"Top-3: {[(actions[i], round(float(pred[i]), 3)) for i in top3]}")
    print(f"Model: {predicted} ({confidence:.3f})")

    predicted = fix_similar_exercises(predicted, sequence, pred, top3_labels)

    position          = check_position(sequence)
    expected_position = POSITION_RULES.get(predicted)
    print(f"Position: {position} (expected: {expected_position})")

    if expected_position and source == "camera":
        if expected_position == "lying" and position == "standing":
            return {"error": "❓ Unknown exercise - wrong position"}
        elif expected_position == "standing" and position == "lying":
            return {"error": "❓ Unknown exercise - wrong position"}

    if source == "camera":
        unknown, reason = is_unknown(predicted, confidence, motion, position, top3_labels, sequence)
        if unknown:
            return {"error": f"❓ Unknown exercise - {reason}"}

        valid_movement, movement_reason = check_movement_direction(sequence, predicted)
        if not valid_movement:
            return {
                "error": f"❌ {movement_reason}",
                "error_ar": f"❌ {movement_reason}",
                "error_de": "❌ Falsche Bewegungsrichtung — bitte Übung korrekt ausführen."
            }

    if predicted in CURL_CLASSES:
        hand_result = check_hand_grip(frames)
        if hand_result:
            barbell_idx_enc = actions.index("barbell biceps curl")
            hammer_idx_enc  = actions.index("hammer curl")
            model_barbell   = float(pred[barbell_idx_enc])
            model_hammer    = float(pred[hammer_idx_enc])
            curl_total      = model_barbell + model_hammer + 1e-6
            barbell_vote = (0.35 * (model_barbell / curl_total) + 0.65 * (1.0 if hand_result == "barbell biceps curl" else 0.0))
            hammer_vote  = (0.35 * (model_hammer  / curl_total) + 0.65 * (1.0 if hand_result == "hammer curl" else 0.0))
            print(f"  [Vote] Barbell: {barbell_vote:.3f} | Hammer: {hammer_vote:.3f}")
            predicted  = "barbell biceps curl" if barbell_vote >= hammer_vote else "hammer curl"
            confidence = max(barbell_vote, hammer_vote)
        else:
            # اليد غير مكتشفة → نثق بالنموذج مباشرة
            print(f"  [Hand] not detected → trusting model: {predicted}")

    dtw_result = check_form_with_dtw(sequence, predicted)
    if dtw_result[0]:
        level, feedback, distance = dtw_result
        print(f"  [DTW] Distance: {distance:.1f} → {level}")
        if distance and (
            (source == "camera" and predicted == "barbell biceps curl" and distance > 800) or
            (source == "camera" and predicted == "hammer curl" and distance > 2000) or
            (source == "camera" and predicted not in CURL_CLASSES and distance > 1900) or
            (source == "camera" and (100 - distance / 15) <= 0) or
            (source == "upload" and distance > 2000)
        ):
            print(f"  [DTW] Distance too high ({distance:.1f}) → unknown exercise")
            return {
                "exercise":    "unknown_exercise",
                "confidence":  round(confidence, 2),
                "level":       None,
                "dtw_feedback": "الحركة غير معروفة — يرجى تكرار التمرين بشكل صحيح",
                "dtw_distance": round(distance, 1),
                "specific_feedbacks": [],
                "quality_issues": quality_issues,
            }
    else:
        level = feedback = distance = None

    return {
        "exercise":           predicted,
        "confidence":         round(confidence, 2),
        "level":              level,
        "dtw_feedback":       feedback,
        "dtw_distance":       round(distance, 1) if distance else None,
        "specific_feedbacks": get_specific_feedback(sequence, predicted),
        "quality_issues":     quality_issues,
    }