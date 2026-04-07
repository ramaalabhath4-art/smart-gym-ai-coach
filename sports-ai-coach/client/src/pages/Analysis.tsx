import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { Activity, Upload, Zap } from "lucide-react";

export default function Analysis() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (cameraActive && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Camera error:", err));
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setResults({
        formScore: 89,
        jointAngles: {
          knee: 85,
          back: 45,
          elbow: 92,
        },
        corrections: [
          { issue: "Back Too Rounded", suggestion: "Keep your back straight" },
          { issue: "Knees Caving In", suggestion: "Push your knees outward" },
        ],
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-primary">AI Sports Coach</span>
          </div>
          <a href="/" className="text-primary hover:underline">Back</a>
        </div>
      </nav>

      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-8">Exercise Analysis</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">Live Analysis</h2>
            {cameraActive ? (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg bg-black"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-2">
                  <Button onClick={() => setCameraActive(false)} variant="outline" className="flex-1">
                    Stop Camera
                  </Button>
                  <Button onClick={startAnalysis} disabled={isAnalyzing} className="flex-1 bg-primary">
                    <Zap className="w-4 h-4 mr-2" />
                    {isAnalyzing ? "Analyzing..." : "Analyze"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Camera Off</span>
                </div>
                <Button onClick={() => setCameraActive(true)} className="w-full bg-primary">
                  <Activity className="w-4 h-4 mr-2" />
                  Start Camera
                </Button>
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </Button>
              </div>
            )}
          </Card>

          <div className="space-y-6">
            {results ? (
              <>
                <Card className="p-8">
                  <h2 className="text-2xl font-bold mb-4">Form Score</h2>
                  <div className="text-6xl font-bold text-primary mb-2">{results.formScore}%</div>
                  <p className="text-muted-foreground">Great form! Keep it up.</p>
                </Card>

                <Card className="p-8">
                  <h2 className="text-2xl font-bold mb-4">Joint Angles</h2>
                  <div className="space-y-3">
                    {Object.entries(results.jointAngles).map(([joint, angle]: [string, unknown]) => (
                      <div key={joint} className="flex justify-between items-center">
                        <span className="capitalize">{joint} Angle:</span>
                        <span className="font-bold text-primary">{String(angle)}°</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-8">
                  <h2 className="text-2xl font-bold mb-4">Corrections Needed</h2>
                  <div className="space-y-3">
                    {results.corrections.map((correction: any, idx: number) => (
                      <div key={idx} className="border-l-4 border-orange-500 pl-4">
                        <p className="font-semibold text-orange-600">{correction.issue}</p>
                        <p className="text-sm text-muted-foreground">{correction.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Start analysis to see results</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
