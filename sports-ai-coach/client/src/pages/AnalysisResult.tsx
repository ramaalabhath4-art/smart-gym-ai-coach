import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trophy, AlertTriangle, CheckCircle, Activity, Download, Save } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { AIChatBox, type Message } from "@/components/AIChatBox";

interface AnalysisData {
  className:     string;
  confidence:    number;
  level:         string | null;
  dtw_feedback:  string | null;
  dtw_distance:  number | null;
  corrections:   string[];
  qualityIssues: string[];
}

const T: Record<string, Record<string, string>> = {
  detectedExercise: { en: "Detected Exercise",      ar: "التمرين المُكتشف",       fr: "Exercice détecté",          de: "Erkannte Übung",            es: "Ejercicio detectado",        zh: "检测到的练习" },
  performanceLevel: { en: "Performance Level",      ar: "مستوى الأداء",           fr: "Niveau de performance",     de: "Leistungsniveau",           es: "Nivel de rendimiento",       zh: "表现水平" },
  similarityScore:  { en: "Similarity Score",       ar: "درجة التشابه",           fr: "Score de similarité",       de: "Ähnlichkeitswert",          es: "Puntuación de similitud",    zh: "相似度" },
  corrections:      { en: "Suggested Corrections",  ar: "التصحيحات المقترحة",     fr: "Corrections suggérées",     de: "Vorgeschlagene Korrekturen", es: "Correcciones sugeridas",     zh: "建议更正" },
  greatForm:        { en: "✅ Great form! Keep it up",ar: "✅ الأداء صحيح! استمري",fr: "✅ Bonne forme! Continuez", de: "✅ Gute Form! Weiter so",    es: "✅ ¡Buena forma! Sigue así", zh: "✅ 动作正确！继续" },
  videoQuality:     { en: "Video Quality Notes",    ar: "ملاحظات جودة الفيديو",   fr: "Notes de qualité vidéo",   de: "Videoqualitätshinweise",    es: "Notas de calidad de video",  zh: "视频质量说明" },
  aiCoach:          { en: "💬 AI Coach",            ar: "💬 كوتش AI",             fr: "💬 Coach IA",               de: "💬 KI-Trainer",              es: "💬 Coach IA",                zh: "💬 AI教练" },
  back:             { en: "Back",                   ar: "رجوع",                   fr: "Retour",                    de: "Zurück",                    es: "Atrás",                      zh: "返回" },
  downloadReport:   { en: "Download Report",        ar: "تحميل التقرير",          fr: "Télécharger rapport",       de: "Bericht herunterladen",     es: "Descargar informe",          zh: "下载报告" },
  dashboard:        { en: "Dashboard",              ar: "لوحة التحكم",            fr: "Tableau de bord",           de: "Dashboard",                 es: "Panel de control",           zh: "仪表板" },
  noResults:        { en: "No analysis results",    ar: "لا توجد نتائج تحليل",    fr: "Aucun résultat d'analyse", de: "Keine Analyseergebnisse",   es: "Sin resultados de análisis", zh: "没有分析结果" },
  startAnalysis:    { en: "Start Analysis",         ar: "ابدأ التحليل",           fr: "Commencer l'analyse",       de: "Analyse starten",           es: "Iniciar análisis",           zh: "开始分析" },
  askQuestion:      { en: "Ask about your exercise...", ar: "اسأليني عن تمرينك...", fr: "Posez une question...",  de: "Frage stellen...",          es: "Pregunta sobre tu ejercicio...", zh: "询问您的练习..." },
  saveData:         { en: "Save",                   ar: "حفظ",                    fr: "Enregistrer",               de: "Speichern",                 es: "Guardar",                    zh: "保存" },
  saved:            { en: "Saved ✓",                ar: "تم الحفظ ✓",             fr: "Enregistré ✓",              de: "Gespeichert ✓",             es: "Guardado ✓",                 zh: "已保存 ✓" },
  notDetermined:    { en: "Not determined",         ar: "غير محدد",               fr: "Non déterminé",             de: "Nicht bestimmt",            es: "No determinado",             zh: "未确定" },
  loginRequired:    { en: "Please sign in to save", ar: "سجّلي دخولك لحفظ البيانات", fr: "Connectez-vous pour enregistrer", de: "Bitte anmelden zum Speichern", es: "Inicia sesión para guardar", zh: "请登录以保存" },
};

export default function AnalysisResult() {
  const [, setLocation]    = useLocation();
  const { language }       = useLanguage();
  const [results, setResults]   = useState<AnalysisData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved]   = useState(false);
  const [saveMsg, setSaveMsg]   = useState("");

  const t = (key: string) => T[key]?.[language] ?? T[key]?.["en"] ?? key;

  const chatMutation    = trpc.analysis.chat.useMutation();
  const saveResultsChat = trpc.resultsChat.save.useMutation();
  const { data: authUser } = trpc.auth.me.useQuery();

  // Get username from auth or localStorage
  const storedName = (() => { try { return localStorage.getItem("userName") || null; } catch { return null; } })();
  const userName = authUser?.name ?? storedName ?? null;

  useEffect(() => {
    const stored = sessionStorage.getItem("lastAnalysis");
    if (!stored) return;
    const data: AnalysisData = JSON.parse(stored);
    setResults(data);

    // جلب الفيديو المحفوظ
    const savedVideoUrl = sessionStorage.getItem("lastVideoUrl");
    if (savedVideoUrl) setVideoUrl(savedVideoUrl);

    const greetings: Record<string, string> = {
      ar: userName ? `مرحباً ${userName}!` : "مرحباً!",
      en: userName ? `Hello ${userName}!` : "Hello!",
      fr: userName ? `Bonjour ${userName}!` : "Bonjour!",
      de: userName ? `Hallo ${userName}!` : "Hallo!",
      es: userName ? `¡Hola ${userName}!` : "¡Hola!",
      zh: userName ? `你好 ${userName}!` : "你好!",
    };
    const greeting = greetings[language] ?? greetings["en"];

    const levelLabels: Record<string, string> = {
      ar: "مستوى الأداء", en: "Performance Level",
      fr: "Niveau de performance", de: "Leistungsniveau",
      es: "Nivel de rendimiento", zh: "表现水平",
    };
    const howCanIHelp: Record<string, string> = {
      ar: "كيف يمكنني مساعدتك؟", en: "How can I help you?",
      fr: "Comment puis-je vous aider?", de: "Wie kann ich Ihnen helfen?",
      es: "¿Cómo puedo ayudarle?", zh: "我能帮您什么?",
    };

    const cleanLevel = data.level
      ? data.level.replace(/⭐/g, "").replace(/⚠️/g, "").trim()
      : null;

    const isUnknown = data.className === "unknown_exercise";

    const exerciseGreet: Record<string, string> = isUnknown ? {
      ar: `${greeting} لم يتم التعرف على التمرين. يرجى تكرار الحركة 3-5 مرات وتسجيل 5 ثواني على الأقل.`,
      en: `${greeting} Exercise not recognized. Please repeat the movement 3-5 times and record at least 5 seconds.`,
      fr: `${greeting} Exercice non reconnu. Veuillez répéter le mouvement 3-5 fois.`,
      de: `${greeting} Übung nicht erkannt. Bitte wiederhole die Bewegung 3-5 Mal und nimm mindestens 5 Sekunden auf.`,
      es: `${greeting} Ejercicio no reconocido. Por favor repite el movimiento 3-5 veces.`,
      zh: `${greeting} 未识别练习。请重复动作3-5次，录制至少5秒。`,
    } : {
      ar: `${greeting} لقد تم تحليل تمرين **${data.className}**.`,
      en: `${greeting} Your **${data.className}** exercise was analyzed.`,
      fr: `${greeting} Votre exercice **${data.className}** a été analysé.`,
      de: `${greeting} Ihre Übung **${data.className}** wurde analysiert.`,
      es: `${greeting} Su ejercicio **${data.className}** fue analizado.`,
      zh: `${greeting} 您的 **${data.className}** 练习已分析完毕。`,
    };

    const translateFeedback = (fb: string) => {
      if (!fb) return "";
      if (language === "de") return fb
        .replace("الحركة غير معروفة — يرجى تكرار التمرين بشكل صحيح", "")
        .replace("ثقة منخفضة جداً — يرجى تكرار التمرين بشكل صحيح", "Sehr niedrige Konfidenz — bitte Übung wiederholen")
        .replace("لا توجد حركة كافية — يرجى تكرار التمرين", "Keine ausreichende Bewegung — bitte Übung wiederholen")
        .replace("حركة الرأس فقط لا تُعدّ تمريناً", "Nur Kopfbewegung — kein gültiges Training");
      if (language === "en") return fb
        .replace("الحركة غير معروفة — يرجى تكرار التمرين بشكل صحيح", "")
        .replace("ثقة منخفضة جداً — يرجى تكرار التمرين بشكل صحيح", "Very low confidence — please repeat")
        .replace("لا توجد حركة كافية — يرجى تكرار التمرين", "Not enough movement — please repeat")
        .replace("حركة الرأس فقط لا تُعدّ تمريناً", "Head movement only — not valid");
      return isUnknown ? "" : fb;
    };

    const content = [
      exerciseGreet[language] ?? exerciseGreet["en"],
      cleanLevel ? `${levelLabels[language] ?? levelLabels["en"]}: ${cleanLevel}` : "",
      translateFeedback(data.dtw_feedback ?? ""),
      howCanIHelp[language] ?? howCanIHelp["en"],
    ].filter(Boolean).join("\n\n");

    setMessages([{ role: "assistant", content }]);
  }, [userName, language]);

  const similarityScore = results?.className === "unknown_exercise" ? 0
    : results?.dtw_distance != null
    ? Math.max(0, Math.round(100 - results.dtw_distance / 15))
    : results ? Math.round(results.confidence * 100) : 0;

  const levelColor = (level: string | null) => {
    if (!level) return "text-gray-500";
    if (level.includes("Excellent") || level.includes("ممتاز")) return "text-green-600";
    if (level.includes("Good")      || level.includes("جيد"))   return "text-blue-600";
    if (level.includes("Acceptable")|| level.includes("مقبول")) return "text-yellow-600";
    return "text-red-600";
  };

  const saveAnalysis = trpc.analysis.saveAnalysis.useMutation();

  const handleSave = async () => {
    if (!results) return;
    const storedUserName = (() => { try { return localStorage.getItem("userName"); } catch { return null; } })();
    const storedUserId   = (() => { try { return localStorage.getItem("userId"); } catch { return null; } })();
    const userId = authUser?.id ?? (storedUserId ? parseInt(storedUserId) : undefined);
    console.log("[Save] authUser:", authUser?.id, "storedUserId:", storedUserId, "userId:", userId);
    if (!userId) {
      setSaveMsg(t("loginRequired"));
      setTimeout(() => setSaveMsg(""), 3000);
      return;
    }
    try {
      await saveAnalysis.mutateAsync({
        userId,
        exercise:        results.className,
        confidence:      results.confidence,
        similarityScore: similarityScore,
        level:           results.level,
        dtwDistance:     results.dtw_distance,
        corrections:     results.corrections ?? [],
        qualityIssues:   results.qualityIssues ?? [],
      });
      setIsSaved(true);
      setSaveMsg(language === "de" ? "✅ Gespeichert!" : language === "ar" ? "✅ تم الحفظ!" : "✅ Saved!");
      setTimeout(() => { setIsSaved(false); setSaveMsg(""); }, 3000);
    } catch (e) {
      console.error("Save failed:", e);
      setSaveMsg("❌ Error saving");
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  const YOUTUBE_LINKS: Record<string, string> = {
    "barbell biceps curl":  "https://youtu.be/JJB8XgKltA8?is=vvAFvBXCzfeh-szu",
    "bench press":          "https://www.youtube.com/watch?v=SCVCLChPQFY",
    "chest fly machine":    "https://youtu.be/eGjt4lk6g34",
    "deadlift":             "https://youtube.com/shorts/xNwpvDuZJ3k",
    "decline bench press":  "https://youtube.com/shorts/5NStATS0zrw",
    "hammer curl":          "https://youtu.be/BRVDS6HVR9Q",
    "hip thrust":           "https://www.youtube.com/watch?v=LM8XHLYJoYs",
    "incline bench press":  "https://www.youtube.com/watch?v=8iPEnn-ltC8",
    "lat pulldown":         "https://www.youtube.com/watch?v=CAwf7n6Luuc",
    "lateral raise":        "https://www.youtube.com/watch?v=3VcKaXpzqRo",
    "leg extension":        "https://www.youtube.com/watch?v=YyvSfVjQeL0",
    "leg raises":           "https://youtube.com/shorts/AKvRTjwkkHw",
    "plank":                "https://www.youtube.com/watch?v=pSHjTRCQxIw",
    "pull up":              "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    "push-up":              "https://www.youtube.com/watch?v=IODxDxX7oi4",
    "romanian deadlift":    "https://youtube.com/shorts/g5u75sgpn04",
    "russian twist":        "https://www.youtube.com/watch?v=wkD8rjkodUI",
    "shoulder press":       "https://www.youtube.com/watch?v=B-aVuyhvLHU",
    "squat":                "https://www.youtube.com/watch?v=Aj2933BdTb0",
    "t bar row":            "https://www.youtube.com/results?search_query=t+bar+row+proper+form+men",
    "tricep pushdown":      "https://www.youtube.com/watch?v=2-LAMcpzODU",
    "tricep dips":          "https://youtube.com/shorts/SpSE_A5L-YA",
  };

  const isExerciseQuestion = (msg: string) => {
    const keywords = [
      "video", "فيديو", "vidéo", "vídeo",
      "zeig", "show", "watch", "شاهد",
      "اشرح", "erklär", "explain", "tutorial", "how to", "wie", "كيف",
      "شرح", "أداء", "form", "technik", "technique", "technique",
      "perform", "do", "ausführ", "أؤدي", "تمرين", "übung", "exercise",
      "improve", "verbessern", "تحسين", "help", "hilf", "مساعدة",
      "don't understand", "verstehe nicht", "لا أفهم", "je comprends pas",
    ];
    return keywords.some(k => msg.toLowerCase().includes(k));
  };

  const handleSendMessage = async (content: string) => {
    if (!results) return;
    setMessages(prev => [...prev, { role: "user", content }]);
    setIsLoading(true);
    try {
      const res = await chatMutation.mutateAsync({
        message: content,
        analysisResult: {
          className:   results.className,
          confidence:  results.confidence,
          corrections: results.corrections,
          level:       results.level,
        },
        language,
        chatType: "analysis",
        userName: authUser?.name ?? undefined,
      });
      let aiMsg = res.message;

      // إضافة رابط YouTube إذا طلب المستخدم شرح أو فيديو
      if (isExerciseQuestion(content) && results.className !== "unknown_exercise") {
        const link = YOUTUBE_LINKS[results.className.toLowerCase()];
        if (link) {
          const ytLabel = language === "de" ? "📹 Video-Tutorial" :
                          language === "ar" ? "📹 فيديو تعليمي" :
                          language === "fr" ? "📹 Tutoriel vidéo" :
                          "📹 Video Tutorial";
          aiMsg += `\n\n${ytLabel}: ${link}`;
        }
      }

      setMessages(prev => [...prev, { role: "assistant", content: aiMsg }]);
      if (authUser) {
        await saveResultsChat.mutateAsync({
          exercise:    results.className,
          confidence:  results.confidence,
          level:       results.level,
          userMessage: content,
          aiResponse:  aiMsg,
          language,
        });
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, an error occurred." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!results) return;
    const report = `
${t("downloadReport")} - Smart Gym AI Coach
============================
Exercise: ${results.className}
${t("performanceLevel")}: ${results.level ?? t("notDetermined")}
${t("similarityScore")}: ${similarityScore}%
Feedback: ${results.dtw_feedback ?? "N/A"}
${t("corrections")}:
${results.corrections.map(c => `- ${c}`).join("\n") || "- N/A"}
${t("videoQuality")}:
${results.qualityIssues?.map(q => `- ${q}`).join("\n") || "- N/A"}
Date: ${new Date().toLocaleDateString()}
Generated by: Smart Gym AI Coach
    `.trim();
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `report_${results.className}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-12 text-center">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl mb-6 text-muted-foreground">{t("noResults")}</p>
          <Button className="bg-primary" onClick={() => setLocation("/advanced-analysis")}>
            {t("startAnalysis")}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setLocation("/advanced-analysis")}>
              <ArrowLeft className="w-4 h-4 mr-2" />{t("back")}
            </Button>
            <h1 className="text-3xl font-bold">{t("detectedExercise")}</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {saveMsg && (
              <span className="text-sm text-orange-600">{saveMsg}</span>
            )}
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaved}
              className={isSaved ? "border-green-500 text-green-600" : ""}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaved ? t("saved") : t("saveData")}
            </Button>
            <Button variant="outline" onClick={handleDownloadReport}>
              <Download className="w-4 h-4 mr-2" />{t("downloadReport")}
            </Button>
            <Button variant="outline" onClick={() => setLocation("/dashboard")}>
              {t("dashboard")}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* عرض الفيديو */}
            {videoUrl && (
              <Card className="p-4">
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg"
                  style={{ aspectRatio: "16/9", objectFit: "contain", background: "#000" }}
                />
              </Card>
            )}

            <Card className="p-6">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-1">{t("detectedExercise")}</p>
                {results.className === "unknown_exercise" ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <h2 className="text-2xl font-bold text-orange-600">
                      {language === "de" ? "⚠️ Übung nicht erkannt" :
                       language === "ar" ? "⚠️ لم يتم التعرف على التمرين" :
                       language === "fr" ? "⚠️ Exercice non reconnu" :
                       language === "es" ? "⚠️ Ejercicio no reconocido" :
                       "⚠️ Exercise not recognized"}
                    </h2>
                    <p className="text-sm text-orange-500 mt-2">
                      {language === "de" ? "Bitte wiederhole die Übung 3-5 Mal und nimm mindestens 5 Sekunden auf." :
                       language === "ar" ? "يرجى تكرار التمرين 3-5 مرات وتسجيل 5 ثواني على الأقل." :
                       "Please repeat the exercise 3-5 times and record at least 5 seconds."}
                    </p>
                  </div>
                ) : (
                  <h2 className="text-3xl font-bold text-primary capitalize">{results.className}</h2>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{t("performanceLevel")}</span>
                  </div>
                  <p className={`text-lg font-bold ${levelColor(results.level)}`}>
                    {results.level ?? t("notDetermined")}
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{t("similarityScore")}</span>
                  </div>
                  <p className="text-lg font-bold text-primary">{similarityScore}%</p>
                </div>
              </div>
              {results.dtw_feedback && results.className !== "unknown_exercise" && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-primary">
                    {language === "de" ? results.dtw_feedback
                      .replace("الحركة غير معروفة — يرجى تكرار التمرين بشكل صحيح", "Übung nicht erkannt — bitte Bewegung wiederholen")
                      .replace("ثقة منخفضة جداً — يرجى تكرار التمرين بشكل صحيح", "Sehr niedrige Konfidenz — bitte Übung wiederholen")
                      .replace("لا توجد حركة كافية — يرجى تكرار التمرين", "Keine ausreichende Bewegung — bitte Übung wiederholen")
                      .replace("حركة الرأس فقط لا تُعدّ تمريناً", "Nur Kopfbewegung — kein gültiges Training")
                    : language === "en" ? results.dtw_feedback
                      .replace("الحركة غير معروفة — يرجى تكرار التمرين بشكل صحيح", "Exercise not recognized — please repeat")
                      .replace("ثقة منخفضة جداً — يرجى تكرار التمرين بشكل صحيح", "Very low confidence — please repeat correctly")
                      .replace("لا توجد حركة كافية — يرجى تكرار التمرين", "Not enough movement — please repeat")
                      .replace("حركة الرأس فقط لا تُعدّ تمريناً", "Head movement only — not a valid exercise")
                    : results.dtw_feedback}
                  </p>
                </div>
              )}
            </Card>

            {results.className !== "unknown_exercise" && (
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                {t("corrections")}
              </h3>
              {results.corrections.length > 0 ? (
                <ul className="space-y-3">
                  {results.corrections.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400 text-sm">{c}</li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-2 text-green-600 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span>{t("greatForm")}</span>
                </div>
              )}
            </Card>
            )}

            {results.qualityIssues && results.qualityIssues.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">{t("videoQuality")}</h3>
                <ul className="space-y-2">
                  {results.qualityIssues.map((q, i) => (
                    <li key={i} className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">{q}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <p className="text-lg font-bold mb-3">{t("aiCoach")}</p>
              <AIChatBox
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                height="580px"
                placeholder={t("askQuestion")}
                emptyStateMessage={language === "ar" ? "اسأليني أي سؤال عن أدائك!" : "Ask me anything about your performance!"}
                suggestedPrompts={
                  language === "ar"
                    ? ["كيف أحسّن أدائي؟", "ما هي أهم الأخطاء؟", "ما التمارين المكملة؟"]
                    : language === "de"
                    ? ["Wie kann ich mich verbessern?", "Was sind die Hauptfehler?", "Ergänzende Übungen?"]
                    : language === "fr"
                    ? ["Comment m'améliorer?", "Quelles sont les erreurs?", "Exercices complémentaires?"]
                    : language === "es"
                    ? ["¿Cómo mejorar?", "¿Cuáles son los errores?", "¿Ejercicios complementarios?"]
                    : ["How to improve?", "What are main mistakes?", "Complementary exercises?"]
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
