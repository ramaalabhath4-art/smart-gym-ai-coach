import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getDb, savePaymentAccount, getPaymentAccount, updatePaymentAccount } from "./db";
import { messages, analysisHistory, users, resultsChat, generalChat, errorAnalytics } from "../drizzle/schema";
import { eq, desc, avg, count, sql } from "drizzle-orm";
import { sendPaymentNotificationEmail } from "./email";

// ================== Python API URL ==================
const PYTHON_API = process.env.PYTHON_API_URL || "http://localhost:8000";

// ================== TRANSLATION HELPERS ==================

const LEVEL_TRANSLATIONS: Record<string, Record<string, string>> = {
  "ممتاز ⭐⭐⭐": { en: "Excellent ⭐⭐⭐", fr: "Excellent ⭐⭐⭐", de: "Ausgezeichnet ⭐⭐⭐", es: "Excelente ⭐⭐⭐", zh: "优秀 ⭐⭐⭐", ar: "ممتاز ⭐⭐⭐" },
  "جيد ⭐⭐":      { en: "Good ⭐⭐",      fr: "Bien ⭐⭐",      de: "Gut ⭐⭐",            es: "Bien ⭐⭐",      zh: "良好 ⭐⭐",   ar: "جيد ⭐⭐" },
  "مقبول ⭐":     { en: "Acceptable ⭐", fr: "Acceptable ⭐", de: "Akzeptabel ⭐",      es: "Aceptable ⭐", zh: "及格 ⭐",    ar: "مقبول ⭐" },
  "يحتاج تدريب ⚠️": { en: "Needs Training ⚠️", fr: "Besoin d'entraînement ⚠️", de: "Braucht Training ⚠️", es: "Necesita entrenamiento ⚠️", zh: "需要训练 ⚠️", ar: "يحتاج تدريب ⚠️" },
};

const DTW_TRANSLATIONS: Record<string, Record<string, string>> = {
  "أداء رائع! استمر هكذا":          { en: "Great performance! Keep it up",                    fr: "Excellente performance! Continuez", de: "Tolle Leistung! Weiter so",            es: "¡Excelente rendimiento! Sigue así",     zh: "表现出色！继续保持" },
  "أداء جيد مع بعض التحسينات":      { en: "Good performance with some improvements needed",   fr: "Bonne performance avec améliorations", de: "Gute Leistung, Verbesserungen nötig", es: "Buen rendimiento, mejoras necesarias",  zh: "表现良好，需要改进" },
  "تحتاج لتحسين الأداء":            { en: "Performance needs improvement",                    fr: "La performance nécessite des améliorations", de: "Leistung muss verbessert werden", es: "El rendimiento necesita mejorar",       zh: "表现需要改进" },
  "راجع طريقة أداء التمرين":        { en: "Please review your exercise technique",            fr: "Veuillez revoir votre technique", de: "Bitte Übungstechnik überprüfen",        es: "Por favor revise su técnica",           zh: "请检查您的运动技术" },
};

const CORRECTION_TRANSLATIONS: Record<string, Record<string, string>> = {
  "⚠️ الركبة منحنية كثيراً - لا تتجاوز أصابع القدم": { en: "⚠️ Knees bending too much — don't go past your toes",      fr: "⚠️ Genoux trop fléchis",     de: "⚠️ Knie zu stark gebeugt",     es: "⚠️ Rodillas demasiado dobladas", zh: "⚠️ 膝盖弯曲太多" },
  "⚠️ الظهر منحني - حافظ على استقامة الظهر":          { en: "⚠️ Back is rounded — keep your back straight",            fr: "⚠️ Dos arrondi",             de: "⚠️ Rücken gerundet",           es: "⚠️ Espalda redondeada",          zh: "⚠️ 背部弯曲" },
  "⚠️ المرفق منحني كثيراً - اخفض الثقل أكثر":         { en: "⚠️ Elbow bent too much — lower the weight more",          fr: "⚠️ Coude trop fléchi",        de: "⚠️ Ellbogen zu gebeugt",       es: "⚠️ Codo muy doblado",            zh: "⚠️ 肘部弯曲太多" },
  "⚠️ لا تمد المرفق بالكامل":                         { en: "⚠️ Don't fully extend the elbow",                         fr: "⚠️ Ne pas étendre le coude",  de: "⚠️ Ellbogen nicht strecken",   es: "⚠️ No extiendas el codo",        zh: "⚠️ 不要完全伸直肘部" },
  "⚠️ الكتفان غير متوازيان - ثبت جسمك":               { en: "⚠️ Shoulders uneven — stabilize your body",               fr: "⚠️ Épaules inégales",         de: "⚠️ Schultern ungleich",         es: "⚠️ Hombros desiguales",          zh: "⚠️ 肩膀不平衡" },
  "⚠️ ارفع الثقل أعلى - نطاق حركة كامل":             { en: "⚠️ Curl higher — full range of motion",                   fr: "⚠️ Montez plus haut",         de: "⚠️ Höher heben",               es: "⚠️ Sube más — rango completo",   zh: "⚠️ 举得更高" },
  "⚠️ الظهر منحني - حافظ على جسم مستقيم":            { en: "⚠️ Back sagging — keep body in a straight line",          fr: "⚠️ Dos affaissé",             de: "⚠️ Rücken hängend",            es: "⚠️ Espalda caída",               zh: "⚠️ 背部下垂" },
  "⚠️ الحوض مرتفع أو منخفض - حافظ على خط مستقيم":  { en: "⚠️ Hips too high or low — keep a straight line",          fr: "⚠️ Hanches mal positionnées", de: "⚠️ Hüften falsch positioniert", es: "⚠️ Caderas mal alineadas",       zh: "⚠️ 髋部位置不对" },
  "⚠️ ارفع جسمك أعلى - نطاق حركة كامل":             { en: "⚠️ Pull higher — full range of motion",                   fr: "⚠️ Tirez plus haut",          de: "⚠️ Höher ziehen",              es: "⚠️ Tira más alto",               zh: "⚠️ 拉得更高" },
  "⚠️ المرفق منخفض جداً - ارفع الثقل أعلى":          { en: "⚠️ Elbow too low — press the weight higher",              fr: "⚠️ Coude trop bas",           de: "⚠️ Ellbogen zu tief",          es: "⚠️ Codo demasiado bajo",         zh: "⚠️ 肘部太低" },
  "⚠️ ارفع الحوض أعلى - نطاق حركة كامل":            { en: "⚠️ Raise hips higher — full range of motion",             fr: "⚠️ Levez les hanches",        de: "⚠️ Hüften höher heben",        es: "⚠️ Levanta más las caderas",     zh: "⚠️ 抬高髋部" },
  "⚠️ ارفع الذراعين أعلى - نطاق حركة كامل":          { en: "⚠️ Raise arms higher — full range of motion",             fr: "⚠️ Levez les bras plus haut", de: "⚠️ Arme höher heben",          es: "⚠️ Levanta los brazos más",      zh: "⚠️ 手臂举得更高" },
  "⚠️ اسحب أكثر لأسفل - نطاق حركة كامل":            { en: "⚠️ Pull down more — full range of motion",                fr: "⚠️ Tirez davantage vers le bas", de: "⚠️ Weiter nach unten ziehen", es: "⚠️ Tira más hacia abajo",       zh: "⚠️ 向下拉得更多" },
  "✅ الأداء صحيح! استمر":                           { en: "✅ Great form! Keep it up",                                fr: "✅ Bonne forme! Continuez",   de: "✅ Gute Form! Weiter so",       es: "✅ ¡Buena forma! Sigue así",     zh: "✅ 动作正确！继续" },
  // ================== VIDEO QUALITY ==================
  "⚠️ الكاميرا تتحرك - ثبّت الكاميرا على حامل":    { en: "⚠️ Camera is moving — use a tripod",                     fr: "⚠️ Caméra bouge — utilisez un trépied", de: "⚠️ Kamera bewegt sich — Stativ verwenden", es: "⚠️ Cámara en movimiento — use trípode", zh: "⚠️ 相机在移动——使用三脚架" },
  "⚠️ الحركة غير منتظمة - كرر التمرين بشكل صحيح":  { en: "⚠️ Irregular movement — repeat exercise correctly",        fr: "⚠️ Mouvement irrégulier",    de: "⚠️ Unregelmäßige Bewegung",    es: "⚠️ Movimiento irregular",       zh: "⚠️ 动作不规律" },
  "⚠️ الإضاءة ضعيفة - تأكد من الإضاءة الجيدة":     { en: "⚠️ Poor lighting — ensure good lighting",                 fr: "⚠️ Mauvais éclairage",       de: "⚠️ Schlechte Beleuchtung",     es: "⚠️ Iluminación deficiente",     zh: "⚠️ 光线不足" },
  "⚠️ أنت بعيد جداً - اقترب من الكاميرا":           { en: "⚠️ Too far from camera — move closer",                    fr: "⚠️ Trop loin de la caméra",  de: "⚠️ Zu weit von der Kamera",    es: "⚠️ Muy lejos de la cámara",     zh: "⚠️ 离相机太远" },
  "⚠️ أنت قريب جداً - ابتعد قليلاً":               { en: "⚠️ Too close to camera — move back",                      fr: "⚠️ Trop près de la caméra",  de: "⚠️ Zu nah an der Kamera",      es: "⚠️ Muy cerca de la cámara",     zh: "⚠️ 离相机太近" },
  "⚠️ لا توجد حركة كافية - تأكد أنك تؤدي التمرين": { en: "⚠️ Not enough movement — make sure you are exercising",    fr: "⚠️ Pas assez de mouvement",  de: "⚠️ Nicht genug Bewegung",      es: "⚠️ Movimiento insuficiente",    zh: "⚠️ 运动不足" },
};

function translateLevel(level: string | null, lang: string): string | null {
  if (!level || lang === "ar") return level;
  for (const [ar, translations] of Object.entries(LEVEL_TRANSLATIONS)) {
    if (level.includes(ar)) return translations[lang] ?? translations["en"] ?? level;
  }
  return level;
}

function translateDTW(feedback: string | null, lang: string): string | null {
  if (!feedback || lang === "ar") return feedback;
  for (const [ar, translations] of Object.entries(DTW_TRANSLATIONS)) {
    if (feedback.includes(ar)) return translations[lang] ?? translations["en"] ?? feedback;
  }
  return feedback;
}

function translateCorrections(corrections: string[], lang: string): string[] {
  if (lang === "ar") return corrections;
  return corrections.map(c => {
    for (const [ar, translations] of Object.entries(CORRECTION_TRANSLATIONS)) {
      if (c.includes(ar)) return translations[lang] ?? translations["en"] ?? c;
    }
    return c;
  });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    getUserById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db.select({ id: users.id, name: users.name, email: users.email, subscription: users.subscription })
          .from(users).where(eq(users.id, input.id)).limit(1);
        return result[0] ?? null;
      }),

    getUserByEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const result = await db.select({ id: users.id, name: users.name, email: users.email })
          .from(users).where(eq(users.email, input.email)).limit(1);
        return result[0] ?? null;
      }),

    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    updateProfile: publicProcedure
      .input(z.object({
        name:  z.string().min(2),
        email: z.string().email(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) return { success: false, error: "not_authenticated" };
        const db = await getDb();
        if (!db) return { success: false, error: "db_unavailable" };
        await db.update(users)
          .set({ name: input.name, email: input.email })
          .where(eq(users.id, ctx.user.id));
        // إرسال إشعار لـ n8n
        try {
          const userRow = await db.select({ email: users.email, name: users.name })
            .from(users).where(eq(users.id, input.userId)).limit(1);
          const userEmail = userRow[0]?.email ?? "";
          const userName  = userRow[0]?.name  ?? "User";

          await fetch("http://localhost:5678/webhook-test/gym-analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId:    input.userId,
              exercise:  input.exercise,
              level:     input.level ?? null,
              userEmail,
              userName,
              timestamp: new Date().toISOString(),
            }),
            signal: AbortSignal.timeout(3000),
          });
        } catch (e) {
          console.error("[n8n] webhook error:", e);
        }

        return { success: true };
      }),

    updateSubscription: publicProcedure
      .input(z.object({
        plan: z.enum(["free", "pro", "elite"]),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return { success: false, error: "db_unavailable" };

        if (ctx.user) {
          const updateData: any = { subscription: input.plan };
          if (input.email) updateData.email = input.email;
          await db.update(users)
            .set(updateData)
            .where(eq(users.id, ctx.user.id));
        } else if (input.email) {
          // تحقق إذا الإيميل مسجل مسبقاً
          const existing = await db.select().from(users)
            .where(eq(users.email, input.email)).limit(1);
          if (existing.length > 0 && existing[0].subscription === input.plan) {
            return { success: false, error: "already_subscribed" };
          }
          await db.update(users)
            .set({ subscription: input.plan })
            .where(eq(users.email, input.email));
        }
        return { success: true, plan: input.plan };
      }),

    deleteAccount: publicProcedure
      .mutation(async ({ ctx }) => {
        if (!ctx.user) return { success: false };
        const db = await getDb();
        if (!db) return { success: false };
        await db.delete(users).where(eq(users.id, ctx.user.id));
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
        return { success: true };
      }),
  }),

  analysis: router({

    // ================== حفظ نتيجة التحليل ==================
    saveAnalysis: publicProcedure
      .input(z.object({
        userId:        z.number(),
        exercise:      z.string(),
        confidence:    z.number().default(0),
        similarityScore: z.number().default(0),
        level:         z.string().nullable().optional(),
        dtwDistance:   z.number().nullable().optional(),
        corrections:   z.array(z.string()).default([]),
        qualityIssues: z.array(z.string()).default([]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.insert(analysisHistory).values({
          userId:          input.userId,
          exerciseClass:   input.exercise,
          confidence:      Math.round(input.confidence * 100),
          similarityScore: input.similarityScore,
          level:           input.level ?? null,
          dtwDistance:     input.dtwDistance ?? null,
          corrections:     JSON.stringify(input.corrections),
          qualityIssues:   JSON.stringify(input.qualityIssues),
        });
        await db.update(users)
          .set({
            totalSessions:  sql`${users.totalSessions} + 1`,
            totalExercises: sql`${users.totalExercises} + 1`,
          })
          .where(eq(users.id, input.userId));
        return { success: true };
      }),

    // ================== HEALTH CHECK للـ Python API ==================
    checkPythonApi: publicProcedure.query(async () => {
      try {
        const res = await fetch(`${PYTHON_API}/api/health`, { signal: AbortSignal.timeout(3000) });
        const data = await res.json();
        return { online: true, modelsLoaded: data.models_loaded ?? false };
      } catch {
        return { online: false, modelsLoaded: false };
      }
    }),

    // ================== تحليل الفيديو الحقيقي ==================
    analyzeVideo: publicProcedure
      .input(z.object({
        videoBase64: z.string(),
        mimeType:    z.string().default("video/mp4"),
        userId:      z.number().optional(),
        language:    z.string().default("en"),
        source:      z.enum(["camera", "upload"]).default("upload"),
      }))
      .mutation(async ({ input }) => {
        const buffer   = Buffer.from(input.videoBase64, "base64");
        const mimeType = input.mimeType || "video/mp4";
        const filename = mimeType.includes("webm") ? "exercise.webm" : "exercise.mp4";

        const boundary = `----FormBoundary${Date.now()}`;
        const header = Buffer.from(
          `--${boundary}\r\nContent-Disposition: form-data; name="video"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`
        );
        const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
        const body   = Buffer.concat([header, buffer, footer]);

        let pyResult: any;
        try {
          const res = await fetch(`${PYTHON_API}/api/analyze?source=${input.source ?? "upload"}`, {
            method:  "POST",
            headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
            body:    body,
            signal:  AbortSignal.timeout(60000),
          });
          pyResult = await res.json();
        } catch (err: any) {
          throw new Error(`Python API غير متاح: ${err.message}. تأكدي من تشغيل api_server.py`);
        }

        if (pyResult.error) {
          // ترجم رسالة الخطأ حسب اللغة
          const lang = input.language ?? "en";
          const errMsg = lang === "de" ? (pyResult.error_de ?? pyResult.error)
                       : lang === "ar" ? (pyResult.error_ar ?? pyResult.error)
                       : pyResult.error;
          throw new Error(errMsg);
        }

        // حفظ في قاعدة البيانات إذا كان المستخدم مسجل دخول
        if (input.userId) {
          try {
            const db = await getDb();
            if (db) {
              const corrections    = pyResult.corrections   ?? [];
              const qualityIssues  = pyResult.quality_issues ?? [];
              await db.insert(analysisHistory).values({
                userId:          input.userId,
                exerciseClass:   pyResult.className   ?? "unknown",
                confidence:      Math.round((pyResult.confidence ?? 0) * 100),
                similarityScore: pyResult.dtw_distance != null
                  ? Math.max(0, Math.round(100 - pyResult.dtw_distance / 15))
                  : 0,
                level:           pyResult.level        ?? null,
                dtwDistance:     pyResult.dtw_distance ?? null,
                corrections:     JSON.stringify(corrections),
                qualityIssues:   JSON.stringify(qualityIssues),
              });
              // تحديث إحصائيات المستخدم
              await db.update(users)
                .set({
                  totalSessions:  sql`${users.totalSessions}  + 1`,
                  totalExercises: sql`${users.totalExercises} + 1`,
                })
                .where(eq(users.id, input.userId));
            }
          } catch (dbErr) {
            console.error("[DB] فشل حفظ التحليل:", dbErr);
            // لا نوقف النتيجة بسبب خطأ DB
          }
        }

        const lang = input.language ?? "en";
        return {
          className:    pyResult.className    ?? "Unknown",
          confidence:   pyResult.confidence   ?? 0,
          level:        translateLevel(pyResult.level ?? null, lang),
          dtw_feedback: translateDTW(pyResult.dtw_feedback ?? null, lang),
          dtw_distance: pyResult.dtw_distance ?? null,
          corrections:  translateCorrections(pyResult.corrections ?? [], lang),
          qualityIssues: translateCorrections(pyResult.quality_issues ?? [], lang),
          keypoints:    [],
        };
      }),

    // ================== توصيات التمارين ==================
    getRecommendations: publicProcedure
      .input(z.object({
        goal_en:        z.string().default("fitness"),
        level_en:       z.string().default("beginner"),
        target_muscles: z.array(z.string()).default(["chest"]),
        equipment_list: z.array(z.string()).default(["no equipment"]),
      }))
      .mutation(async ({ input }) => {
        try {
          const res = await fetch(`${PYTHON_API}/api/recommend`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(input),
            signal:  AbortSignal.timeout(10000),
          });
          const data = await res.json();
          return data.recommendations ?? [];
        } catch {
          return [];
        }
      }),

    // ================== سجل التحليلات ==================
    getHistory: publicProcedure
      .input(z.object({ limit: z.number().default(20), userId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        const uid = ctx.user?.id ?? input.userId;
        if (!db || !uid) return [];
        const rows = await db
          .select()
          .from(analysisHistory)
          .where(eq(analysisHistory.userId, uid))
          .orderBy(desc(analysisHistory.createdAt))
          .limit(input.limit);
        return rows.map(r => ({
          ...r,
          corrections:  r.corrections  ? JSON.parse(r.corrections)  : [],
          qualityIssues: r.qualityIssues ? JSON.parse(r.qualityIssues) : [],
        }));
      }),

    // ================== إحصائيات الداشبورد ==================
    getStats: publicProcedure
      .input(z.object({ userId: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
      const db = await getDb();
      const uid = ctx.user?.id ?? input?.userId;
      if (!db || !uid) return {
        totalSessions: 0, avgScore: 0, streak: 0,
        bestExercise: null, mostErrors: null,
        weeklyProgress: [], exerciseBreakdown: [],
      };

      // Total sessions + avg score
      const [row] = await db
        .select({
          total:    count(analysisHistory.id),
          avgScore: avg(analysisHistory.similarityScore),
        })
        .from(analysisHistory)
        .where(eq(analysisHistory.userId, uid));

      // Last 7 sessions for progress chart
      const last28 = await db
        .select({
          similarityScore: analysisHistory.similarityScore,
          createdAt:       analysisHistory.createdAt,
          exercise:        analysisHistory.exerciseClass,
        })
        .from(analysisHistory)
        .where(eq(analysisHistory.userId, uid))
        .orderBy(desc(analysisHistory.createdAt))
        .limit(28);

      // Group by week
      const weekMap = new Map<string, { scores: number[], exercise: string }>();
      last28.forEach(r => {
        const d = new Date(r.createdAt);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const weekKey = `W${Math.ceil(weekStart.getDate() / 7)} ${weekStart.toLocaleDateString("en-US", { month: "short" })}`;
        if (!weekMap.has(weekKey)) weekMap.set(weekKey, { scores: [], exercise: r.exercise ?? "" });
        weekMap.get(weekKey)!.scores.push(r.similarityScore ?? 0);
      });
      const weeklyProgressData = Array.from(weekMap.entries()).slice(0, 4).reverse().map(([week, data]) => ({
        date: week,
        score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        exercise: data.exercise,
      }));

      // إذا كل الـ scores = 0 → استخدم confidence
      const allZero = weeklyProgressData.every(r => r.score === 0);
      if (allZero) {
        const last28conf = await db
          .select({ confidence: analysisHistory.confidence, createdAt: analysisHistory.createdAt, exercise: analysisHistory.exerciseClass })
          .from(analysisHistory).where(eq(analysisHistory.userId, uid))
          .orderBy(desc(analysisHistory.createdAt)).limit(28);
        const confMap = new Map<string, number[]>();
        last28conf.forEach(r => {
          const d = new Date(r.createdAt);
          const weekStart = new Date(d);
          weekStart.setDate(d.getDate() - d.getDay());
          const key = `W${Math.ceil(weekStart.getDate() / 7)} ${weekStart.toLocaleDateString("en-US", { month: "short" })}`;
          if (!confMap.has(key)) confMap.set(key, []);
          confMap.get(key)!.push(r.confidence ?? 0);
        });
        weeklyProgressData.forEach((r, i) => {
          const scores = confMap.get(r.date);
          if (scores) weeklyProgressData[i].score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        });
      }

      // Most practiced exercise
      const exerciseRows = await db
        .select({
          exercise: analysisHistory.exerciseClass,
          cnt:      count(analysisHistory.id),
          avgConf:  avg(analysisHistory.confidence),
        })
        .from(analysisHistory)
        .where(eq(analysisHistory.userId, uid))
        .groupBy(analysisHistory.exerciseClass)
        .orderBy(desc(count(analysisHistory.id)))
        .limit(5);

      // Most common errors
      const errorRows = await db
        .select()
        .from(errorAnalytics)
        .where(eq(errorAnalytics.userId, uid))
        .orderBy(desc(errorAnalytics.count))
        .limit(3);

      return {
        totalSessions:     Number(row?.total ?? 0),
        avgScore:          Math.round(Number(row?.avgScore ?? 0)),
        streak:            0,
        weeklyProgress:    weeklyProgressData,
        exerciseBreakdown: exerciseRows.map(r => ({
          exercise: r.exercise,
          count:    Number(r.cnt),
          avgScore: Math.round(Number(r.avgConf ?? 0)),
        })),
        topErrors: errorRows.map(r => ({
          exercise:  r.exercise,
          errorText: r.errorText,
          count:     r.count,
        })),
        bestExercise: exerciseRows[0]?.exercise ?? null,
      };
    }),

    // ================== RAG Chat ==================
    chat: publicProcedure
      .input(
        z.object({
          message: z.string(),
          analysisResult: z.object({
            className:   z.string(),
            confidence:  z.number(),
            corrections: z.array(z.string()).optional(),
            level:       z.string().nullable().optional(),
          }),
          language: z.string().default("en"),
          chatType: z.enum(["analysis", "general"]).default("analysis"),
          userName: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const res = await fetch(`${PYTHON_API}/api/chat`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question:      input.message,
              language:      input.language,
              type:          input.chatType,
              exercise_name: input.analysisResult.className,
              confidence:    input.analysisResult.confidence,
              level:         input.analysisResult.level ?? "",
              corrections:   input.analysisResult.corrections ?? [],
              user_name:     input.userName ?? null,
            }),
            signal: AbortSignal.timeout(40000),
          });
          const data = await res.json();
          return { message: data.message ?? "Could not generate response." };
        } catch (err: any) {
          return {
            message: input.language === "ar"
              ? "عذراً، حدث خطأ في الاتصال. تأكدي من تشغيل api_server.py"
              : "Sorry, connection error. Make sure api_server.py is running."
          };
        }
      }),
  }),

  chat: router({
    getMessages: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db
        .select()
        .from(messages)
        .orderBy(desc(messages.createdAt))
        .limit(50);

      return result.reverse().map(msg => ({
        ...msg,
        userName: "User",
      }));
    }),

    sendMessage: protectedProcedure
      .input(z.object({ content: z.string().min(1).max(500) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db || !ctx.user) throw new Error("Database or user not available");

        await db.insert(messages).values({
          userId: ctx.user.id,
          content: input.content,
        });

        return {
          id: Math.random(),
          userId: ctx.user.id,
          content: input.content,
          createdAt: new Date(),
        };
      }),
  }),

  payment: router({
    savePaymentAccount: protectedProcedure
      .input(z.object({
        cardholderName: z.string().min(1),
        cardNumber: z.string().regex(/^\d{13,19}$/),
        expiryDate: z.string().regex(/^\d{2}\/\d{2}$/),
        cvv: z.string().regex(/^\d{3,4}$/),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await savePaymentAccount(ctx.user.id, input);
        return {
          success: !!result,
          lastFourDigits: result?.lastFourDigits,
          message: result ? "Payment account saved successfully" : "Failed to save payment account",
        };
      }),

    getPaymentAccount: protectedProcedure
      .query(async ({ ctx }) => {
        const account = await getPaymentAccount(ctx.user.id);
        if (!account) return null;
        
        return {
          id: account.id,
          cardholderName: account.cardholderName,
          lastFourDigits: account.lastFourDigits,
          isDefault: account.isDefault,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
        };
      }),

    updatePaymentAccount: protectedProcedure
      .input(z.object({
        cardholderName: z.string().min(1).optional(),
        cardNumber: z.string().regex(/^\d{13,19}$/).optional(),
        expiryDate: z.string().regex(/^\d{2}\/\d{2}$/).optional(),
        cvv: z.string().regex(/^\d{3,4}$/).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await updatePaymentAccount(ctx.user.id, input);
        return {
          success: !!result,
          lastFourDigits: result?.lastFourDigits,
          message: result ? "Payment account updated successfully" : "Failed to update payment account",
        };
      }),

    notifyAutoRenewal: protectedProcedure
      .input(z.object({
        enabled: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        const account = await getPaymentAccount(ctx.user.id);
        if (!account) {
          return { success: false, message: "No payment account found" };
        }

        await sendPaymentNotificationEmail({
          cardholderName: account.cardholderName,
          lastFourDigits: account.lastFourDigits,
          expiryDate: "••••",
          action: input.enabled ? "autorenew_enabled" : "autorenew_disabled",
          userEmail: ctx.user.email || undefined,
          timestamp: new Date(),
        });

        return {
          success: true,
          message: input.enabled ? "Auto-renewal enabled" : "Auto-renewal disabled",
        };
      }),
  }),

  // ================== RESULTS CHAT ==================
  resultsChat: router({

    // Save message from inner chat (AnalysisResult page)
    save: publicProcedure
      .input(z.object({
        analysisId:  z.number().optional(),
        exercise:    z.string(),
        confidence:  z.number().default(0),
        level:       z.string().nullable().optional(),
        userMessage: z.string(),
        aiResponse:  z.string(),
        language:    z.string().default("en"),
        userId:      z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return { success: false };
        const uid = ctx.user?.id ?? input.userId;
        if (!uid) return { success: false };
        await db.insert(resultsChat).values({
          userId:      uid,
          analysisId:  input.analysisId,
          exercise:    input.exercise,
          confidence:  Math.round(input.confidence * 100),
          level:       input.level ?? null,
          userMessage: input.userMessage,
          aiResponse:  input.aiResponse,
          language:    input.language,
        });
        return { success: true };
      }),

    // Get results chat history for a user
    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db || !ctx.user) return [];
        return await db
          .select()
          .from(resultsChat)
          .where(eq(resultsChat.userId, ctx.user.id))
          .orderBy(desc(resultsChat.createdAt))
          .limit(input.limit);
      }),
  }),

  // ================== GENERAL CHAT ==================
  generalChat: router({

    // Save message from outer chat (AdvancedAnalysis page)
    save: protectedProcedure
      .input(z.object({
        sessionId:   z.string(),
        sessionName: z.string().optional(),
        userMessage: z.string(),
        aiResponse:  z.string(),
        language:    z.string().default("en"),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db || !ctx.user) return { success: false };
        await db.insert(generalChat).values({
          userId:      ctx.user.id,
          sessionId:   input.sessionId,
          sessionName: input.sessionName ?? "Chat",
          userMessage: input.userMessage,
          aiResponse:  input.aiResponse,
          language:    input.language,
        });
        return { success: true };
      }),

    // Get general chat history
    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db || !ctx.user) return [];
        return await db
          .select()
          .from(generalChat)
          .where(eq(generalChat.userId, ctx.user.id))
          .orderBy(desc(generalChat.createdAt))
          .limit(input.limit);
      }),

    // Get sessions list
    getSessions: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db || !ctx.user) return [];
      const rows = await db
        .select()
        .from(generalChat)
        .where(eq(generalChat.userId, ctx.user.id))
        .orderBy(desc(generalChat.createdAt));
      // Group by sessionId
      const sessions: Record<string, any> = {};
      for (const row of rows) {
        if (!sessions[row.sessionId ?? ""]) {
          sessions[row.sessionId ?? ""] = {
            sessionId:   row.sessionId,
            sessionName: row.sessionName,
            createdAt:   row.createdAt,
            messages:    [],
          };
        }
        sessions[row.sessionId ?? ""].messages.push(row);
      }
      return Object.values(sessions);
    }),
  }),

  // ================== ERROR ANALYTICS ==================
  errorAnalytics: router({

    // Save errors from analysis (called internally)
    saveErrors: protectedProcedure
      .input(z.object({
        exercise:   z.string(),
        corrections: z.array(z.string()),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db || !ctx.user) return { success: false };
        for (const errorText of input.corrections) {
          if (errorText.includes("✅")) continue; // Skip positive feedback
          // Check if error exists
          const existing = await db
            .select()
            .from(errorAnalytics)
            .where(
              eq(errorAnalytics.userId,    ctx.user.id),
            )
            .limit(1);
          if (existing.length > 0) {
            await db.update(errorAnalytics)
              .set({
                count:    sql`${errorAnalytics.count} + 1`,
                lastSeen: new Date(),
              })
              .where(eq(errorAnalytics.id, existing[0].id));
          } else {
            await db.insert(errorAnalytics).values({
              userId:    ctx.user.id,
              exercise:  input.exercise,
              errorText: errorText,
              count:     1,
            });
          }
        }
        return { success: true };
      }),

    // Get user's most common errors
    getMyErrors: protectedProcedure
      .input(z.object({ limit: z.number().default(5) }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db || !ctx.user) return [];
        return await db
          .select()
          .from(errorAnalytics)
          .where(eq(errorAnalytics.userId, ctx.user.id))
          .orderBy(desc(errorAnalytics.count))
          .limit(input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
