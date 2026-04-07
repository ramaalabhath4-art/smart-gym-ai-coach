import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, ArrowLeft, Play, CheckCircle, X } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

const exerciseVideos = [
  { key: "exercise.barbellBicepsCurl", videoUrl: "https://www.youtube.com/embed/JJB8XgKltA8" },
  { key: "exercise.benchPress",        videoUrl: "https://www.youtube.com/embed/SCVCLChPQFY" },
  { key: "exercise.chestFlyMachine",   videoUrl: "https://www.youtube.com/embed/eGjt4lk6g34" },
  { key: "exercise.deadlift",          videoUrl: "https://www.youtube.com/embed/xNwpvDuZJ3k" },
  { key: "exercise.declineBenchPress", videoUrl: "https://www.youtube.com/embed/5NStATS0zrw" },
  { key: "exercise.hammerCurl",        videoUrl: "https://www.youtube.com/embed/BRVDS6HVR9Q" },
  { key: "exercise.hipThrust",         videoUrl: "https://www.youtube.com/embed/LM8XHLYJoYs" },
  { key: "exercise.inclineBenchPress", videoUrl: "https://www.youtube.com/embed/8iPEnn-ltC8" },
  { key: "exercise.latPulldown",       videoUrl: "https://www.youtube.com/embed/CAwf7n6Luuc" },
  { key: "exercise.lateralRaise",      videoUrl: "https://www.youtube.com/embed/3VcKaXpzqRo" },
  { key: "exercise.legExtension",      videoUrl: "https://www.youtube.com/embed/YyvSfVjQeL0" },
  { key: "exercise.legRaises",         videoUrl: "https://www.youtube.com/embed/AKvRTjwkkHw" },
  { key: "exercise.plank",             videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw" },
  { key: "exercise.pullUp",            videoUrl: "https://www.youtube.com/embed/eGo4IYlbE5g" },
  { key: "exercise.pushUp",            videoUrl: "https://www.youtube.com/embed/IODxDxX7oi4" },
  { key: "exercise.romanianDeadlift",  videoUrl: "https://www.youtube.com/embed/g5u75sgpn04" },
  { key: "exercise.russianTwist",      videoUrl: "https://www.youtube.com/embed/wkD8rjkodUI" },
  { key: "exercise.shoulderPress",     videoUrl: "https://www.youtube.com/embed/B-aVuyhvLHU" },
  { key: "exercise.squat",             videoUrl: "https://www.youtube.com/embed/Aj2933BdTb0" },
  { key: "exercise.tBarRow",           videoUrl: "https://www.youtube.com/embed/6EghH8jNgr8" },
  { key: "exercise.tricepPushdown",    videoUrl: "https://www.youtube.com/embed/2-LAMcpzODU" },
  { key: "exercise.tricepDips",        videoUrl: "https://www.youtube.com/embed/SpSE_A5L-YA" },
];

export default function Demo() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const steps = [
    {
      number: 1,
      title: t("demo.step1"),
      description: t("demo.step1Desc"),
      icon: "📹"
    },
    {
      number: 2,
      title: t("demo.step2"),
      description: t("demo.step2Desc"),
      icon: "💪"
    },
    {
      number: 3,
      title: t("demo.step3"),
      description: t("demo.step3Desc"),
      icon: "🏃"
    },
    {
      number: 4,
      title: t("demo.step4"),
      description: t("demo.step4Desc"),
      icon: "✅"
    },
    {
      number: 5,
      title: t("demo.step5"),
      description: t("demo.step5Desc"),
      icon: "📊"
    },
    {
      number: 6,
      title: t("demo.step6"),
      description: t("demo.step6Desc"),
      icon: "📈"
    },
  ];

  const features = [
    { title: t("demo.feature1"), desc: t("demo.feature1Desc") },
    { title: t("demo.feature2"), desc: t("demo.feature2Desc") },
    { title: t("demo.feature3"), desc: t("demo.feature3Desc") },
    { title: t("demo.feature4"), desc: t("demo.feature4Desc") },
    { title: t("demo.feature5"), desc: t("demo.feature5Desc") },
    { title: t("demo.feature6"), desc: t("demo.feature6Desc") },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663336019026/a2PqiZtbbD4QZshCfEaJrE/wazenai-logo-cyagJdoLe2Guga9PzDxGRH.webp" alt="WazenAI" className="w-8 h-8" />
            <span className="text-xl font-bold text-primary">{t("nav.demo")}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">{t("demo.welcome")}</h1>
          <p className="text-xl text-muted-foreground mb-8">{t("demo.learnHow")}</p>
          <Button size="lg" className="bg-primary" onClick={() => setLocation("/advanced-analysis")}>
            <Play className="w-5 h-5 mr-2" />
            {t("home.startAnalysis")}
          </Button>
        </div>

        {/* Steps Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">{t("demo.sixSteps")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step) => (
              <Card key={step.number} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{step.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                        {step.number}
                      </div>
                      <h3 className="font-bold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">{t("demo.keyFeatures")}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="p-6 flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Exercise Videos Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">{t("demo.exerciseDemos")}</h2>
          <Card className="p-8">
            <div className="grid md:grid-cols-4 gap-4">
              {exerciseVideos.map((exercise, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-4 px-3 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors"
                  onClick={() => {
                    setSelectedVideo(exercise.videoUrl);
                    setSelectedExercise(t(exercise.key));
                  }}
                >
                  <Play className="w-5 h-5" />
                  <span className="text-sm font-medium text-center">{t(exercise.key)}</span>
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl p-0 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-bold text-lg text-foreground">{selectedExercise}</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedVideo(null);
                    setSelectedExercise(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="aspect-video bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={selectedVideo}
                  title={selectedExercise || "Exercise Video"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </Card>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">{t("demo.readyToStart")}</h2>
          <p className="text-lg text-muted-foreground mb-8">{t("demo.experience")}</p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-primary" onClick={() => setLocation("/advanced-analysis")}>
              <Play className="w-5 h-5 mr-2" />
              {t("home.startAnalysis")}
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/")}>
              {t("nav.home")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
