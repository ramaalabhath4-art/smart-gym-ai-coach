import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, Volume2, Check, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";

const T = {
  en: {
    back: "Back", account: "Account", subscription: "Subscription",
    notifications: "Notifications", preferences: "Preferences",
    accountSettings: "Account Settings", name: "Name", email: "Email",
    saveChanges: "Save Changes", saving: "Saving...",
    freeSubscription: "Free Subscription", enterEmail: "Enter your email to get started",
    subscribe: "Subscribe", alreadySubscribed: "Already Subscribed",
    subscriptionSuccess: "Successfully subscribed!", cancel: "Cancel",
    chooseYourPlan: "Choose Your Plan", selectPlan: "Select Plan",
    currentPlanBtn: "Current Plan", emailNotifications: "Email Notifications",
    analysisAlerts: "Analysis Alerts", weeklyReports: "Weekly Reports",
    communityUpdates: "Community Updates", language: "Language",
    darkMode: "Dark Mode", voiceFeature: "Voice Feature",
    testVoice: "Test Voice", speaking: "Speaking...",
    basicAnalysis: "Basic analysis", oneVideoPerWeek: "1 video per week",
    emailSupport: "Email support", unlimitedAnalysis: "Unlimited analysis",
    hdVideos: "HD videos", prioritySupport: "Priority support",
    advancedReports: "Advanced reports", everythingInPro: "Everything in Pro",
    aiCoaching: "AI coaching", oneOnOne: "1-on-1 sessions",
    customWorkouts: "Custom workouts",
  },
  ar: {
    back: "رجوع", account: "الحساب", subscription: "الاشتراك",
    notifications: "الإشعارات", preferences: "التفضيلات",
    accountSettings: "إعدادات الحساب", name: "الاسم", email: "البريد الإلكتروني",
    saveChanges: "حفظ التغييرات", saving: "جاري الحفظ...",
    freeSubscription: "الاشتراك المجاني", enterEmail: "أدخل بريدك الإلكتروني للبدء",
    subscribe: "اشترك", alreadySubscribed: "مشترك بالفعل",
    subscriptionSuccess: "تم الاشتراك بنجاح!", cancel: "إلغاء",
    chooseYourPlan: "اختر خطتك", selectPlan: "اختر الخطة",
    currentPlanBtn: "الخطة الحالية", emailNotifications: "إشعارات البريد",
    analysisAlerts: "تنبيهات التحليل", weeklyReports: "التقارير الأسبوعية",
    communityUpdates: "تحديثات المجتمع", language: "اللغة",
    darkMode: "الوضع الداكن", voiceFeature: "ميزة الصوت",
    testVoice: "اختبر الصوت", speaking: "جاري التحدث...",
    basicAnalysis: "تحليل أساسي", oneVideoPerWeek: "فيديو واحد أسبوعياً",
    emailSupport: "دعم البريد الإلكتروني", unlimitedAnalysis: "تحليل غير محدود",
    hdVideos: "فيديو عالي الدقة", prioritySupport: "دعم أولوي",
    advancedReports: "تقارير متقدمة", everythingInPro: "كل ميزات Pro",
    aiCoaching: "تدريب بالذكاء الاصطناعي", oneOnOne: "جلسات فردية",
    customWorkouts: "تمارين مخصصة",
  },
  de: {
    back: "Zurück", account: "Konto", subscription: "Abonnement",
    notifications: "Benachrichtigungen", preferences: "Einstellungen",
    accountSettings: "Kontoeinstellungen", name: "Name", email: "E-Mail",
    saveChanges: "Änderungen Speichern", saving: "Speichern...",
    freeSubscription: "Kostenloses Abonnement", enterEmail: "Geben Sie Ihre E-Mail ein",
    subscribe: "Abonnieren", alreadySubscribed: "Bereits Abonniert",
    subscriptionSuccess: "Erfolgreich abonniert!", cancel: "Abbrechen",
    chooseYourPlan: "Wählen Sie Ihren Plan", selectPlan: "Plan Auswählen",
    currentPlanBtn: "Aktueller Plan", emailNotifications: "E-Mail-Benachrichtigungen",
    analysisAlerts: "Analysewarnungen", weeklyReports: "Wöchentliche Berichte",
    communityUpdates: "Community-Updates", language: "Sprache",
    darkMode: "Dunkler Modus", voiceFeature: "Sprachfunktion",
    testVoice: "Stimme Testen", speaking: "Spricht...",
    basicAnalysis: "Grundlegende Analyse", oneVideoPerWeek: "1 Video pro Woche",
    emailSupport: "E-Mail-Support", unlimitedAnalysis: "Unbegrenzte Analyse",
    hdVideos: "HD-Videos", prioritySupport: "Prioritätssupport",
    advancedReports: "Erweiterte Berichte", everythingInPro: "Alles in Pro",
    aiCoaching: "KI-Coaching", oneOnOne: "1-zu-1-Sitzungen",
    customWorkouts: "Individuelle Workouts",
  },
  fr: {
    back: "Retour", account: "Compte", subscription: "Abonnement",
    notifications: "Notifications", preferences: "Préférences",
    accountSettings: "Paramètres du Compte", name: "Nom", email: "E-mail",
    saveChanges: "Enregistrer", saving: "Enregistrement...",
    freeSubscription: "Abonnement Gratuit", enterEmail: "Entrez votre e-mail",
    subscribe: "S'abonner", alreadySubscribed: "Déjà Abonné",
    subscriptionSuccess: "Abonnement réussi!", cancel: "Annuler",
    chooseYourPlan: "Choisissez Votre Plan", selectPlan: "Sélectionner",
    currentPlanBtn: "Plan Actuel", emailNotifications: "Notifications par E-mail",
    analysisAlerts: "Alertes d'Analyse", weeklyReports: "Rapports Hebdomadaires",
    communityUpdates: "Mises à Jour", language: "Langue",
    darkMode: "Mode Sombre", voiceFeature: "Fonction Vocale",
    testVoice: "Tester la Voix", speaking: "Parle...",
    basicAnalysis: "Analyse de base", oneVideoPerWeek: "1 vidéo par semaine",
    emailSupport: "Support par e-mail", unlimitedAnalysis: "Analyse illimitée",
    hdVideos: "Vidéos HD", prioritySupport: "Support prioritaire",
    advancedReports: "Rapports avancés", everythingInPro: "Tout dans Pro",
    aiCoaching: "Coaching IA", oneOnOne: "Sessions individuelles",
    customWorkouts: "Entraînements personnalisés",
  },
  es: {
    back: "Atrás", account: "Cuenta", subscription: "Suscripción",
    notifications: "Notificaciones", preferences: "Preferencias",
    accountSettings: "Configuración de Cuenta", name: "Nombre", email: "Correo",
    saveChanges: "Guardar Cambios", saving: "Guardando...",
    freeSubscription: "Suscripción Gratuita", enterEmail: "Ingresa tu correo",
    subscribe: "Suscribirse", alreadySubscribed: "Ya Suscrito",
    subscriptionSuccess: "¡Suscripción exitosa!", cancel: "Cancelar",
    chooseYourPlan: "Elige Tu Plan", selectPlan: "Seleccionar Plan",
    currentPlanBtn: "Plan Actual", emailNotifications: "Notificaciones por Correo",
    analysisAlerts: "Alertas de Análisis", weeklyReports: "Reportes Semanales",
    communityUpdates: "Actualizaciones", language: "Idioma",
    darkMode: "Modo Oscuro", voiceFeature: "Función de Voz",
    testVoice: "Probar Voz", speaking: "Hablando...",
    basicAnalysis: "Análisis básico", oneVideoPerWeek: "1 video por semana",
    emailSupport: "Soporte por correo", unlimitedAnalysis: "Análisis ilimitado",
    hdVideos: "Videos HD", prioritySupport: "Soporte prioritario",
    advancedReports: "Reportes avanzados", everythingInPro: "Todo en Pro",
    aiCoaching: "Coaching IA", oneOnOne: "Sesiones individuales",
    customWorkouts: "Entrenamientos personalizados",
  },
  zh: {
    back: "返回", account: "账户", subscription: "订阅",
    notifications: "通知", preferences: "偏好设置",
    accountSettings: "账户设置", name: "名称", email: "电子邮件",
    saveChanges: "保存更改", saving: "保存中...",
    freeSubscription: "免费订阅", enterEmail: "输入您的电子邮件",
    subscribe: "订阅", alreadySubscribed: "已订阅",
    subscriptionSuccess: "订阅成功！", cancel: "取消",
    chooseYourPlan: "选择您的计划", selectPlan: "选择计划",
    currentPlanBtn: "当前计划", emailNotifications: "电子邮件通知",
    analysisAlerts: "分析警报", weeklyReports: "每周报告",
    communityUpdates: "社区更新", language: "语言",
    darkMode: "深色模式", voiceFeature: "语音功能",
    testVoice: "测试语音", speaking: "正在说话...",
    basicAnalysis: "基本分析", oneVideoPerWeek: "每周1个视频",
    emailSupport: "电子邮件支持", unlimitedAnalysis: "无限分析",
    hdVideos: "高清视频", prioritySupport: "优先支持",
    advancedReports: "高级报告", everythingInPro: "Pro中的所有内容",
    aiCoaching: "AI教练", oneOnOne: "一对一课程",
    customWorkouts: "定制训练",
  },
};

export default function Settings() {
  const { user: authHook } = useAuth();
  const { data: authUser, refetch } = trpc.auth.me.useQuery();
  const user = authUser ?? authHook;
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage: setContextLanguage, autoDetect, setAutoDetect } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "notifications") return "notifications";
    }
    return "account";
  });
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const updateProfile      = trpc.auth.updateProfile.useMutation();
  const updateSubscription = trpc.auth.updateSubscription.useMutation();
  const deleteAccount      = trpc.auth.deleteAccount.useMutation();
  const logoutMutation     = trpc.auth.logout.useMutation();

  // Update formData when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: isValidEmail(user.email || "") ? (user.email || "") : "",
      });
      if (user.subscription) setSelectedPlan(user.subscription);
    }
  }, [user]);
  const [saving, setSaving] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [subscriptionEmail, setSubscriptionEmail] = useState("");
  const [subscriptionName, setSubscriptionName] = useState("");
  const [subscriptionPassword, setSubscriptionPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [notifications, setNotifications] = useState({
    emailNotifications: true, analysisAlerts: true,
    weeklyReports: true, communityUpdates: true,
  });
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => { setSelectedLanguage(language); }, [language]);

  const t = (key: string) =>
    T[language as keyof typeof T]?.[key as keyof typeof T["en"]] ?? key;

  const handleLanguageChange = (newLang: string) => {
    if (newLang === "auto") { setAutoDetect(true); }
    else { setAutoDetect(false); setContextLanguage(newLang as any); }
    setSelectedLanguage(newLang);
  };

  const [saveMsg, setSaveMsg] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { setSaveMsg(""); }, []);

  const handleSave = async () => {
    if (formData.name.trim().length < 2 || !isValidEmail(formData.email)) return;
    setSaving(true);
    try {
      if (user) {
        // مسجل — حدّث البيانات
        await updateProfile.mutateAsync({ name: formData.name.trim(), email: formData.email });
        await refetch();
        setSaveMsg(language === "de" ? "✅ Gespeichert" : language === "ar" ? "✅ تم الحفظ" : "✅ Saved");
      } else {
        // غير مسجل — حاول تسجيل حساب جديد
        if (password.length < 6) {
          setSaveMsg(language === "de" ? "❌ Passwort mind. 6 Zeichen" : "❌ Password min 6 chars");
          setSaving(false);
          return;
        }
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.name.trim(), email: formData.email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("userName", formData.name.trim());
          const userData = data.user;
          if (userData?.id) {
            localStorage.setItem("userId", String(userData.id));
          } else {
            // جلب userId من الإيميل
            try {
              const r = await fetch(`/api/trpc/auth.getUserByEmail?batch=1&input=${encodeURIComponent(JSON.stringify({"0":{"json":{"email":formData.email}}}))}`)
              const d = await r.json();
              const uid = d?.[0]?.result?.data?.json?.id;
              if (uid) localStorage.setItem("userId", String(uid));
            } catch {}
          }
          await refetch();
          setSaveMsg(language === "de" ? "✅ Konto erstellt!" : language === "ar" ? "✅ تم إنشاء الحساب!" : "✅ Account created!"); 
          try {
            const n8nBase = import.meta.env.VITE_N8N_BASE_URL || "http://localhost:5678";
            await fetch(`${n8nBase}/webhook/register-success`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id: userData?.id || localStorage.getItem("userId"),
                name: formData.name.trim(),
                email: formData.email,
                language: language,
              }),
            });
          } catch {}
        } else if (data.error === "Email already registered") {
          const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: formData.email, password }),
          });
          if (loginRes.ok) {
            const loginData = await loginRes.json();
            localStorage.setItem("userName", formData.name.trim());
            if (loginData.user?.id) {
              localStorage.setItem("userId", String(loginData.user.id));
            } else {
              try {
                const r = await fetch(`/api/trpc/auth.getUserByEmail?batch=1&input=${encodeURIComponent(JSON.stringify({"0":{"json":{"email":formData.email}}}))}`)
                const d = await r.json();
                const uid = d?.[0]?.result?.data?.json?.id;
                if (uid) localStorage.setItem("userId", String(uid));
              } catch {}
            }
            await refetch();
            setSaveMsg(language === "de" ? "✅ Angemeldet!" : language === "ar" ? "✅ تم الدخول!" : "✅ Signed in!");
          } else {
            setSaveMsg(language === "de" ? "❌ Falsches Passwort" : language === "ar" ? "❌ كلمة المرور خاطئة" : "❌ Wrong password");
          }
        } else {
          setSaveMsg(`❌ ${data.error || "Error"}`);
        }
      }
    } catch {
      setSaveMsg("❌ Error");
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 4000);
  };

  const handleSelectPlan = async (planId: string) => {
    if (planId !== "free") {
      setLocation(`/payment?plan=${planId}`);
      return;
    }
    if (user) {
      // مسجل — اشترك مباشرة
      try {
        await updateSubscription.mutateAsync({ plan: "free", email: user.email || undefined });
        setSelectedPlan("free");
        await refetch();
      } catch {}
    } else {
      // غير مسجل — اشترك بدون session (فقط في الواجهة)
      setSelectedPlan("free");
      // اذهب لتبويب Konto للتسجيل
      setActiveTab("account");
    }
  };

  const [emailExists, setEmailExists] = useState(false);

  const handleEmailSubscribe = async () => {
    if (!isValidEmail(subscriptionEmail)) return;

    // إذا الإيميل موجود — سجّل دخول
    if (emailExists) {
      if (subscriptionPassword.length < 6) return;
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: subscriptionEmail, password: subscriptionPassword }),
        });
        if (!res.ok) {
          const err = await res.json();
          alert(language === "de" ? "Falsches Passwort" : language === "ar" ? "كلمة المرور خاطئة" : "Wrong password");
          return;
        }
        await refetch();
        setSelectedPlan("free");
        setShowEmailModal(false);
        setSubscriptionEmail("");
        setSubscriptionName("");
        setSubscriptionPassword("");
        setEmailExists(false);
      } catch {}
      return;
    }

    if (!subscriptionName.trim()) return;
    if (subscriptionPassword.length < 6) return;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: subscriptionName.trim(),
          email: subscriptionEmail,
          password: subscriptionPassword,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        if (err.error === "Email already registered") {
          // أظهر وضع تسجيل الدخول
          setEmailExists(true);
          setSubscriptionName("");
          return;
        }
        alert(err.error);
        return;
      }
      await refetch();
      setSelectedPlan("free");
      setShowEmailModal(false);
      setSubscriptionEmail("");
      setSubscriptionName("");
      setSubscriptionPassword("");
      setEmailExists(false);
    } catch {
      setShowEmailModal(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      language === "ar" ? "هل أنت متأكد من حذف حسابك؟ لا يمكن التراجع!" :
      language === "de" ? "Möchten Sie Ihr Konto wirklich löschen? Dies kann nicht rückgängig gemacht werden!" :
      "Are you sure you want to delete your account? This cannot be undone!"
    );
    if (!confirm) return;
    try {
      await deleteAccount.mutateAsync();
      setLocation("/");
    } catch {}
  };

  const plans = [
    {
      id: "free", name: "Free", price: "$0",
      features: [t("basicAnalysis"), t("oneVideoPerWeek"), t("emailSupport")],
    },
    {
      id: "pro", name: "Pro", price: "$9.99/mo",
      features: [t("unlimitedAnalysis"), t("hdVideos"), t("prioritySupport"), t("advancedReports")],
    },
    {
      id: "elite", name: "Elite", price: "$19.99/mo",
      features: [t("everythingInPro"), t("aiCoaching"), t("oneOnOne"), t("customWorkouts")],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border dark:bg-slate-900/80">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663336019026/a2PqiZtbbD4QZshCfEaJrE/wazenai-logo-cyagJdoLe2Guga9PzDxGRH.webp" alt="WazenAI" className="w-8 h-8" />
            <span className="text-xl font-bold text-primary">WazenAI</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />{t("back")}
          </Button>
        </div>
      </nav>

      {/* Email Modal for Free Plan */}
      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-24">
              {/* User info above nav */}
              {user && (
                <div className="flex flex-col items-center pb-4 mb-4 border-b border-border">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mb-2">
                    {(user.name || "?")[0].toUpperCase()}
                  </div>
                  <p className="font-semibold text-sm text-center truncate w-full text-center">
                    {user.name || ""}
                  </p>
                  <p className="text-xs text-muted-foreground truncate w-full text-center">
                    {user.email || ""}
                  </p>
                </div>
              )}
              <nav className="space-y-2">
                {[
                  { id: "account", label: t("account") },
                  { id: "subscription", label: t("subscription") },
                  { id: "notifications", label: t("notifications") },
                  { id: "preferences", label: t("preferences") },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === id ? "bg-primary text-white" : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span>{label}</span>
                    {id === "account" && user?.name && (
                      <span className={`ml-2 text-xs font-semibold ${activeTab === "account" ? "text-white/80" : "text-primary"}`}>
                        {user.name}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {/* Account */}
    {activeTab === "account" && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">{t("accountSettings")}</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t("name")} *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder={language === "ar" ? "أدخل اسمك" : language === "de" ? "Ihren Namen eingeben" : "Enter your name"}
                        className={`w-full border rounded-lg px-4 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary ${
                          formData.name.trim().length > 0 && formData.name.trim().length < 2 ? "border-red-500" : "border-input"
                        }`}
                      />
                      {formData.name.trim().length > 0 && formData.name.trim().length < 2 && (
                        <p className="text-red-500 text-xs mt-1">
                          {language === "de" ? "Mind. 2 Zeichen" : language === "ar" ? "حرفان على الأقل" : "Min 2 characters"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t("email")} *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className={`w-full border rounded-lg px-4 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary ${
                          formData.email.length > 0 && !isValidEmail(formData.email) ? "border-red-500" : "border-input"
                        }`}
                      />
                      {formData.email.length > 0 && !isValidEmail(formData.email) && (
                        <p className="text-red-500 text-xs mt-1">
                          {language === "de" ? "Ungültige E-Mail" : language === "ar" ? "بريد غير صحيح" : "Invalid email"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* كلمة المرور فقط إذا لم يكن مسجلاً */}
                  {!user && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {language === "de" ? "Passwort *" : language === "ar" ? "كلمة المرور *" : "Password *"}
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={language === "de" ? "Mind. 6 Zeichen" : language === "ar" ? "6 أحرف على الأقل" : "Min 6 characters"}
                        className="w-full border border-input rounded-lg px-4 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}
                  {saveMsg && (
                    <p className={`text-sm font-medium ${saveMsg.includes("✅") ? "text-green-600" : "text-red-500"}`}>
                      {saveMsg}
                    </p>
                  )}
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleSave}
                      disabled={saving || formData.name.trim().length < 2 || !isValidEmail(formData.email) || (!user && password.length < 6)}
                      className="bg-primary"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? t("saving") : t("saveChanges")}
                    </Button>
                    {user && (
                      <Button
                        onClick={handleDeleteAccount}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        🗑 {language === "ar" ? "حذف الحساب" : language === "de" ? "Konto löschen" : "Delete Account"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Subscription */}
            {activeTab === "subscription" && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">{t("chooseYourPlan")}</h2>
                <div className="grid md:grid-cols-3 gap-6 items-stretch">
                  {plans.map(plan => (
                    <Card key={plan.id} className={`p-6 border-2 transition-colors flex flex-col justify-between ${
                      selectedPlan === plan.id ? "border-primary" : "hover:border-primary"
                    }`}>
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-2xl font-bold text-primary mb-4">{plan.price}</p>
                      <ul className="space-y-2 mb-6 flex-1">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => selectedPlan !== plan.id && handleSelectPlan(plan.id)}
                        className={`w-full ${selectedPlan === plan.id ? "bg-gray-400 cursor-default" : "bg-primary hover:bg-primary/90 cursor-pointer"}`}
                      >
                        {selectedPlan === plan.id ? t("currentPlanBtn") : t("selectPlan")}
                      </Button>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">{t("notifications")}</h2>
                <div className="space-y-4">
                  {[
                    { key: "emailNotifications", label: t("emailNotifications") },
                    { key: "analysisAlerts", label: t("analysisAlerts") },
                    { key: "weeklyReports", label: t("weeklyReports") },
                    { key: "communityUpdates", label: t("communityUpdates") },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <span className="font-medium">{label}</span>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof notifications] }))}
                        className={`w-12 h-6 rounded-full transition-colors ${notifications[key as keyof typeof notifications] ? "bg-primary" : "bg-gray-300"}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications[key as keyof typeof notifications] ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Preferences */}
            {activeTab === "preferences" && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">{t("preferences")}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t("language")}</label>
                    <select value={autoDetect ? "auto" : selectedLanguage}
                      onChange={e => handleLanguageChange(e.target.value)}
                      className="w-full border border-input bg-background rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="auto">🌐 Auto-detect</option>
                      <option value="en">🇬🇧 English</option>
                      <option value="ar">🇸🇦 العربية</option>
                      <option value="es">🇪🇸 Español</option>
                      <option value="fr">🇫🇷 Français</option>
                      <option value="de">🇩🇪 Deutsch</option>
                      <option value="zh">🇨🇳 中文</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <span className="font-medium">{t("darkMode")}</span>
                    <button onClick={toggleTheme}
                      className={`w-12 h-6 rounded-full transition-colors ${theme === "dark" ? "bg-primary" : "bg-gray-300"}`}>
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <span className="font-medium">{t("voiceFeature")}</span>
                    <button onClick={() => setVoiceEnabled(v => !v)}
                      className={`w-12 h-6 rounded-full transition-colors ${voiceEnabled ? "bg-primary" : "bg-gray-300"}`}>
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${voiceEnabled ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                  {voiceEnabled && (
                    <Button onClick={() => {
                      setIsSpeaking(true);
                      const u = new SpeechSynthesisUtterance("This is a test");
                      u.onend = () => setIsSpeaking(false);
                      window.speechSynthesis.speak(u);
                    }} disabled={isSpeaking} className="w-full bg-primary">
                      <Volume2 className="w-4 h-4 mr-2" />
                      {isSpeaking ? t("speaking") : t("testVoice")}
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
