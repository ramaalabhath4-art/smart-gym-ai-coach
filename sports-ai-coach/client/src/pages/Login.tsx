import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const T = {
  en: { login: "Sign In", register: "Create Account", email: "Email", password: "Password", name: "Full Name", submit: "Continue", switchToRegister: "Don't have an account? Register", switchToLogin: "Already have an account? Sign In", error: "Invalid email or password", success: "Welcome!", nameMin: "Name must be at least 2 characters", passMin: "Password must be at least 6 characters" },
  ar: { login: "تسجيل الدخول", register: "إنشاء حساب", email: "البريد الإلكتروني", password: "كلمة المرور", name: "الاسم الكامل", submit: "متابعة", switchToRegister: "ليس لديك حساب؟ سجل", switchToLogin: "لديك حساب؟ سجل دخولك", error: "بريد أو كلمة مرور غير صحيحة", success: "مرحباً!", nameMin: "الاسم يجب أن يكون حرفين على الأقل", passMin: "كلمة المرور 6 أحرف على الأقل" },
  de: { login: "Anmelden", register: "Konto erstellen", email: "E-Mail", password: "Passwort", name: "Vollständiger Name", submit: "Weiter", switchToRegister: "Kein Konto? Registrieren", switchToLogin: "Bereits ein Konto? Anmelden", error: "Ungültige E-Mail oder Passwort", success: "Willkommen!", nameMin: "Name muss mindestens 2 Zeichen lang sein", passMin: "Passwort muss mindestens 6 Zeichen lang sein" },
  fr: { login: "Se connecter", register: "Créer un compte", email: "E-mail", password: "Mot de passe", name: "Nom complet", submit: "Continuer", switchToRegister: "Pas de compte? S'inscrire", switchToLogin: "Déjà un compte? Se connecter", error: "E-mail ou mot de passe invalide", success: "Bienvenue!", nameMin: "Le nom doit comporter au moins 2 caractères", passMin: "Le mot de passe doit comporter au moins 6 caractères" },
  es: { login: "Iniciar sesión", register: "Crear cuenta", email: "Correo", password: "Contraseña", name: "Nombre completo", submit: "Continuar", switchToRegister: "¿No tienes cuenta? Regístrate", switchToLogin: "¿Ya tienes cuenta? Inicia sesión", error: "Email o contraseña inválidos", success: "¡Bienvenido!", nameMin: "El nombre debe tener al menos 2 caracteres", passMin: "La contraseña debe tener al menos 6 caracteres" },
  zh: { login: "登录", register: "创建账户", email: "电子邮件", password: "密码", name: "全名", submit: "继续", switchToRegister: "没有账户？注册", switchToLogin: "已有账户？登录", error: "邮箱或密码无效", success: "欢迎！", nameMin: "姓名至少需要2个字符", passMin: "密码至少需要6个字符" },
};

export default function Login() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const t = (k: string) => T[language as keyof typeof T]?.[k as keyof typeof T["en"]] ?? k;

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (isRegister && form.name.trim().length < 2) { setError(t("nameMin")); return; }
    if (form.password.length < 6) { setError(t("passMin")); return; }

    setLoading(true);
    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body = isRegister
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("error"));
      } else {
        window.location.href = "/";
      }
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        {/* Logo */}
        <div className="text-center">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663336019026/a2PqiZtbbD4QZshCfEaJrE/wazenai-logo-cyagJdoLe2Guga9PzDxGRH.webp"
            alt="WazenAI" className="w-16 h-16 mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-primary">WazenAI</h1>
          <p className="text-muted-foreground text-sm mt-1">Smart Gym AI Coach</p>
        </div>

        <h2 className="text-xl font-bold text-center">
          {isRegister ? t("register") : t("login")}
        </h2>

        <div className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium mb-1">{t("name")} *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder={t("name")}
                className="w-full border border-input bg-background rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">{t("email")} *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full border border-input bg-background rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t("password")} *</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="••••••"
              className="w-full border border-input bg-background rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading || !form.email || !form.password}
            className="w-full bg-primary"
          >
            {loading ? "..." : t("submit")}
          </Button>

          <button
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            className="w-full text-sm text-primary hover:underline text-center"
          >
            {isRegister ? t("switchToLogin") : t("switchToRegister")}
          </button>
        </div>
      </Card>
    </div>
  );
}
