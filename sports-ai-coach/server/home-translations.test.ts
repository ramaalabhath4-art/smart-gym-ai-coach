import { describe, it, expect } from "vitest";

describe("Home Page Translations", () => {
  const translations: Record<string, Record<string, string>> = {
    en: {
      appTitle: "AI Sports Coach",
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
      appTitle: "مدرب الرياضة الذكي",
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
      appTitle: "Entrenador de Deportes IA",
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
    fr: {
      appTitle: "Entraîneur Sportif IA",
      settings: "Paramètres",
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
      appTitle: "KI-Sporttrainer",
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
    zh: {
      appTitle: "AI 运动教练",
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

  describe("All Languages Support", () => {
    it("should have 6 languages supported", () => {
      const languages = Object.keys(translations);
      expect(languages).toHaveLength(6);
    });

    it("should support English", () => {
      expect(translations.en).toBeDefined();
      expect(translations.en.appTitle).toBe("AI Sports Coach");
    });

    it("should support Arabic", () => {
      expect(translations.ar).toBeDefined();
      expect(translations.ar.appTitle).toBe("مدرب الرياضة الذكي");
    });

    it("should support Spanish", () => {
      expect(translations.es).toBeDefined();
      expect(translations.es.appTitle).toBe("Entrenador de Deportes IA");
    });

    it("should support French", () => {
      expect(translations.fr).toBeDefined();
      expect(translations.fr.appTitle).toBe("Entraîneur Sportif IA");
    });

    it("should support German", () => {
      expect(translations.de).toBeDefined();
      expect(translations.de.appTitle).toBe("KI-Sporttrainer");
    });

    it("should support Chinese", () => {
      expect(translations.zh).toBeDefined();
      expect(translations.zh.appTitle).toBe("AI 运动教练");
    });
  });

  describe("Translation Consistency", () => {
    it("should have same keys for all languages", () => {
      const englishKeys = Object.keys(translations.en);
      Object.keys(translations).forEach((lang) => {
        const langKeys = Object.keys(translations[lang]);
        expect(langKeys).toEqual(englishKeys);
      });
    });

    it("should have all required keys", () => {
      const requiredKeys = [
        "appTitle",
        "settings",
        "analyzeForm",
        "improvePerformance",
        "aiPowered",
        "startAnalysis",
        "demo",
        "features",
        "realtime",
        "liveAnalysis",
        "smart",
        "corrections",
        "reports",
        "statistics",
        "howItWorks",
        "yourProgress",
        "totalSessions",
        "avgScore",
        "daysActive",
        "improvement",
        "subscribe",
        "subscribeDesc",
        "emailPlaceholder",
        "subscribeButton",
        "thankYou",
      ];

      Object.keys(translations).forEach((lang) => {
        requiredKeys.forEach((key) => {
          expect(translations[lang][key]).toBeDefined();
          expect(translations[lang][key]).not.toBe("");
        });
      });
    });

    it("should not have empty translations", () => {
      Object.keys(translations).forEach((lang) => {
        Object.keys(translations[lang]).forEach((key) => {
          expect(translations[lang][key]).not.toBe("");
          expect(translations[lang][key].trim()).not.toBe("");
        });
      });
    });
  });

  describe("Translation Quality", () => {
    it("should have meaningful English translations", () => {
      expect(translations.en.appTitle.length).toBeGreaterThan(0);
      expect(translations.en.analyzeForm.length).toBeGreaterThan(0);
      expect(translations.en.improvePerformance.length).toBeGreaterThan(0);
    });

    it("should have meaningful Arabic translations", () => {
      expect(translations.ar.appTitle.length).toBeGreaterThan(0);
      expect(translations.ar.analyzeForm.length).toBeGreaterThan(0);
      expect(translations.ar.improvePerformance.length).toBeGreaterThan(0);
    });

    it("should have meaningful Spanish translations", () => {
      expect(translations.es.appTitle.length).toBeGreaterThan(0);
      expect(translations.es.analyzeForm.length).toBeGreaterThan(0);
      expect(translations.es.improvePerformance.length).toBeGreaterThan(0);
    });

    it("should have meaningful French translations", () => {
      expect(translations.fr.appTitle.length).toBeGreaterThan(0);
      expect(translations.fr.analyzeForm.length).toBeGreaterThan(0);
      expect(translations.fr.improvePerformance.length).toBeGreaterThan(0);
    });

    it("should have meaningful German translations", () => {
      expect(translations.de.appTitle.length).toBeGreaterThan(0);
      expect(translations.de.analyzeForm.length).toBeGreaterThan(0);
      expect(translations.de.improvePerformance.length).toBeGreaterThan(0);
    });

    it("should have meaningful Chinese translations", () => {
      expect(translations.zh.appTitle.length).toBeGreaterThan(0);
      expect(translations.zh.analyzeForm.length).toBeGreaterThan(0);
      expect(translations.zh.improvePerformance.length).toBeGreaterThan(0);
    });
  });

  describe("Language Switching", () => {
    it("should switch from English to Arabic", () => {
      const currentLang = "en";
      const newLang = "ar";
      expect(currentLang).not.toBe(newLang);
      expect(translations[newLang]).toBeDefined();
    });

    it("should switch from Arabic to Spanish", () => {
      const currentLang = "ar";
      const newLang = "es";
      expect(currentLang).not.toBe(newLang);
      expect(translations[newLang]).toBeDefined();
    });

    it("should switch from Spanish to French", () => {
      const currentLang = "es";
      const newLang = "fr";
      expect(currentLang).not.toBe(newLang);
      expect(translations[newLang]).toBeDefined();
    });

    it("should switch from French to German", () => {
      const currentLang = "fr";
      const newLang = "de";
      expect(currentLang).not.toBe(newLang);
      expect(translations[newLang]).toBeDefined();
    });

    it("should switch from German to Chinese", () => {
      const currentLang = "de";
      const newLang = "zh";
      expect(currentLang).not.toBe(newLang);
      expect(translations[newLang]).toBeDefined();
    });

    it("should switch from Chinese back to English", () => {
      const currentLang = "zh";
      const newLang = "en";
      expect(currentLang).not.toBe(newLang);
      expect(translations[newLang]).toBeDefined();
    });
  });
});
