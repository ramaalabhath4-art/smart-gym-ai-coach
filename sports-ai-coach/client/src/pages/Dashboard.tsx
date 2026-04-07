import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BarChart3, Activity, Zap, Flame, TrendingUp,
  Settings, LogOut, MessageSquare, Trophy, AlertTriangle,
  ChevronDown, ChevronUp
} from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Cell
} from "recharts";

export default function Dashboard() {
  const { user, logout }  = useAuth();
  const storedUserId = (() => { try { const id = localStorage.getItem("userId"); return id ? parseInt(id) : undefined; } catch { return undefined; } })();
  const effectiveUserId = user?.id ?? storedUserId;
  const { data: dbUser } = trpc.auth.getUserById.useQuery(
    { id: effectiveUserId! },
    { enabled: !!effectiveUserId }
  );
  const displayName = dbUser?.name ?? user?.name ?? "";
  const { t, language }   = useLanguage();
  const [, setLocation]   = useLocation();
  const [loading, setLoading]           = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showErrors, setShowErrors]     = useState(false);

  // ================== DATA FETCHING ==================
  const { data: statsData } = trpc.analysis.getStats.useQuery(
    { userId: effectiveUserId },
    { enabled: !!effectiveUserId }
  );

  const { data: historyData } = trpc.analysis.getHistory.useQuery(
    { limit: 10, userId: effectiveUserId },
    { enabled: !!effectiveUserId }
  );

  const { data: chatSessions } = trpc.generalChat.getSessions.useQuery(undefined, {
    enabled: !!user && showChatHistory,
  });

  const { data: myErrors } = trpc.errorAnalytics.getMyErrors.useQuery(
    { limit: 5 },
    { enabled: !!user }
  );

  const recentAnalysis    = historyData ?? [];
  const weeklyProgress    = statsData?.weeklyProgress    ?? [];
  const exerciseBreakdown = statsData?.exerciseBreakdown ?? [];
  const topErrors         = statsData?.topErrors         ?? [];

  // ================== STATS CARDS ==================
  const stats = [
    {
      label: t("dashboard.totalSessions"),
      value: String(statsData?.totalSessions ?? 0),
      icon:  Activity,
      color: "text-blue-500",
      bg:    "bg-blue-50",
    },
    {
      label: t("dashboard.totalExercises"),
      value: String(exerciseBreakdown.length),
      icon:  BarChart3,
      color: "text-purple-500",
      bg:    "bg-purple-50",
    },
    {
      label: t("dashboard.avgScore"),
      value: `${statsData?.avgScore ?? 0}%`,
      icon:  TrendingUp,
      color: "text-green-500",
      bg:    "bg-green-50",
    },
    {
      label: statsData?.bestExercise
        ? (language === "ar" ? "أفضل تمرين" : "Best Exercise")
        : t("dashboard.currentStreak"),
      value: statsData?.bestExercise ?? "—",
      icon:  Trophy,
      color: "text-orange-500",
      bg:    "bg-orange-50",
    },
  ];

  // ================== LOGOUT ==================
  const logoutMutation = trpc.auth.logout.useMutation();
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutMutation.mutateAsync();
      logout();
      setLocation("/");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ================== COLORS ==================
  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663336019026/a2PqiZtbbD4QZshCfEaJrE/wazenai-logo-cyagJdoLe2Guga9PzDxGRH.webp"
              alt="WazenAI" className="w-8 h-8"
            />
            <span className="text-xl font-bold text-primary">{t("nav.dashboard")}</span>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <span className="text-sm text-muted-foreground hidden md:block">
                👋 {displayName || user?.email || ""}
              </span>
            )}
            <Button size="sm" variant="outline" onClick={() => setLocation("/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              {t("nav.settings")}
            </Button>
            <Button size="sm" variant="outline" onClick={handleLogout} disabled={loading}>
              <LogOut className="w-4 h-4 mr-2" />
              {t("settings.cancel")}
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-8 space-y-8">

        {/* ── Stats Cards ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className={`p-6 ${stat.bg} border-0`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1 capitalize truncate max-w-[120px]">
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Weekly Progress Chart */}
            {weeklyProgress.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {language === "ar" ? "التقدم الأسبوعي" : language === "de" ? "Wöchentlicher Fortschritt" : "Weekly Progress"}
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, language === "ar" ? "الأداء" : language === "de" ? "Leistung" : "Performance"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ fill: "#6366f1", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Exercise Breakdown Chart */}
            {exerciseBreakdown.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  {language === "ar" ? "التمارين الأكثر أداءً" : "Most Practiced Exercises"}
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={exerciseBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="exercise"
                      tick={{ fontSize: 10 }}
                      angle={-15}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(val: any, name: string) => [
                        val,
                        name === "count"
                          ? (language === "ar" ? "عدد المرات" : "Sessions")
                          : (language === "ar" ? "متوسط الأداء" : "Avg Score")
                      ]}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {exerciseBreakdown.map((_: any, index: number) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Recent Analysis */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                {t("dashboard.recentAnalysis")}
              </h2>
              {recentAnalysis.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">{t("dashboard.noAnalysis")}</p>
                  <Button className="bg-primary" onClick={() => setLocation("/advanced-analysis")}>
                    <Zap className="w-4 h-4 mr-2" />
                    {t("home.startAnalysis")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAnalysis.map((analysis: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 bg-secondary/50 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium capitalize">{analysis.exerciseClass}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(analysis.createdAt).toLocaleDateString(
                            language === "ar" ? "ar-SA" : "en-US",
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </p>
                        {analysis.level && (
                          <p className="text-xs text-primary mt-1">{analysis.level}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{analysis.confidence}%</p>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "ثقة" : "confidence"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-4">

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">{t("nav.analysis")}</h3>
              <Button
                className="w-full bg-primary mb-3"
                onClick={() => setLocation("/advanced-analysis")}
              >
                <Zap className="w-4 h-4 mr-2" />
                {t("home.startAnalysis")}
              </Button>
              <Button
                className="w-full mb-3"
                variant="outline"
                onClick={() => setLocation("/demo")}
              >
                {t("nav.demo")}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setLocation("/")}
              >
                {t("nav.home")}
              </Button>
            </Card>

            {/* Top Errors */}
            {(myErrors && myErrors.length > 0) || (topErrors && topErrors.length > 0) ? (
              <Card className="p-6">
                <button
                  className="w-full flex items-center justify-between mb-3"
                  onClick={() => setShowErrors(!showErrors)}
                >
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    {language === "ar" ? "أكثر الأخطاء تكراراً" : "Most Common Errors"}
                  </h3>
                  {showErrors
                    ? <ChevronUp className="w-4 h-4" />
                    : <ChevronDown className="w-4 h-4" />
                  }
                </button>
                {showErrors && (
                  <div className="space-y-2">
                    {(myErrors ?? topErrors).map((error: any, i: number) => (
                      <div
                        key={i}
                        className="p-3 bg-orange-50 rounded-lg border-l-3 border-orange-400"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-orange-600 capitalize">
                            {error.exercise}
                          </span>
                          <span className="text-xs bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full">
                            {error.count}x
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{error.errorText}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ) : null}

            {/* General Chat History */}
            <Card className="p-6">
              <button
                className="w-full flex items-center justify-between mb-3"
                onClick={() => setShowChatHistory(!showChatHistory)}
              >
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  {language === "ar" ? "سجل المحادثات" : "Chat History"}
                </h3>
                {showChatHistory
                  ? <ChevronUp className="w-4 h-4" />
                  : <ChevronDown className="w-4 h-4" />
                }
              </button>
              {showChatHistory && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {!chatSessions || chatSessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {language === "ar" ? "لا توجد محادثات بعد" : "No chat history yet"}
                    </p>
                  ) : (
                    chatSessions.map((session: any, i: number) => (
                      <div key={i} className="p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">
                            {session.sessionName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(session.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {session.messages?.length ?? 0}{" "}
                          {language === "ar" ? "رسالة" : "messages"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
