import React, { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";

const successTranslations = {
  en: {
    paymentSuccessful: "Payment Successful!",
    congratulations: "Congratulations",
    subscriptionActive: "Your subscription is now active",
    planType: "Plan Type",
    amount: "Amount",
    startDate: "Start Date",
    renewalDate: "Renewal Date",
    free: "Free",
    pro: "Pro",
    elite: "Elite",
    perMonth: "/month",
    features: "Features",
    basicAnalysis: "Basic Analysis",
    unlimitedAnalysis: "Unlimited Analysis",
    hdVideos: "HD Videos",
    prioritySupport: "Priority Support",
    advancedReports: "Advanced Reports",
    aiCoaching: "AI Coaching",
    oneOnOneSessions: "1-on-1 Sessions",
    backToDashboard: "Back to Dashboard",
    manageSubscription: "Manage Subscription",
    downloadReceipt: "Download Receipt",
    loginSuccess: "You have successfully logged in and completed payment",
  },
  ar: {
    paymentSuccessful: "تم الدفع بنجاح!",
    congratulations: "تهانينا",
    subscriptionActive: "اشتراكك الآن نشط",
    planType: "نوع الخطة",
    amount: "المبلغ",
    startDate: "تاريخ البدء",
    renewalDate: "تاريخ التجديد",
    free: "مجاني",
    pro: "Pro",
    elite: "Elite",
    perMonth: "/شهر",
    features: "الميزات",
    basicAnalysis: "تحليل أساسي",
    unlimitedAnalysis: "تحليل غير محدود",
    hdVideos: "مقاطع فيديو HD",
    prioritySupport: "دعم الأولوية",
    advancedReports: "تقارير متقدمة",
    aiCoaching: "تدريب ذكي",
    oneOnOneSessions: "جلسات فردية",
    backToDashboard: "العودة إلى لوحة التحكم",
    manageSubscription: "إدارة الاشتراك",
    downloadReceipt: "تحميل الإيصال",
    loginSuccess: "تم تسجيل الدخول بنجاح وإكمال الدفع",
  },
  es: {
    paymentSuccessful: "¡Pago Exitoso!",
    congratulations: "Felicidades",
    subscriptionActive: "Tu suscripción está activa",
    planType: "Tipo de Plan",
    amount: "Cantidad",
    startDate: "Fecha de Inicio",
    renewalDate: "Fecha de Renovación",
    free: "Gratis",
    pro: "Pro",
    elite: "Elite",
    perMonth: "/mes",
    features: "Características",
    basicAnalysis: "Análisis Básico",
    unlimitedAnalysis: "Análisis Ilimitado",
    hdVideos: "Videos HD",
    prioritySupport: "Soporte Prioritario",
    advancedReports: "Reportes Avanzados",
    aiCoaching: "Entrenamiento IA",
    oneOnOneSessions: "Sesiones Individuales",
    backToDashboard: "Volver al Panel",
    manageSubscription: "Gestionar Suscripción",
    downloadReceipt: "Descargar Recibo",
    loginSuccess: "Ha iniciado sesión correctamente y completado el pago",
  },
  fr: {
    paymentSuccessful: "Paiement Réussi!",
    congratulations: "Félicitations",
    subscriptionActive: "Votre abonnement est maintenant actif",
    planType: "Type de Plan",
    amount: "Montant",
    startDate: "Date de Début",
    renewalDate: "Date de Renouvellement",
    free: "Gratuit",
    pro: "Pro",
    elite: "Elite",
    perMonth: "/mois",
    features: "Fonctionnalités",
    basicAnalysis: "Analyse Basique",
    unlimitedAnalysis: "Analyse Illimitée",
    hdVideos: "Vidéos HD",
    prioritySupport: "Support Prioritaire",
    advancedReports: "Rapports Avancés",
    aiCoaching: "Coaching IA",
    oneOnOneSessions: "Sessions Individuelles",
    backToDashboard: "Retour au Tableau de Bord",
    manageSubscription: "Gérer l'Abonnement",
    downloadReceipt: "Télécharger le Reçu",
    loginSuccess: "Vous vous êtes connecté avec succès et avez complété le paiement",
  },
  de: {
    paymentSuccessful: "Zahlung Erfolgreich!",
    congratulations: "Glückwunsch",
    subscriptionActive: "Ihr Abonnement ist jetzt aktiv",
    planType: "Plantyp",
    amount: "Betrag",
    startDate: "Startdatum",
    renewalDate: "Verlängerungsdatum",
    free: "Kostenlos",
    pro: "Pro",
    elite: "Elite",
    perMonth: "/Monat",
    features: "Funktionen",
    basicAnalysis: "Grundanalyse",
    unlimitedAnalysis: "Unbegrenzte Analyse",
    hdVideos: "HD-Videos",
    prioritySupport: "Prioritätssupport",
    advancedReports: "Erweiterte Berichte",
    aiCoaching: "KI-Coaching",
    oneOnOneSessions: "Einzelsitzungen",
    backToDashboard: "Zurück zum Dashboard",
    manageSubscription: "Abonnement Verwalten",
    downloadReceipt: "Beleg Herunterladen",
    loginSuccess: "Sie haben sich erfolgreich angemeldet und die Zahlung abgeschlossen",
  },
  zh: {
    paymentSuccessful: "支付成功!",
    congratulations: "恭喜",
    subscriptionActive: "您的订阅现已激活",
    planType: "计划类型",
    amount: "金额",
    startDate: "开始日期",
    renewalDate: "续订日期",
    free: "免费",
    pro: "Pro",
    elite: "Elite",
    perMonth: "/月",
    features: "功能",
    basicAnalysis: "基础分析",
    unlimitedAnalysis: "无限分析",
    hdVideos: "高清视频",
    prioritySupport: "优先支持",
    advancedReports: "高级报告",
    aiCoaching: "AI教练",
    oneOnOneSessions: "一对一课程",
    backToDashboard: "返回仪表板",
    manageSubscription: "管理订阅",
    downloadReceipt: "下载收据",
    loginSuccess: "您已成功登录并完成支付",
  },
};

const planFeatures = {
  free: ["basicAnalysis"],
  pro: ["unlimitedAnalysis", "hdVideos", "prioritySupport", "advancedReports"],
  elite: ["unlimitedAnalysis", "hdVideos", "prioritySupport", "advancedReports", "aiCoaching", "oneOnOneSessions"],
};

export default function PaymentSuccess() {
  const { user } = useAuth();
  const { language } = useLanguage();

  const searchParams = new URLSearchParams(window.location.search);
  const plan = searchParams.get("plan") || "pro";
  const amount = plan === "elite" ? "19.99" : plan === "pro" ? "9.99" : "0";

  const t = (key: string) =>
    successTranslations[language as keyof typeof successTranslations]?.[
      key as keyof (typeof successTranslations)["en"]
    ] || key;

  const today = new Date();
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const features = planFeatures[plan as keyof typeof planFeatures] || [];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">{t("paymentSuccessful")}</h1>
          <p className="text-lg text-muted-foreground">{t("loginSuccess")}</p>
        </div>

        {/* Plan Details Card */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">{t("congratulations")}</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-muted-foreground">{t("planType")}:</span>
              <span className="text-xl font-bold text-primary">
                {t(plan as keyof typeof successTranslations["en"])}
              </span>
            </div>
            
            {plan !== "free" && (
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">{t("amount")}:</span>
                <span className="text-xl font-bold">
                  ${amount}{t("perMonth")}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-muted-foreground">{t("startDate")}:</span>
              <span className="font-semibold">{today.toLocaleDateString()}</span>
            </div>
            
            {plan !== "free" && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("renewalDate")}:</span>
                <span className="font-semibold">{nextMonth.toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">{t("features")}:</h3>
            <ul className="space-y-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>{t(feature as keyof typeof successTranslations["en"])}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard" className="w-full">
            <Button className="w-full bg-primary text-white py-3 rounded-lg font-semibold">
              {t("backToDashboard")}
            </Button>
          </Link>
          
          <Link href="/settings" className="w-full">
            <Button variant="outline" className="w-full py-3 rounded-lg font-semibold">
              {t("manageSubscription")}
            </Button>
          </Link>
          
          <Button variant="outline" className="w-full py-3 rounded-lg font-semibold">
            {t("downloadReceipt")}
          </Button>
        </div>

        {/* Subscription Active Message */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-800 font-semibold">{t("subscriptionActive")}</p>
        </div>
      </div>
    </div>
  );
}
