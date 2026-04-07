import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreditCard, DollarSign, Globe } from "lucide-react";
import { Link } from "wouter";

const paymentTranslations = {
  en: {
    completePayment: "Complete Payment",
    selectPaymentMethod: "Select Payment Method",
    planDetails: "Plan Details",
    plan: "Plan",
    amount: "Amount",
    total: "Total",
    pro: "Pro",
    elite: "Elite",
    perMonth: "/month",
    creditCard: "Credit Card",
    paypal: "PayPal",
    googlePay: "Google Pay",
    applePay: "Apple Pay",
    cardNumber: "Card Number",
    expiryDate: "MM/YY",
    cvv: "CVV",
    fullName: "Full Name",
    payNow: "Pay Now",
    back: "Back",
    processingPayment: "Processing...",
    paypalEmail: "PayPal Email",
    googleEmail: "Google Account Email",
    appleEmail: "Apple ID Email",
    enterPaypalEmail: "Enter your PayPal email address",
    enterGoogleEmail: "Enter your Google account email",
    enterAppleEmail: "Enter your Apple ID email",
  },
  ar: {
    completePayment: "إكمال الدفع",
    selectPaymentMethod: "اختر طريقة الدفع",
    planDetails: "تفاصيل الخطة",
    plan: "الخطة",
    amount: "المبلغ",
    total: "الإجمالي",
    pro: "Pro",
    elite: "Elite",
    perMonth: "/شهر",
    creditCard: "بطاقة ائتمان",
    paypal: "PayPal",
    googlePay: "Google Pay",
    applePay: "Apple Pay",
    cardNumber: "رقم البطاقة",
    expiryDate: "MM/YY",
    cvv: "CVV",
    fullName: "الاسم الكامل",
    payNow: "ادفع الآن",
    back: "رجوع",
    processingPayment: "جاري المعالجة...",
    paypalEmail: "بريد PayPal",
    googleEmail: "بريد حساب Google",
    appleEmail: "بريد Apple ID",
    enterPaypalEmail: "أدخل بريد PayPal الخاص بك",
    enterGoogleEmail: "أدخل بريد حساب Google الخاص بك",
    enterAppleEmail: "أدخل بريد Apple ID الخاص بك",
  },
  es: {
    completePayment: "Completar Pago",
    selectPaymentMethod: "Seleccionar Método de Pago",
    planDetails: "Detalles del Plan",
    plan: "Plan",
    amount: "Cantidad",
    total: "Total",
    pro: "Pro",
    elite: "Elite",
    perMonth: "/mes",
    creditCard: "Tarjeta de Crédito",
    paypal: "PayPal",
    googlePay: "Google Pay",
    applePay: "Apple Pay",
    cardNumber: "Número de Tarjeta",
    expiryDate: "MM/YY",
    cvv: "CVV",
    fullName: "Nombre Completo",
    payNow: "Pagar Ahora",
    back: "Atrás",
    processingPayment: "Procesando...",
    paypalEmail: "Correo de PayPal",
    googleEmail: "Correo de Google",
    appleEmail: "Correo de Apple ID",
    enterPaypalEmail: "Ingresa tu correo de PayPal",
    enterGoogleEmail: "Ingresa tu correo de Google",
    enterAppleEmail: "Ingresa tu correo de Apple ID",
  },
  fr: {
    completePayment: "Finaliser le Paiement",
    selectPaymentMethod: "Sélectionner la Méthode de Paiement",
    planDetails: "Détails du Plan",
    plan: "Plan",
    amount: "Montant",
    total: "Total",
    pro: "Pro",
    elite: "Elite",
    perMonth: "/mois",
    creditCard: "Carte de Crédit",
    paypal: "PayPal",
    googlePay: "Google Pay",
    applePay: "Apple Pay",
    cardNumber: "Numéro de Carte",
    expiryDate: "MM/YY",
    cvv: "CVV",
    fullName: "Nom Complet",
    payNow: "Payer Maintenant",
    back: "Retour",
    processingPayment: "Traitement...",
    paypalEmail: "Email PayPal",
    googleEmail: "Email Google",
    appleEmail: "Email Apple ID",
    enterPaypalEmail: "Entrez votre email PayPal",
    enterGoogleEmail: "Entrez votre email Google",
    enterAppleEmail: "Entrez votre email Apple ID",
  },
  de: {
    completePayment: "Zahlung Abschließen",
    selectPaymentMethod: "Zahlungsmethode Auswählen",
    planDetails: "Plandetails",
    plan: "Plan",
    amount: "Betrag",
    total: "Gesamt",
    pro: "Pro",
    elite: "Elite",
    perMonth: "/Monat",
    creditCard: "Kreditkarte",
    paypal: "PayPal",
    googlePay: "Google Pay",
    applePay: "Apple Pay",
    cardNumber: "Kartennummer",
    expiryDate: "MM/YY",
    cvv: "CVV",
    fullName: "Vollständiger Name",
    payNow: "Jetzt Zahlen",
    back: "Zurück",
    processingPayment: "Wird verarbeitet...",
    paypalEmail: "PayPal-E-Mail",
    googleEmail: "Google-E-Mail",
    appleEmail: "Apple ID-E-Mail",
    enterPaypalEmail: "Geben Sie Ihre PayPal-E-Mail ein",
    enterGoogleEmail: "Geben Sie Ihre Google-E-Mail ein",
    enterAppleEmail: "Geben Sie Ihre Apple ID-E-Mail ein",
  },
  zh: {
    completePayment: "完成付款",
    selectPaymentMethod: "选择付款方式",
    planDetails: "计划详情",
    plan: "计划",
    amount: "金额",
    total: "总计",
    pro: "Pro",
    elite: "Elite",
    perMonth: "/月",
    creditCard: "信用卡",
    paypal: "PayPal",
    googlePay: "Google Pay",
    applePay: "Apple Pay",
    cardNumber: "卡号",
    expiryDate: "MM/YY",
    cvv: "CVV",
    fullName: "全名",
    payNow: "立即支付",
    back: "返回",
    processingPayment: "处理中...",
    paypalEmail: "PayPal电子邮件",
    googleEmail: "谷歌账户电子邮件",
    appleEmail: "Apple ID电子邮件",
    enterPaypalEmail: "输入您的PayPal电子邮件",
    enterGoogleEmail: "输入您的谷歌账户电子邮件",
    enterAppleEmail: "输入您的Apple ID电子邮件",
  },
};

const paymentMethods = [
  { id: "card", name: "creditCard", icon: CreditCard, color: "bg-blue-500" },
  { id: "paypal", name: "paypal", icon: DollarSign, color: "bg-yellow-500" },
  { id: "google", name: "googlePay", icon: Globe, color: "bg-red-500" },
  { id: "apple", name: "applePay", icon: CreditCard, color: "bg-gray-800" },
];

export default function Payment() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<string>("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const plan = searchParams.get("plan") || "pro";
  const amount = plan === "elite" ? "19.99" : "9.99";

  const t = (key: string) =>
    paymentTranslations[language as keyof typeof paymentTranslations]?.[
      key as keyof (typeof paymentTranslations)["en"]
    ] || key;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePayment = async () => {
    // Validate based on payment method
    if (selectedMethod === "paypal") {
      const paypalEmail = (document.querySelector('input[placeholder*="PayPal"]') as HTMLInputElement)?.value;
      if (!paypalEmail || !validateEmail(paypalEmail)) {
        alert(t("enterPaypalEmail"));
        return;
      }
    } else if (selectedMethod === "google") {
      const googleEmail = (document.querySelector('input[placeholder*="Google"]') as HTMLInputElement)?.value;
      if (!googleEmail || !validateEmail(googleEmail)) {
        alert(t("enterGoogleEmail"));
        return;
      }
    } else if (selectedMethod === "apple") {
      const appleEmail = (document.querySelector('input[placeholder*="Apple"]') as HTMLInputElement)?.value;
      if (!appleEmail || !validateEmail(appleEmail)) {
        alert(t("enterAppleEmail"));
        return;
      }
    }

    setIsProcessing(true);
    try {
      // Save payment data to database
      const paymentData = {
        userId: user?.id,
        plan,
        amount,
        paymentMethod: selectedMethod,
        timestamp: new Date().toISOString(),
        status: 'completed',
      };
      
      // TODO: Send to backend API to save to database and trigger n8n workflow
      console.log('Payment data:', paymentData);
      
      setTimeout(() => {
        // Redirect to success page
        window.location.href = `/payment-success?plan=${plan}`;
      }, 1500);
    } catch (error) {
      alert('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-8">
        <Link
          href="/settings"
          className="mb-6 text-primary hover:underline flex items-center gap-2 inline-block"
        >
          ← {t("back")}
        </Link>

        <h1 className="text-3xl font-bold mb-8">{t("completePayment")}</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t("planDetails")}</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("plan")}:</span>
                <span className="font-semibold">
                  {plan === "elite" ? t("elite") : t("pro")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("amount")}:</span>
                <span className="font-semibold text-lg">
                  ${amount}
                  {t("perMonth")}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold">
                  <span>{t("total")}:</span>
                  <span className="text-primary">${amount}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Methods */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {t("selectPaymentMethod")}
            </h2>
            <div className="space-y-3 mb-6">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      selectedMethod === method.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`${method.color} p-2 rounded text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">
                      {t(
                        method.name as keyof (typeof paymentTranslations)["en"]
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Card Form (shown for credit card) */}
            {selectedMethod === "card" && (
              <Card className="p-4 mb-6 bg-muted/50">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={t("fullName")}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                  <input
                    type="text"
                    placeholder={t("cardNumber")}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder={t("expiryDate")}
                      className="px-3 py-2 border rounded-md bg-background"
                    />
                    <input
                      type="text"
                      placeholder={t("cvv")}
                      className="px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* PayPal Form */}
            {selectedMethod === "paypal" && (
              <Card className="p-4 mb-6 bg-muted/50">
                <div className="space-y-3">
                  <label className="block text-sm font-medium">{t("paypalEmail")}</label>
                  <input
                    type="email"
                    placeholder={t("enterPaypalEmail")}
                    required
                    className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </Card>
            )}

            {/* Google Pay Form */}
            {selectedMethod === "google" && (
              <Card className="p-4 mb-6 bg-muted/50">
                <div className="space-y-3">
                  <label className="block text-sm font-medium">{t("googleEmail")}</label>
                  <input
                    type="email"
                    placeholder={t("enterGoogleEmail")}
                    required
                    className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </Card>
            )}

            {/* Apple Pay Form */}
            {selectedMethod === "apple" && (
              <Card className="p-4 mb-6 bg-muted/50">
                <div className="space-y-3">
                  <label className="block text-sm font-medium">{t("appleEmail")}</label>
                  <input
                    type="email"
                    placeholder={t("enterAppleEmail")}
                    required
                    className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </Card>
            )}

            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold"
            >
              {isProcessing ? t("processingPayment") : t("payNow")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
