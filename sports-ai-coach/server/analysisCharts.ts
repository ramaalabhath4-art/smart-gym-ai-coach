/**
 * ملف مرجع: دوال لعرض مخططات بيانات التحليل من قاعدة البيانات
 * 
 * يمكن استخدام هذه الدوال كمثال لإنشاء endpoints في routers.ts
 */

/**
 * دالة لحساب إحصائيات الأداء من بيانات التحليل
 * @param analyses - مصفوفة من نتائج التحليل
 * @returns إحصائيات الأداء والرسم البياني
 */
export function calculateAnalysisStats(analyses: any[]) {
  if (analyses.length === 0) {
    return {
      success: false,
      message: "لا توجد بيانات تحليل",
      data: null,
    };
  }

  // استخراج البيانات
  const confidenceScores = analyses.map((a: any) => a.confidence || 0);
  const similarityScores = analyses.map((a: any) => a.similarityScore || 0);

  // حساب المتوسطات
  const avgConfidence =
    confidenceScores.reduce((a: number, b: number) => a + b, 0) / confidenceScores.length;
  const avgSimilarity =
    similarityScores.reduce((a: number, b: number) => a + b, 0) / similarityScores.length;
  const maxConfidence = Math.max(...confidenceScores);
  const minConfidence = Math.min(...confidenceScores);

  // تنسيق البيانات للرسم البياني
  const chartData = {
    labels: analyses.map((_: any, i: number) => `التحليل ${i + 1}`),
    datasets: [
      {
        label: "نسبة الثقة",
        data: confidenceScores,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
      {
        label: "درجة التشابه",
        data: similarityScores,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
      },
    ],
  };

  // إحصائيات الأداء
  const performanceStats = {
    totalAnalyses: analyses.length,
    averageConfidence: (avgConfidence * 100).toFixed(1),
    averageSimilarity: (avgSimilarity * 100).toFixed(1),
    maxConfidence: (maxConfidence * 100).toFixed(1),
    minConfidence: (minConfidence * 100).toFixed(1),
    improvementTrend:
      confidenceScores.length > 1
        ? (
            (
              (confidenceScores[confidenceScores.length - 1] -
                confidenceScores[0]) /
              confidenceScores[0]
            ) * 100
          ).toFixed(1)
        : "0",
  };

  return {
    success: true,
    data: {
      chartData,
      performanceStats,
      rawData: analyses,
    },
  };
}

/**
 * دالة لحساب مؤشرات الأداء الرئيسية
 */
export function calculatePerformanceMetrics(analyses: any[]) {
  if (analyses.length === 0) {
    return null;
  }

  const confidenceScores = analyses.map((a: any) => a.confidence || 0);
  const corrections = analyses.flatMap((a: any) => a.corrections || []);

  return {
    totalSessions: analyses.length,
    averageConfidence: (
      (confidenceScores.reduce((a: number, b: number) => a + b, 0) / confidenceScores.length) *
      100
    ).toFixed(1),
    commonIssues: corrections.slice(0, 5), // أكثر 5 مشاكل شيوعاً
    latestAnalysis: analyses[analyses.length - 1],
    improvementRate: calculateImprovementRate(confidenceScores),
  };
}

/**
 * دالة لحساب معدل التحسن
 */
function calculateImprovementRate(scores: number[]): string {
  if (scores.length < 2) return "0";

  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));

  const avgFirst = firstHalf.reduce((a: number, b: number) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a: number, b: number) => a + b, 0) / secondHalf.length;

  const improvement = ((avgSecond - avgFirst) / avgFirst) * 100;
  return improvement.toFixed(1);
}

/**
 * دالة لتصنيف مستوى الأداء
 */
export function classifyPerformanceLevel(confidence: number): {
  level: string;
  color: string;
  recommendation: string;
} {
  if (confidence >= 0.9) {
    return {
      level: "ممتاز",
      color: "#10b981",
      recommendation: "أداء رائعة! استمر في هذا المستوى",
    };
  } else if (confidence >= 0.75) {
    return {
      level: "جيد",
      color: "#3b82f6",
      recommendation: "أداء جيدة. يمكنك تحسينها أكثر",
    };
  } else if (confidence >= 0.6) {
    return {
      level: "متوسط",
      color: "#f59e0b",
      recommendation: "تحتاج إلى تحسين. انتبه للتفاصيل",
    };
  } else {
    return {
      level: "يحتاج تحسن",
      color: "#ef4444",
      recommendation: "ركز على تصحيح الأخطاء الأساسية",
    };
  }
}

/**
 * دالة لإنشاء بيانات رسم بياني للمقارنة بين الجلسات
 */
export function generateComparisonChart(analyses: any[]) {
  if (analyses.length < 2) {
    return null;
  }

  const categories = ["الثقة", "التشابه", "الدقة"];
  const datasets = analyses.slice(-5).map((analysis: any, index: number) => ({
    label: `الجلسة ${index + 1}`,
    data: [
      analysis.confidence * 100 || 0,
      analysis.similarityScore * 100 || 0,
      (analysis.corrections?.length || 0) > 0 ? 100 - (analysis.corrections.length * 10) : 100,
    ],
    borderColor: `hsl(${index * 60}, 70%, 50%)`,
    backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.1)`,
  }));

  return {
    labels: categories,
    datasets,
  };
}
