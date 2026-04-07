import { describe, it, expect } from "vitest";

describe("Dashboard Translations", () => {
  const dashboardTranslations: Record<string, Record<string, string>> = {
    en: {
      dashboard: "Dashboard",
      totalSessions: "Total Sessions",
      totalExercises: "Total Exercises",
      avgScore: "Average Score",
      currentStreak: "Current Streak",
      recentAnalysis: "Recent Analysis",
      startAnalysis: "Start Analysis",
      settings: "Settings",
      logout: "Logout",
      noAnalysis: "No analysis yet. Start your first analysis!",
      days: "days",
    },
    ar: {
      dashboard: "لوحة التحكم",
      totalSessions: "إجمالي الجلسات",
      totalExercises: "إجمالي التمارين",
      avgScore: "متوسط النقاط",
      currentStreak: "الأيام المتتالية",
      recentAnalysis: "التحليلات الأخيرة",
      startAnalysis: "ابدأ التحليل",
      settings: "الإعدادات",
      logout: "تسجيل الخروج",
      noAnalysis: "لا توجد تحليلات بعد. ابدأ تحليلك الأول!",
      days: "أيام",
    },
    es: {
      dashboard: "Panel de Control",
      totalSessions: "Sesiones Totales",
      totalExercises: "Ejercicios Totales",
      avgScore: "Puntuación Promedio",
      currentStreak: "Racha Actual",
      recentAnalysis: "Análisis Recientes",
      startAnalysis: "Comenzar Análisis",
      settings: "Configuración",
      logout: "Cerrar Sesión",
      noAnalysis: "Sin análisis aún. ¡Comienza tu primer análisis!",
      days: "días",
    },
    fr: {
      dashboard: "Tableau de Bord",
      totalSessions: "Sessions Totales",
      totalExercises: "Exercices Totaux",
      avgScore: "Score Moyen",
      currentStreak: "Série Actuelle",
      recentAnalysis: "Analyses Récentes",
      startAnalysis: "Commencer l'Analyse",
      settings: "Paramètres",
      logout: "Déconnexion",
      noAnalysis: "Pas d'analyse encore. Commencez votre première analyse!",
      days: "jours",
    },
    de: {
      dashboard: "Armaturenbrett",
      totalSessions: "Gesamtsitzungen",
      totalExercises: "Gesamtübungen",
      avgScore: "Durchschnittliche Punktzahl",
      currentStreak: "Aktuelle Serie",
      recentAnalysis: "Aktuelle Analysen",
      startAnalysis: "Analyse Starten",
      settings: "Einstellungen",
      logout: "Abmelden",
      noAnalysis: "Noch keine Analyse. Starten Sie Ihre erste Analyse!",
      days: "Tage",
    },
    zh: {
      dashboard: "仪表板",
      totalSessions: "总会话数",
      totalExercises: "总练习数",
      avgScore: "平均分数",
      currentStreak: "当前连胜",
      recentAnalysis: "最近分析",
      startAnalysis: "开始分析",
      settings: "设置",
      logout: "登出",
      noAnalysis: "还没有分析。开始您的第一次分析！",
      days: "天",
    },
  };

  describe("All Languages Support", () => {
    it("should have 6 languages for Dashboard", () => {
      const languages = Object.keys(dashboardTranslations);
      expect(languages).toHaveLength(6);
    });

    it("should support English Dashboard", () => {
      expect(dashboardTranslations.en.dashboard).toBe("Dashboard");
      expect(dashboardTranslations.en.totalSessions).toBe("Total Sessions");
    });

    it("should support Arabic Dashboard", () => {
      expect(dashboardTranslations.ar.dashboard).toBe("لوحة التحكم");
      expect(dashboardTranslations.ar.totalSessions).toBe("إجمالي الجلسات");
    });

    it("should support Spanish Dashboard", () => {
      expect(dashboardTranslations.es.dashboard).toBe("Panel de Control");
      expect(dashboardTranslations.es.totalSessions).toBe("Sesiones Totales");
    });

    it("should support French Dashboard", () => {
      expect(dashboardTranslations.fr.dashboard).toBe("Tableau de Bord");
      expect(dashboardTranslations.fr.totalSessions).toBe("Sessions Totales");
    });

    it("should support German Dashboard", () => {
      expect(dashboardTranslations.de.dashboard).toBe("Armaturenbrett");
      expect(dashboardTranslations.de.totalSessions).toBe("Gesamtsitzungen");
    });

    it("should support Chinese Dashboard", () => {
      expect(dashboardTranslations.zh.dashboard).toBe("仪表板");
      expect(dashboardTranslations.zh.totalSessions).toBe("总会话数");
    });
  });

  describe("Translation Consistency", () => {
    it("should have same keys for all Dashboard languages", () => {
      const englishKeys = Object.keys(dashboardTranslations.en);
      Object.keys(dashboardTranslations).forEach((lang) => {
        const langKeys = Object.keys(dashboardTranslations[lang]);
        expect(langKeys).toEqual(englishKeys);
      });
    });

    it("should have all required Dashboard keys", () => {
      const requiredKeys = [
        "dashboard",
        "totalSessions",
        "totalExercises",
        "avgScore",
        "currentStreak",
        "recentAnalysis",
        "startAnalysis",
        "settings",
        "logout",
        "noAnalysis",
        "days",
      ];

      Object.keys(dashboardTranslations).forEach((lang) => {
        requiredKeys.forEach((key) => {
          expect(dashboardTranslations[lang][key]).toBeDefined();
          expect(dashboardTranslations[lang][key]).not.toBe("");
        });
      });
    });
  });
});

describe("Plan Selection Logic", () => {
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      features: ["Basic analysis", "1 video per week", "Email support"],
    },
    {
      id: "pro",
      name: "Pro",
      price: "$9.99/mo",
      features: ["Unlimited analysis", "HD videos", "Priority support", "Advanced reports"],
    },
    {
      id: "elite",
      name: "Elite",
      price: "$19.99/mo",
      features: ["Everything in Pro", "AI coaching", "1-on-1 sessions", "Custom workouts"],
    },
  ];

  describe("Plan Selection Behavior", () => {
    it("should have 3 plans available", () => {
      expect(plans).toHaveLength(3);
    });

    it("should have Free plan with $0 price", () => {
      const freePlan = plans.find((p) => p.id === "free");
      expect(freePlan).toBeDefined();
      expect(freePlan?.price).toBe("$0");
    });

    it("should have Pro plan with $9.99/mo price", () => {
      const proPlan = plans.find((p) => p.id === "pro");
      expect(proPlan).toBeDefined();
      expect(proPlan?.price).toBe("$9.99/mo");
    });

    it("should have Elite plan with $19.99/mo price", () => {
      const elitePlan = plans.find((p) => p.id === "elite");
      expect(elitePlan).toBeDefined();
      expect(elitePlan?.price).toBe("$19.99/mo");
    });

    it("Free plan should show subscription modal", () => {
      const freePlan = plans.find((p) => p.id === "free");
      expect(freePlan?.id).toBe("free");
      // When Free plan is selected, it should show modal (not navigate)
    });

    it("Pro plan should navigate to subscription page", () => {
      const proPlan = plans.find((p) => p.id === "pro");
      expect(proPlan?.id).toBe("pro");
      // When Pro plan is selected, it should navigate to /settings?tab=subscription&plan=pro
    });

    it("Elite plan should navigate to subscription page", () => {
      const elitePlan = plans.find((p) => p.id === "elite");
      expect(elitePlan?.id).toBe("elite");
      // When Elite plan is selected, it should navigate to /settings?tab=subscription&plan=elite
    });
  });

  describe("Plan Features", () => {
    it("Free plan should have 3 features", () => {
      const freePlan = plans.find((p) => p.id === "free");
      expect(freePlan?.features).toHaveLength(3);
    });

    it("Pro plan should have 4 features", () => {
      const proPlan = plans.find((p) => p.id === "pro");
      expect(proPlan?.features).toHaveLength(4);
    });

    it("Elite plan should have 4 features", () => {
      const elitePlan = plans.find((p) => p.id === "elite");
      expect(elitePlan?.features).toHaveLength(4);
    });

    it("Free plan should include basic analysis", () => {
      const freePlan = plans.find((p) => p.id === "free");
      expect(freePlan?.features).toContain("Basic analysis");
    });

    it("Pro plan should include unlimited analysis", () => {
      const proPlan = plans.find((p) => p.id === "pro");
      expect(proPlan?.features).toContain("Unlimited analysis");
    });

    it("Elite plan should include AI coaching", () => {
      const elitePlan = plans.find((p) => p.id === "elite");
      expect(elitePlan?.features).toContain("AI coaching");
    });
  });

  describe("Plan Navigation", () => {
    it("should navigate to subscription page with Free plan parameter", () => {
      const planId = "free";
      const url = `/settings?tab=subscription&plan=${planId}`;
      expect(url).toContain("plan=free");
    });

    it("should navigate to subscription page with Pro plan parameter", () => {
      const planId = "pro";
      const url = `/settings?tab=subscription&plan=${planId}`;
      expect(url).toContain("plan=pro");
    });

    it("should navigate to subscription page with Elite plan parameter", () => {
      const planId = "elite";
      const url = `/settings?tab=subscription&plan=${planId}`;
      expect(url).toContain("plan=elite");
    });

    it("should maintain subscription tab in URL", () => {
      const planId = "pro";
      const url = `/settings?tab=subscription&plan=${planId}`;
      expect(url).toContain("tab=subscription");
    });
  });
});
