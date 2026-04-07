import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, BarChart3, Zap, TrendingUp, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import ImageSlideshow from "@/components/ImageSlideshow";
import { trpc } from "@/lib/trpc";

const HERO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663336019026/a2PqiZtbbD4QZshCfEaJrE/hero-athlete-FsSdweK5Raj5DjjeDnByYo.webp";
const ANALYSIS = "https://d2xsxph8kpxj0f.cloudfront.net/310519663336019026/a2PqiZtbbD4QZshCfEaJrE/analysis-visualization-giRfPKg7qNh8XnQNWeR27A.webp";

// صور الـ Slideshow
const SLIDESHOW_IMAGES = [
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663336019026/a2PqiZtbbD4QZshCfEaJrE/athlete-squat-1.jpg",
    title: "تحليل تمرين القرفصاء",
    description: "تحليل ذكي لحركة القرفصاء مع تصحيحات فورية",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663336019026/a2PqiZtbbD4QZshCfEaJrE/athlete-pushup-2-QqWWPN9Ag3ma3FBUY3zbGH.webp",
    title: "تحليل تمرين الضغط",
    description: "مراقبة مستمرة لشكل الضغط والعضلات المستخدمة",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663336019026/a2PqiZtbbD4QZshCfEaJrE/athlete-running-3-iMbJVtE3ViLhJKdYS6Ntrm.webp",
    title: "تحليل الجري والخطوة",
    description: "تحليل حركة الجري مع قياس طول الخطوة والسرعة",
  },
];

const SUMMARY_IMAGES = [
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663336019026/a2PqiZtbbD4QZshCfEaJrE/bench-press-summary-new_4d6afe46.webp",
    title: "Bench Press",
    description: "Form Analysis",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663336019026/a2PqiZtbbD4QZshCfEaJrE/deadlift-summary-new_f26e127f.webp",
    title: "Deadlift",
    description: "Performance Metrics",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663336019026/a2PqiZtbbD4QZshCfEaJrE/pushup-summary-new_2e7c537f.webp",
    title: "Push-up",
    description: "Real-time Feedback",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663336019026/a2PqiZtbbD4QZshCfEaJrE/deadlift-summary-alt_5833bdaf.webp",
    title: "Deadlift Advanced",
    description: "Complete Analysis",
  },
];

// Translations for all pages
const translations: Record<string, Record<string, string | string[]>> = {
  en: {
    appTitle: "WazenAI",
    settings: "Settings",
    analyzeForm: "Analyze Your Form,",
    improvePerformance: "Improve Performance",
    aiPowered: "AI-powered analysis with real-time corrections",
    startAnalysis: "Start Analysis",
    demo: "Demo",
    features: "Features",
    realtime: "Real-time",
    liveAnalysis: "Live analysis",
    smart: "Smart",
    corrections: "Corrections",
    reports: "Reports",
    statistics: "Statistics",
    howItWorks: "How It Works",
    steps: JSON.stringify(["Turn on camera", "System analyzes", "Get corrections", "View report"]),
    yourProgress: "Your Progress",
    totalSessions: "Total Sessions",
    avgScore: "Average Score",
    daysActive: "Days Active",
    improvement: "Improvement",
    subscribe: "Subscribe",
    subscribeDesc: "Get exclusive tips and updates",
    emailPlaceholder: "your@email.com",
    subscribeButton: "Subscribe",
    thankYou: "Thank you for subscribing!",
  },
  ar: {
    appTitle: "WazenAI",
    settings: "الإعدادات",
    analyzeForm: "حلل شكلك،",
    improvePerformance: "حسّن الأداء",
    aiPowered: "تحليل مدعوم بالذكاء الاصطناعي مع تصحيحات فورية",
    startAnalysis: "ابدأ التحليل",
    demo: "عرض توضيحي",
    features: "الميزات",
    realtime: "فوري",
    liveAnalysis: "تحليل مباشر",
    smart: "ذكي",
    corrections: "تصحيحات",
    reports: "التقارير",
    statistics: "الإحصائيات",
    howItWorks: "كيف يعمل",
    steps: JSON.stringify(["شغّل الكاميرا", "يحلل النظام", "احصل على التصحيحات", "اعرض التقرير"]),
    yourProgress: "تقدمك",
    totalSessions: "إجمالي الجلسات",
    avgScore: "متوسط النقاط",
    daysActive: "الأيام النشطة",
    improvement: "التحسن",
    subscribe: "اشترك",
    subscribeDesc: "احصل على نصائح وتحديثات حصرية",
    emailPlaceholder: "your@email.com",
    subscribeButton: "اشترك",
    thankYou: "شكراً لاشتراكك!",
  },
  es: {
    appTitle: "WazenAI",
    settings: "Configuración",
    analyzeForm: "Analiza tu forma,",
    improvePerformance: "Mejora el rendimiento",
    aiPowered: "Análisis impulsado por IA con correcciones en tiempo real",
    startAnalysis: "Comenzar análisis",
    demo: "Demostración",
    features: "Características",
    realtime: "Tiempo real",
    liveAnalysis: "Análisis en vivo",
    smart: "Inteligente",
    corrections: "Correcciones",
    reports: "Reportes",
    statistics: "Estadísticas",
    howItWorks: "Cómo funciona",
    steps: JSON.stringify(["Enciende la cámara", "El sistema analiza", "Obtén correcciones", "Ver informe"]),
    yourProgress: "Tu progreso",
    totalSessions: "Sesiones totales",
    avgScore: "Puntuación promedio",
    daysActive: "Días activos",
    improvement: "Mejora",
    subscribe: "Suscribirse",
    subscribeDesc: "Obtén consejos y actualizaciones exclusivas",
    emailPlaceholder: "your@email.com",
    subscribeButton: "Suscribirse",
    thankYou: "¡Gracias por suscribirte!",
  },
  fr: {    appTitle: "WazenAI",    settings: "Paramètres",
    analyzeForm: "Analysez votre forme,",
    improvePerformance: "Améliorez les performances",
    aiPowered: "Analyse alimentée par l'IA avec corrections en temps réel",
    startAnalysis: "Commencer l'analyse",
    demo: "Démonstration",
    features: "Caractéristiques",
    realtime: "Temps réel",
    liveAnalysis: "Analyse en direct",
    smart: "Intelligent",
    corrections: "Corrections",
    reports: "Rapports",
    statistics: "Statistiques",
    howItWorks: "Comment ça marche",
    steps: JSON.stringify(["Allumez la caméra", "Le système analyse", "Obtenez des corrections", "Afficher le rapport"]),
    yourProgress: "Votre progression",
    totalSessions: "Sessions totales",
    avgScore: "Score moyen",
    daysActive: "Jours actifs",
    improvement: "Amélioration",
    subscribe: "S'abonner",
    subscribeDesc: "Obtenez des conseils et des mises à jour exclusives",
    emailPlaceholder: "your@email.com",
    subscribeButton: "S'abonner",
    thankYou: "Merci de vous être abonné!",
  },
  de: {
    appTitle: "WazenAI",
    settings: "Einstellungen",
    analyzeForm: "Analysiere deine Form,",
    improvePerformance: "Verbessere die Leistung",
    aiPowered: "KI-gestützte Analyse mit Echtzeit-Korrektionen",
    startAnalysis: "Analyse starten",
    demo: "Demo",
    features: "Funktionen",
    realtime: "Echtzeit",
    liveAnalysis: "Live-Analyse",
    smart: "Intelligent",
    corrections: "Korrektionen",
    reports: "Berichte",
    statistics: "Statistiken",
    howItWorks: "Wie es funktioniert",
    steps: JSON.stringify(["Kamera einschalten", "System analysiert", "Korrektionen erhalten", "Bericht anzeigen"]),
    yourProgress: "Dein Fortschritt",
    totalSessions: "Gesamtsitzungen",
    avgScore: "Durchschnittliche Punktzahl",
    daysActive: "Aktive Tage",
    improvement: "Verbesserung",
    subscribe: "Abonnieren",
    subscribeDesc: "Erhalten Sie exklusive Tipps und Updates",
    emailPlaceholder: "your@email.com",
    subscribeButton: "Abonnieren",
    thankYou: "Danke für dein Abonnement!",
  },
  zh: {    appTitle: "WazenAI",
    settings: "设置",
    analyzeForm: "分析您的姿态，",
    improvePerformance: "提高性能",
    aiPowered: "AI 驱动的分析，具有实时纠正",
    startAnalysis: "开始分析",
    demo: "演示",
    features: "功能",
    realtime: "实时",
    liveAnalysis: "实时分析",
    smart: "智能",
    corrections: "纠正",
    reports: "报告",
    statistics: "统计",
    howItWorks: "它如何工作",
    steps: JSON.stringify(["打开摄像头", "系统分析", "获得纠正", "查看报告"]),
    yourProgress: "您的进度",
    totalSessions: "总会话数",
    avgScore: "平均分数",
    daysActive: "活跃天数",
    improvement: "改进",
    subscribe: "订阅",
    subscribeDesc: "获取独家提示和更新",
    emailPlaceholder: "your@email.com",
    subscribeButton: "订阅",
    thankYou: "感谢您的订阅！",
  },
};

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();

  const storedUserId = (() => { try { const id = localStorage.getItem("userId"); return id ? parseInt(id) : undefined; } catch { return undefined; } })();
  const effectiveUserId = user?.id ?? storedUserId;

  const { data: statsData } = trpc.analysis.getStats.useQuery(
    { userId: effectiveUserId },
    { enabled: !!effectiveUserId }
  );

  const progressData = {
    totalSessions: statsData?.totalSessions ?? 0,
    avgScore:      statsData?.avgScore      ?? 0,
    daysActive:    0,
    improvement:   0,
  };

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (e.target as HTMLFormElement).email.value;
    if (!email || !email.includes("@")) return;

    try {
      // حاول إنشاء مستخدم بالإيميل — إذا موجود تجاهل
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: email.split("@")[0],
          email,
          password: Math.random().toString(36).slice(-8) + "Aa1!", // كلمة مرور عشوائية
        }),
      });

      const data = await res.json();
      // 409 = الإيميل موجود بالفعل — هذا مقبول
      if (res.ok || res.status === 409) {
        alert(`✅ ${translations[language as keyof typeof translations]?.thankYou || "Thank you!"}`);
        (e.target as HTMLFormElement).reset();
      }
    } catch {
      alert(`✅ ${translations[language as keyof typeof translations]?.thankYou || "Thank you!"}`);
      (e.target as HTMLFormElement).reset();
    }
  };

  const t = (key: keyof typeof translations.en) => {
    return translations[language as keyof typeof translations]?.[key] || translations.en[key];
  };

  const steps = JSON.parse(t("steps") as string) as string[];

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663336019026/a2PqiZtbbD4QZshCfEaJrE/wazenai-logo-cyagJdoLe2Guga9PzDxGRH.webp" alt="WazenAI" className="w-8 h-8" />
            <span className="text-xl font-bold text-primary">{t("appTitle")}</span>
          </div>
          <Button size="sm" className="bg-primary" onClick={() => setLocation("/settings")}>{t("settings")}</Button>
        </div>
      </nav>

      <section className="container grid lg:grid-cols-2 gap-12 items-center py-20">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold text-foreground">{t("analyzeForm")} <span className="text-primary">{t("improvePerformance")}</span></h1>
          <p className="text-xl text-muted-foreground">{t("aiPowered")}</p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-primary" onClick={() => setLocation("/advanced-analysis")}><Zap className="w-5 h-5 mr-2" />{t("startAnalysis")}</Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/demo")}>{t("demo")}</Button>
          </div>
        </div>
        <img src={HERO} alt="Athlete" className="rounded-2xl shadow-2xl" />
      </section>

      <section className="bg-secondary/50 py-20">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-16">{t("features")}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8">
              <Activity className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold mb-2">{t("realtime")}</h3>
              <p className="text-muted-foreground">{t("liveAnalysis")}</p>
              {!!effectiveUserId && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-3xl font-bold text-primary">{progressData.totalSessions}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === "de" ? "Gesamtsitzungen" :
                     language === "ar" ? "إجمالي الجلسات" :
                     "Total Sessions"}
                  </p>
                </div>
              )}
            </Card>

            <Card className="p-8">
              <BarChart3 className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold mb-2">{t("smart")}</h3>
              <p className="text-muted-foreground">{t("corrections")}</p>
              {!!effectiveUserId && statsData?.bestExercise && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-lg font-bold text-primary capitalize">{statsData.bestExercise}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === "de" ? "Beste Übung" :
                     language === "ar" ? "أفضل تمرين" :
                     "Best Exercise"}
                  </p>
                </div>
              )}
            </Card>

            <Card className="p-8">
              <Zap className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold mb-2">{t("reports")}</h3>
              <p className="text-muted-foreground">{t("statistics")}</p>
              {!!effectiveUserId && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-3xl font-bold text-primary">{progressData.avgScore}%</p>
                  <p className="text-sm text-muted-foreground">
                    {language === "de" ? "Ø Leistung" :
                     language === "ar" ? "متوسط الأداء" :
                     "Avg Performance"}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      <section className="container grid lg:grid-cols-2 gap-12 items-center py-20">
        <div>
          <h2 className="text-4xl font-bold mb-6">{t("howItWorks")}</h2>
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4 mb-4">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">{i+1}</div>
              <p className="text-lg">{s}</p>
            </div>
          ))}
        </div>
        <img src={ANALYSIS} alt="Analysis" className="rounded-2xl shadow-2xl" />
      </section>

      {/* Your Progress Section */}
      {/* Subscription Section */}
      <section className="container py-20">
          <Card className="p-12 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="max-w-2xl mx-auto text-center">
              <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-foreground mb-4">{t("subscribe")}</h2>
              <p className="text-lg text-muted-foreground mb-8">{t("subscribeDesc")}</p>
              <Button
                className="bg-primary hover:bg-primary/90 px-8"
                onClick={() => setLocation("/settings?tab=notifications")}
              >
                <Mail className="w-4 h-4 mr-2" />
                {t("subscribeButton")}
              </Button>
            </div>
          </Card>
        </section>
    </div>
  );
}
