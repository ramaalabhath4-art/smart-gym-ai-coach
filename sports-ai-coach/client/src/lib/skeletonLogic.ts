/**
 * Skeleton Logic - حساب الزوايا والمقارنة بين الحركات
 */

export interface Keypoint {
  x: number;
  y: number;
  confidence: number;
}

export interface SkeletonData {
  keypoints: Keypoint[];
  angles: Record<string, number>;
}

// تعريف الهيكل العظمي (17 نقطة من MediaPipe)
export const SKELETON_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],           // Head
  [5, 6], [5, 7], [7, 9], [9, 11],          // Left arm
  [6, 8], [8, 10], [10, 12],                // Right arm
  [5, 11], [6, 12],                         // Torso
  [11, 13], [13, 15],                       // Left leg
  [12, 14], [14, 16],                       // Right leg
];

// الزوايا المهمة لكل تمرين
export const EXERCISE_ANGLES: Record<string, Record<string, [number, number]>> = {
  Squat: {
    leftKnee: [70, 100],      // الركبة اليسرى: 70-100 درجة
    rightKnee: [70, 100],     // الركبة اليمنى: 70-100 درجة
    backAngle: [160, 180],    // زاوية الظهر: 160-180 درجة (مستقيم)
  },
  PushUp: {
    leftElbow: [60, 90],      // الكوع الأيسر: 60-90 درجة
    rightElbow: [60, 90],     // الكوع الأيمن: 60-90 درجة
    backAngle: [170, 180],    // الظهر مستقيم تماماً
  },
  Deadlift: {
    backAngle: [170, 180],    // الظهر مستقيم
    hipAngle: [60, 90],       // زاوية الورك
  },
};

/**
 * حساب الزاوية بين 3 نقاط
 */
export function calculateAngle(
  pointA: Keypoint,
  pointB: Keypoint,
  pointC: Keypoint
): number {
  const radians =
    Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
    Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);

  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360 - angle;
  }

  return angle;
}

/**
 * حساب المسافة بين نقطتين
 */
export function calculateDistance(pointA: Keypoint, pointB: Keypoint): number {
  return Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
}

/**
 * استخراج الزوايا المهمة من الهيكل العظمي
 */
export function extractAngles(keypoints: Keypoint[]): Record<string, number> {
  const angles: Record<string, number> = {};

  // الركبة اليسرى (نقاط: 11, 13, 15)
  if (keypoints[11] && keypoints[13] && keypoints[15]) {
    angles.leftKnee = calculateAngle(keypoints[11], keypoints[13], keypoints[15]);
  }

  // الركبة اليمنى (نقاط: 12, 14, 16)
  if (keypoints[12] && keypoints[14] && keypoints[16]) {
    angles.rightKnee = calculateAngle(keypoints[12], keypoints[14], keypoints[16]);
  }

  // الكوع الأيسر (نقاط: 5, 7, 9)
  if (keypoints[5] && keypoints[7] && keypoints[9]) {
    angles.leftElbow = calculateAngle(keypoints[5], keypoints[7], keypoints[9]);
  }

  // الكوع الأيمن (نقاط: 6, 8, 10)
  if (keypoints[6] && keypoints[8] && keypoints[10]) {
    angles.rightElbow = calculateAngle(keypoints[6], keypoints[8], keypoints[10]);
  }

  // زاوية الظهر (نقاط: 5, 11, 13 أو 6, 12, 14)
  if (keypoints[5] && keypoints[11] && keypoints[13]) {
    angles.backAngle = calculateAngle(keypoints[5], keypoints[11], keypoints[13]);
  }

  // زاوية الورك (نقاط: 11, 13, 15)
  if (keypoints[11] && keypoints[13] && keypoints[15]) {
    angles.hipAngle = calculateAngle(keypoints[11], keypoints[13], keypoints[15]);
  }

  return angles;
}

/**
 * مقارنة الزوايا مع الزوايا المثالية
 */
export function compareAngles(
  userAngles: Record<string, number>,
  exerciseType: string
): { corrections: string[]; score: number } {
  const corrections: string[] = [];
  const idealAngles = EXERCISE_ANGLES[exerciseType] || {};
  let correctCount = 0;
  let totalAngles = 0;

  for (const [angleName, [min, max]] of Object.entries(idealAngles)) {
    const userAngle = userAngles[angleName];

    if (userAngle === undefined) continue;

    totalAngles++;

    if (userAngle < min) {
      corrections.push(`${angleName}: زيادة الزاوية (حالياً: ${userAngle.toFixed(1)}°، المثالي: ${min}-${max}°)`);
    } else if (userAngle > max) {
      corrections.push(`${angleName}: تقليل الزاوية (حالياً: ${userAngle.toFixed(1)}°، المثالي: ${min}-${max}°)`);
    } else {
      correctCount++;
    }
  }

  const score = totalAngles > 0 ? (correctCount / totalAngles) * 100 : 0;

  return { corrections, score };
}

/**
 * رسم الهيكل العظمي على Canvas
 */
export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  color: string = "#00ff00",
  lineWidth: number = 2
): void {
  // رسم الخطوط
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  for (const [start, end] of SKELETON_CONNECTIONS) {
    const startPoint = keypoints[start];
    const endPoint = keypoints[end];

    if (startPoint && endPoint && startPoint.confidence > 0.5 && endPoint.confidence > 0.5) {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    }
  }

  // رسم النقاط
  keypoints.forEach((keypoint, idx) => {
    if (keypoint.confidence > 0.5) {
      ctx.fillStyle = keypoint.confidence > 0.8 ? color : "#ffff00";
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
      ctx.fill();

      // رسم رقم النقطة
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(idx.toString(), keypoint.x + 8, keypoint.y);
    }
  });
}

/**
 * إنشاء هيكل عظمي مثالي (نموذج) لتمرين معين
 */
export function getIdealSkeleton(exerciseType: string): Keypoint[] {
  // نموذج مثالي لـ Squat (يمكن تخصيصه حسب التمرين)
  const idealSkeletons: Record<string, Keypoint[]> = {
    Squat: [
      { x: 320, y: 100, confidence: 1 },   // 0: nose
      { x: 320, y: 120, confidence: 1 },   // 1: left eye
      { x: 330, y: 120, confidence: 1 },   // 2: right eye
      { x: 315, y: 120, confidence: 1 },   // 3: left ear
      { x: 335, y: 120, confidence: 1 },   // 4: right ear
      { x: 300, y: 180, confidence: 1 },   // 5: left shoulder
      { x: 340, y: 180, confidence: 1 },   // 6: right shoulder
      { x: 280, y: 260, confidence: 1 },   // 7: left elbow
      { x: 360, y: 260, confidence: 1 },   // 8: right elbow
      { x: 270, y: 320, confidence: 1 },   // 9: left wrist
      { x: 370, y: 320, confidence: 1 },   // 10: right wrist
      { x: 290, y: 320, confidence: 1 },   // 11: left hip
      { x: 350, y: 320, confidence: 1 },   // 12: right hip
      { x: 280, y: 420, confidence: 1 },   // 13: left knee
      { x: 360, y: 420, confidence: 1 },   // 14: right knee
      { x: 280, y: 500, confidence: 1 },   // 15: left ankle
      { x: 360, y: 500, confidence: 1 },   // 16: right ankle
    ],
    PushUp: [
      { x: 320, y: 100, confidence: 1 },
      { x: 320, y: 120, confidence: 1 },
      { x: 330, y: 120, confidence: 1 },
      { x: 315, y: 120, confidence: 1 },
      { x: 335, y: 120, confidence: 1 },
      { x: 250, y: 200, confidence: 1 },
      { x: 390, y: 200, confidence: 1 },
      { x: 200, y: 250, confidence: 1 },
      { x: 440, y: 250, confidence: 1 },
      { x: 180, y: 280, confidence: 1 },
      { x: 460, y: 280, confidence: 1 },
      { x: 280, y: 320, confidence: 1 },
      { x: 360, y: 320, confidence: 1 },
      { x: 270, y: 420, confidence: 1 },
      { x: 370, y: 420, confidence: 1 },
      { x: 260, y: 500, confidence: 1 },
      { x: 380, y: 500, confidence: 1 },
    ],
  };

  return idealSkeletons[exerciseType] || idealSkeletons.Squat;
}

/**
 * حساب درجة التشابه بين هيكلين عظميين (DTW-like approach)
 */
export function calculateSimilarityScore(
  userSkeleton: Keypoint[],
  idealSkeleton: Keypoint[]
): number {
  let totalDistance = 0;
  let validPoints = 0;

  for (let i = 0; i < Math.min(userSkeleton.length, idealSkeleton.length); i++) {
    const userPoint = userSkeleton[i];
    const idealPoint = idealSkeleton[i];

    if (userPoint && idealPoint && userPoint.confidence > 0.5) {
      const distance = calculateDistance(userPoint, idealPoint);
      totalDistance += distance;
      validPoints++;
    }
  }

  if (validPoints === 0) return 0;

  const averageDistance = totalDistance / validPoints;
  // تحويل المسافة إلى درجة (0-100)
  const score = Math.max(0, 100 - averageDistance / 5);

  return Math.min(100, score);
}
