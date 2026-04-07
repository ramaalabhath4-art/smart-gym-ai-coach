import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Activity, Upload, Zap, Loader2, Send, X, AlertCircle, ArrowLeft, Trash2, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663336019026/a2PqiZtbbD4QZshCfEaJrE/wazenai-logo-cyagJdoLe2Guga9PzDxGRH.webp";

interface AnalysisResult {
  className: string;
  confidence: number;
  keypoints: any[];
  corrections: string[];
}

interface ChatSession {
  id: string;
  name: string;
  messages: { role: string; content: string }[];
  createdAt: number;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    advancedAnalysis: "Advanced Exercise Analysis",
    stopCamera: "Stop Camera",
    clearVideo: "Clear Video",
    analyzeVideo: "Analyze Video",
    processing: "Processing...",
    noVideoSelected: "No video selected",
    startCamera: "Start Camera",
    uploadVideo: "Upload Video",
    analysisResults: "Analysis Results",
    confidence: "Confidence",
    similarityScore: "Similarity Score",
    corrections: "Corrections",
    sendMessage: "Send",
    analysisError: "Analysis error",
    back: "Back",
    newChat: "New Chat",
    deleteChat: "Delete",
    chatHistory: "Chat History",
    stopRecording: "Stop Recording",
    getReady: "Get ready...",
    recording: "REC",
  },
  ar: {
    advancedAnalysis: "تحليل التمارين المتقدم",
    stopCamera: "إيقاف الكاميرا",
    clearVideo: "حذف الفيديو",
    analyzeVideo: "تحليل الفيديو",
    processing: "جاري المعالجة...",
    noVideoSelected: "لم يتم اختيار فيديو",
    startCamera: "بدء الكاميرا",
    uploadVideo: "تحميل فيديو",
    analysisResults: "نتائج التحليل",
    confidence: "الثقة",
    similarityScore: "درجة التشابه",
    corrections: "التصحيحات",
    sendMessage: "إرسال",
    analysisError: "خطأ في التحليل",
    back: "رجوع",
    newChat: "محادثة جديدة",
    deleteChat: "حذف",
    chatHistory: "سجل المحادثات",
    stopRecording: "إيقاف التسجيل",
    getReady: "جاري التحضير...",
    recording: "تسجيل",
  },
  de: {
    advancedAnalysis: "Erweiterte Bewegungsanalyse",
    stopCamera: "Kamera stoppen",
    clearVideo: "Video löschen",
    analyzeVideo: "Video analysieren",
    processing: "Verarbeitung läuft...",
    noVideoSelected: "Kein Video ausgewählt",
    startCamera: "Kamera starten",
    uploadVideo: "Video hochladen",
    analysisResults: "Analyseergebnisse",
    confidence: "Vertrauen",
    similarityScore: "Ähnlichkeitswert",
    corrections: "Korrekturen",
    sendMessage: "Senden",
    analysisError: "Analysefehler",
    back: "Zurück",
    newChat: "Neuer Chat",
    deleteChat: "Löschen",
    chatHistory: "Chat-Verlauf",
    stopRecording: "Aufzeichnung stoppen",
    getReady: "Mach dich bereit...",
    recording: "REC",
  },
  fr: {
    advancedAnalysis: "Analyse Avancée des Exercices",
    stopCamera: "Arrêter la Caméra",
    clearVideo: "Effacer la Vidéo",
    analyzeVideo: "Analyser la Vidéo",
    processing: "Traitement en cours...",
    noVideoSelected: "Aucune vidéo sélectionnée",
    startCamera: "Démarrer la Caméra",
    uploadVideo: "Télécharger une Vidéo",
    analysisResults: "Résultats de l'Analyse",
    confidence: "Confiance",
    similarityScore: "Score de Similarité",
    corrections: "Corrections",
    sendMessage: "Envoyer",
    analysisError: "Erreur d'analyse",
    back: "Retour",
    newChat: "Nouveau Chat",
    deleteChat: "Supprimer",
    chatHistory: "Historique du Chat",
    stopRecording: "Arrêter l'Enregistrement",
    getReady: "Préparez-vous...",
    recording: "REC",
  },
  es: {
    advancedAnalysis: "Análisis Avanzado de Ejercicios",
    stopCamera: "Detener Cámara",
    clearVideo: "Borrar Video",
    analyzeVideo: "Analizar Video",
    processing: "Procesando...",
    noVideoSelected: "No hay video seleccionado",
    startCamera: "Iniciar Cámara",
    uploadVideo: "Cargar Video",
    analysisResults: "Resultados del Análisis",
    confidence: "Confianza",
    similarityScore: "Puntuación de Similitud",
    corrections: "Correcciones",
    sendMessage: "Enviar",
    analysisError: "Error de análisis",
    back: "Atrás",
    newChat: "Nuevo Chat",
    deleteChat: "Eliminar",
    chatHistory: "Historial de Chat",
    stopRecording: "Detener Grabación",
    getReady: "Prepárate...",
    recording: "REC",
  },
  zh: {
    advancedAnalysis: "高级运动分析",
    stopCamera: "停止摄像头",
    clearVideo: "清除视频",
    analyzeVideo: "分析视频",
    processing: "处理中...",
    noVideoSelected: "未选择视频",
    startCamera: "启动摄像头",
    uploadVideo: "上传视频",
    analysisResults: "分析结果",
    confidence: "置信度",
    similarityScore: "相似度分数",
    corrections: "纠正",
    sendMessage: "发送",
    analysisError: "分析错误",
    back: "返回",
    newChat: "新聊天",
    deleteChat: "删除",
    chatHistory: "聊天历史",
    stopRecording: "停止录制",
    getReady: "准备好了...",
    recording: "录制",
  },
};

// Translation dictionaries
const LEVEL_TR: Record<string, Record<string, string>> = {
  "ممتاز ⭐⭐⭐": { en: "Excellent ⭐⭐⭐", fr: "Excellent ⭐⭐⭐", de: "Ausgezeichnet ⭐⭐⭐", es: "Excelente ⭐⭐⭐", zh: "优秀 ⭐⭐⭐" },
  "جيد ⭐⭐":     { en: "Good ⭐⭐",      fr: "Bien ⭐⭐",      de: "Gut ⭐⭐",            es: "Bien ⭐⭐",      zh: "良好 ⭐⭐" },
  "مقبول ⭐":    { en: "Acceptable ⭐",  fr: "Acceptable ⭐",  de: "Akzeptabel ⭐",      es: "Aceptable ⭐",  zh: "及格 ⭐" },
  "يحتاج تدريب ⚠️": { en: "Needs Training ⚠️", fr: "Besoin d'entraînement ⚠️", de: "Braucht Training ⚠️", es: "Necesita entrenamiento ⚠️", zh: "需要训练 ⚠️" },
};

const DTW_TR: Record<string, Record<string, string>> = {
  "أداء رائع! استمر هكذا":     { en: "Great performance! Keep it up", fr: "Excellente performance!", de: "Tolle Leistung! Weiter so", es: "¡Excelente rendimiento!", zh: "表现出色！" },
  "أداء جيد مع بعض التحسينات": { en: "Good performance with some improvements", fr: "Bonne performance avec améliorations", de: "Gute Leistung, Verbesserungen nötig", es: "Buen rendimiento, mejoras necesarias", zh: "表现良好，需要改进" },
  "تحتاج لتحسين الأداء":       { en: "Performance needs improvement", fr: "La performance nécessite des améliorations", de: "Leistung muss verbessert werden", es: "El rendimiento necesita mejorar", zh: "表现需要改进" },
  "راجع طريقة أداء التمرين":   { en: "Please review your exercise technique", fr: "Veuillez revoir votre technique", de: "Bitte Übungstechnik überprüfen", es: "Por favor revise su técnica", zh: "请检查您的运动技术" },
};

const CORR_TR: Record<string, Record<string, string>> = {
  "⚠️ الركبة منحنية كثيراً - لا تتجاوز أصابع القدم": { en: "⚠️ Knees bending too much — don't go past your toes", fr: "⚠️ Genoux trop fléchis", de: "⚠️ Knie zu stark gebeugt", es: "⚠️ Rodillas demasiado dobladas", zh: "⚠️ 膝盖弯曲太多" },
  "⚠️ الظهر منحني - حافظ على استقامة الظهر":         { en: "⚠️ Back rounded — keep your back straight", fr: "⚠️ Dos arrondi", de: "⚠️ Rücken gerundet", es: "⚠️ Espalda redondeada", zh: "⚠️ 背部弯曲" },
  "⚠️ الظهر منحني - حافظ على جسم مستقيم":           { en: "⚠️ Back sagging — keep body straight", fr: "⚠️ Dos affaissé", de: "⚠️ Rücken hängend", es: "⚠️ Espalda caída", zh: "⚠️ 背部下垂" },
  "⚠️ المرفق منحني كثيراً - اخفض الثقل أكثر":        { en: "⚠️ Elbow bent too much — lower weight more", fr: "⚠️ Coude trop fléchi", de: "⚠️ Ellbogen zu gebeugt", es: "⚠️ Codo muy doblado", zh: "⚠️ 肘部弯曲太多" },
  "⚠️ لا تمد المرفق بالكامل":                        { en: "⚠️ Don't fully extend the elbow", fr: "⚠️ Ne pas étendre le coude", de: "⚠️ Ellbogen nicht strecken", es: "⚠️ No extiendas el codo", zh: "⚠️ 不要完全伸直肘部" },
  "⚠️ الكتفان غير متوازيان - ثبت جسمك":              { en: "⚠️ Shoulders uneven — stabilize your body", fr: "⚠️ Épaules inégales", de: "⚠️ Schultern ungleich", es: "⚠️ Hombros desiguales", zh: "⚠️ 肩膀不平衡" },
  "⚠️ ارفع الثقل أعلى - نطاق حركة كامل":            { en: "⚠️ Curl higher — full range of motion", fr: "⚠️ Montez plus haut", de: "⚠️ Höher heben", es: "⚠️ Sube más", zh: "⚠️ 举得更高" },
  "⚠️ الحوض مرتفع أو منخفض - حافظ على خط مستقيم":  { en: "⚠️ Hips too high or low — keep straight line", fr: "⚠️ Hanches mal positionnées", de: "⚠️ Hüften falsch positioniert", es: "⚠️ Caderas mal alineadas", zh: "⚠️ 髋部位置不对" },
  "⚠️ ارفع جسمك أعلى - نطاق حركة كامل":            { en: "⚠️ Pull higher — full range of motion", fr: "⚠️ Tirez plus haut", de: "⚠️ Höher ziehen", es: "⚠️ Tira más alto", zh: "⚠️ 拉得更高" },
  "⚠️ ارفع الحوض أعلى - نطاق حركة كامل":           { en: "⚠️ Raise hips higher — full range", fr: "⚠️ Levez les hanches", de: "⚠️ Hüften höher heben", es: "⚠️ Levanta más las caderas", zh: "⚠️ 抬高髋部" },
  "⚠️ ارفع الذراعين أعلى - نطاق حركة كامل":         { en: "⚠️ Raise arms higher — full range", fr: "⚠️ Levez les bras plus haut", de: "⚠️ Arme höher heben", es: "⚠️ Levanta los brazos más", zh: "⚠️ 手臂举得更高" },
  "⚠️ اسحب أكثر لأسفل - نطاق حركة كامل":           { en: "⚠️ Pull down more — full range", fr: "⚠️ Tirez davantage vers le bas", de: "⚠️ Weiter nach unten ziehen", es: "⚠️ Tira más hacia abajo", zh: "⚠️ 向下拉得更多" },
  "⚠️ المرفق منخفض جداً - ارفع الثقل أعلى":         { en: "⚠️ Elbow too low — press the weight higher", fr: "⚠️ Coude trop bas", de: "⚠️ Ellbogen zu tief", es: "⚠️ Codo demasiado bajo", zh: "⚠️ 肘部太低" },
  "⚠️ أنت قريب جداً - ابتعد قليلاً":               { en: "⚠️ Too close to camera — move back", fr: "⚠️ Trop près de la caméra", de: "⚠️ Zu nah an der Kamera", es: "⚠️ Muy cerca de la cámara", zh: "⚠️ 离相机太近" },
  "⚠️ أنت بعيد جداً - اقترب من الكاميرا":           { en: "⚠️ Too far from camera — move closer", fr: "⚠️ Trop loin de la caméra", de: "⚠️ Zu weit von der Kamera", es: "⚠️ Muy lejos de la cámara", zh: "⚠️ 离相机太远" },
  "⚠️ الإضاءة ضعيفة - تأكد من الإضاءة الجيدة":     { en: "⚠️ Poor lighting — ensure good lighting", fr: "⚠️ Mauvais éclairage", de: "⚠️ Schlechte Beleuchtung", es: "⚠️ Iluminación deficiente", zh: "⚠️ 光线不足" },
  "⚠️ الحركة غير منتظمة - كرر التمرين بشكل صحيح": { en: "⚠️ Irregular movement — repeat exercise correctly", fr: "⚠️ Mouvement irrégulier", de: "⚠️ Unregelmäßige Bewegung", es: "⚠️ Movimiento irregular", zh: "⚠️ 动作不规律" },
  "⚠️ لا توجد حركة كافية - تأكد أنك تؤدي التمرين": { en: "⚠️ Not enough movement — make sure you are exercising", fr: "⚠️ Pas assez de mouvement", de: "⚠️ Nicht genug Bewegung", es: "⚠️ Movimiento insuficiente", zh: "⚠️ 运动不足" },
  "✅ الأداء صحيح! استمر":                          { en: "✅ Great form! Keep it up", fr: "✅ Bonne forme! Continuez", de: "✅ Gute Form! Weiter so", es: "✅ ¡Buena forma! Sigue así", zh: "✅ 动作正确！继续" },
};

export default function AdvancedAnalysis() {
  const videoRef        = useRef<HTMLVideoElement>(null);
  const fileInputRef    = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [, setLocation] = useLocation();
  const { language }    = useLanguage();

  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isRecording, setIsRecording]   = useState(false);
  const [countdown, setCountdown]       = useState<number | null>(null);
  const [showTip, setShowTip]           = useState(false);
  const [videoFile, setVideoFile]       = useState<File | null>(null);
  const [videoSource, setVideoSource]   = useState<"camera" | "upload">("camera");
  const [results, setResults]           = useState<AnalysisResult | null>(null);
  const [similarityScore, setSimilarityScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatInput, setChatInput]       = useState("");
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const [newChatName, setNewChatName]     = useState("");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingName, setEditingName]     = useState("");

  const t = (key: string) => translations[language]?.[key] || translations.en[key];

  const ERROR_TR: Record<string, Record<string, string>> = {
    "Unknown exercise": { ar: "حركة غير معروفة", de: "Unbekannte Übung", fr: "Exercice inconnu", es: "Ejercicio desconocido", zh: "未知练习" },
    "wrong position":   { ar: "وضع خاطئ",        de: "falsche Position",  fr: "mauvaise position", es: "posición incorrecta", zh: "位置错误" },
    "Low quality":      { ar: "جودة منخفضة",     de: "Niedrige Qualität", fr: "Qualité faible",    es: "Calidad baja",       zh: "质量低" },
    "low confidence":   { ar: "ثقة منخفضة",      de: "Niedrige Konfidenz", fr: "Faible confiance", es: "Confianza baja",      zh: "置信度低" },
    "الحركة رأسية — يجب أن تكون جانبية": { de: "Vertikale Bewegung — bitte seitlich ausführen", fr: "Mouvement vertical — effectuez latéralement", es: "Movimiento vertical — realice lateralmente", zh: "垂直运动 — 请横向执行", en: "Vertical movement — please perform laterally" },
    "الحركة جانبية — يجب أن تكون للأعلى والأسفل": { de: "Seitliche Bewegung — bitte auf und ab ausführen", fr: "Mouvement latéral — effectuez de haut en bas", es: "Movimiento lateral — realice arriba y abajo", zh: "横向运动 — 请上下执行", en: "Lateral movement — please perform up and down" },
    "لا توجد حركة كافية للتمرين": { de: "Nicht genug Bewegung für die Übung", fr: "Pas assez de mouvement pour l'exercice", es: "No hay suficiente movimiento para el ejercicio", zh: "运动不足", en: "Not enough movement for the exercise" },
    "ثقة منخفضة جداً — يرجى تكرار التمرين بشكل صحيح": { 
    de: "Zu geringe Konfidenz — bitte Übung korrekt wiederholen", 
    fr: "Confiance trop faible — répétez l'exercice correctement", 
    es: "Confianza muy baja — repita el ejercicio correctamente", 
    zh: "置信度太低 — 请正确重复练习", 
    en: "Low confidence — please repeat the exercise correctly" },
  };  

  const translateError = (msg: string) => {
    if (language === "en") return msg;
    for (const [en, tr] of Object.entries(ERROR_TR)) {
      if (msg.includes(en)) {
        const translated = tr[language] ?? en;
        return msg.replace(en, translated);
      }
    }
    return msg;
  };

  const translateText = (text: string, dict: Record<string, Record<string, string>>) => {
    if (language === "ar") return text;
    for (const [ar, tr] of Object.entries(dict)) {
      if (text.includes(ar)) return tr[language] ?? tr["en"] ?? text;
    }
    return text;
  };

  // Load/save chat sessions + auto-create one if empty
  useEffect(() => {
    const saved = localStorage.getItem("chatSessions");
    let sessions: ChatSession[] = [];
    if (saved) {
      sessions = JSON.parse(saved);
    }
    if (sessions.length === 0) {
      const defaultChat: ChatSession = {
        id: Date.now().toString(),
        name: `Chat 1`,
        messages: [],
        createdAt: Date.now(),
      };
      sessions = [defaultChat];
      localStorage.setItem("chatSessions", JSON.stringify(sessions));
    }
    setChatSessions(sessions);
    setCurrentChatId(sessions[sessions.length - 1].id);
  }, []);

  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem("chatSessions", JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  const videoObjectUrl = useMemo(
    () => videoFile ? URL.createObjectURL(videoFile) : null,
    [videoFile]
  );

  const currentChat = useMemo(
    () => chatSessions.find(s => s.id === currentChatId),
    [chatSessions, currentChatId]
  );

  const createNewChat = () => {
    const time = new Date().toLocaleTimeString();
    setNewChatName(`Chat ${time}`);
    setShowNameInput(true);
  };

  const confirmNewChat = () => {
    const time = new Date().toLocaleTimeString();
    const newChat: ChatSession = {
      id: Date.now().toString(),
      name: newChatName.trim() || `Chat ${time}`,
      messages: [],
      createdAt: Date.now(),
    };
    setChatSessions(prev => {
      const updated = [...prev, newChat];
      localStorage.setItem("chatSessions", JSON.stringify(updated));
      return updated;
    });
    setCurrentChatId(newChat.id);
    setShowNameInput(false);
    setNewChatName("");
  };

  const deleteChat = (id: string) => {
    setChatSessions(prev => prev.filter(s => s.id !== id));
    if (currentChatId === id) setCurrentChatId(null);
  };

  // ================== CAMERA ==================
  // Exactly like coach_ai_2 - useEffect approach
  useEffect(() => {
    if (cameraActive && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          // Start countdown after camera is ready
          setCountdown(3);
          setTimeout(() => {
            try {
              const recorder = new MediaRecorder(stream);
              mediaRecorderRef.current = recorder;
              recordedChunksRef.current = [];
              recorder.ondataavailable = (e) => {
                if (e.data.size > 0) recordedChunksRef.current.push(e.data);
              };
              recorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
                const file = new File([blob], "recording.webm", { type: "video/webm" });
                setVideoFile(file);
                setVideoSource("camera");
                setIsRecording(false);
                setCameraActive(false);
              };
              recorder.start();
              setIsRecording(true);
            } catch (err) {
              setErrorMessage("Failed to start recording");
            }
          }, 3000);
        })
        .catch((err) => {
          setErrorMessage("Camera error: " + err.message);
          setCameraActive(false);
        });
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  // Countdown timer - exactly like coach_ai_complete
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setVideoFile(file); setVideoSource("upload"); setCameraActive(false); }
  };

  const startRecording = () => {
    setErrorMessage("");
    setIsRecording(false);
    setCountdown(null);
    setShowTip(true);
    setTimeout(() => setShowTip(false), 3000);
    setCameraActive(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setIsRecording(false);
    setCountdown(null);
    setErrorMessage("");
  };

  // ================== ANALYZE ==================
  const chatMutation       = trpc.analysis.chat.useMutation();
  const saveGeneralChat    = trpc.generalChat.save.useMutation();
  const analyzeVideoMutation = trpc.analysis.analyzeVideo.useMutation();
  const { data: authUser } = trpc.auth.me.useQuery();
  const storedUserIdForChat = (() => { try { const id = localStorage.getItem("userId"); return id ? parseInt(id) : undefined; } catch { return undefined; } })();
  const { data: dbUserData } = trpc.auth.getUserById.useQuery(
    { id: storedUserIdForChat! },
    { enabled: !!storedUserIdForChat }
  );
  const chatUserName = dbUserData?.name ?? authUser?.name;

  const handleAnalyze = async () => {
    if (!videoFile) return;
    setIsAnalyzing(true);
    setErrorMessage("");
    try {
      // Convert video to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = () => reject(new Error("Failed to read video"));
        reader.readAsDataURL(videoFile);
      });

      const res = await analyzeVideoMutation.mutateAsync({
        videoBase64: base64,
        mimeType:    videoFile.type || "video/mp4",
        language,
        source:      videoSource,
      });

      // Results already translated by routers.ts
      const translatedRes = {
        ...res,
        qualityIssues: res.qualityIssues ?? [],
      };

      sessionStorage.setItem("lastAnalysis", JSON.stringify(translatedRes));
      setResults({
        className:   res.className,
        confidence:  res.confidence,
        keypoints:   [],
        corrections: res.corrections ?? [],
      });

      const score = res.dtw_distance != null
        ? Math.max(0, Math.round(100 - res.dtw_distance / 15))
        : Math.round(res.confidence * 100);
      setSimilarityScore(score);
      setTimeout(() => setLocation("/analysis-result"), 400);

    } catch (err: any) {
      console.error("Analysis error:", err);
      setErrorMessage(err.message || t("analysisError"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ================== CHAT ==================
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    // Create new chat if none exists
    let activeChatId = currentChatId;
    let activeSessions = chatSessions;
    if (!currentChatId || !chatSessions.find(s => s.id === currentChatId)) {
      const newChat: ChatSession = {
        id: Date.now().toString(),
        name: `Chat ${new Date().toLocaleTimeString()}`,
        messages: [],
        createdAt: Date.now(),
      };
      activeSessions = [...chatSessions, newChat];
      activeChatId = newChat.id;
      setChatSessions(activeSessions);
      setCurrentChatId(activeChatId);
    }
    const userMsg = { role: "user", content: chatInput };
    const updatedSessions = activeSessions.map(s =>
      s.id === activeChatId ? { ...s, messages: [...s.messages, userMsg] } : s
    );
    setChatSessions(updatedSessions);
    const savedInput = chatInput;
    setChatInput("");
    setIsProcessing(true);

    try {
      const storedName = (() => { try { return localStorage.getItem("userName") || undefined; } catch { return undefined; } })();
      const userName = chatUserName || storedName;
      const aiResult = await chatMutation.mutateAsync({
        message: savedInput,
        analysisResult: results
          ? { className: results.className, confidence: results.confidence, corrections: results.corrections, level: null }
          : { className: "General", confidence: 0, corrections: [], level: null },
        language,
        chatType: "general",
        userName,
      });

      const aiMsg = { role: "assistant", content: aiResult.message };
      setChatSessions(updatedSessions.map(s =>
        s.id === activeChatId ? { ...s, messages: [...s.messages, aiMsg] } : s
      ));

      if (authUser && activeChatId) {
        const activeChat = activeSessions.find(s => s.id === activeChatId);
        await saveGeneralChat.mutateAsync({
          sessionId:   activeChatId,
          sessionName: activeChat?.name ?? "Chat",
          userMessage: savedInput,
          aiResponse:  aiResult.message,
          language,
        });
      }
    } catch {
      setChatSessions(updatedSessions.map(s =>
        s.id === activeChatId
          ? { ...s, messages: [...s.messages, { role: "assistant", content: "Sorry, an error occurred." }] }
          : s
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  // ================== RENDER ==================
  return (
    <div className="min-h-screen bg-background">

      {/* نافذة منبثقة - تذكير بتكرار الحركة */}
      {showTip && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-primary text-white px-8 py-5 rounded-2xl shadow-2xl text-center animate-bounce-in max-w-sm mx-4">
            <div className="text-3xl mb-2">🏋️</div>
            <p className="font-bold text-lg">
              {language === "ar" ? "كرر الحركة 3-5 مرات!" :
               language === "de" ? "Wiederhole die Übung 3-5 Mal!" :
               language === "fr" ? "Répétez l'exercice 3-5 fois!" :
               language === "es" ? "¡Repite el ejercicio 3-5 veces!" :
               "Repeat the exercise 3-5 times!"}
            </p>
            <p className="text-sm text-white/80 mt-1">
              {language === "ar" ? "سجّل 5 ثواني على الأقل" :
               language === "de" ? "Mindestens 5 Sekunden aufnehmen" :
               "Record at least 5 seconds"}
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold">{t("advancedAnalysis")}</h1>
          </div>
          <img src={LOGO_URL} alt="Logo" className="h-10" />
        </div>

        {/* Error */}
        {errorMessage && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {translateError(errorMessage)}
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: Video / Camera */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">

              {/* CAMERA ACTIVE */}
              {cameraActive ? (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-black" style={{}}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg bg-black"
                      style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }}
                    />
                    {/* Countdown overlay */}
                    {countdown !== null && countdown > 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg">
                        <span className="text-8xl font-bold text-white drop-shadow-lg">{countdown}</span>
                        <p className="text-white text-lg mt-3 opacity-90">{t("getReady")}</p>
                      </div>
                    )}
                    {/* Recording indicator */}
                    {isRecording && (
                      <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        {t("recording")}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isRecording ? (
                      <Button onClick={stopRecording} className="flex-1 bg-red-600 hover:bg-red-700">
                        ⏹ {t("stopRecording")}
                      </Button>
                    ) : (
                      <Button onClick={stopCamera} variant="outline" className="flex-1">
                        <X className="w-4 h-4 mr-2" />{t("stopCamera")}
                      </Button>
                    )}
                  </div>
                </div>

              /* VIDEO FILE */
              ) : videoFile ? (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      src={videoObjectUrl ?? ""}
                      className="w-full rounded-lg"
                      controls
                      style={{ aspectRatio: "16/9", objectFit: "contain" }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => { setVideoFile(null); setResults(null); setErrorMessage(""); }} variant="outline" className="flex-1">
                      <X className="w-4 h-4 mr-2" />{t("clearVideo")}
                    </Button>
                    <Button onClick={handleAnalyze} disabled={isAnalyzing} className="flex-1 bg-primary">
                      {isAnalyzing
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("processing")}</>
                        : <><Zap className="w-4 h-4 mr-2" />{t("analyzeVideo")}</>
                      }
                    </Button>
                  </div>
                </div>

              /* NO VIDEO */
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-100 h-48 rounded-lg flex flex-col items-center justify-center gap-3">
                    <Activity className="w-12 h-12 text-gray-400" />
                    <span className="text-gray-500 text-sm">{t("noVideoSelected")}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={startRecording} className="flex-1 bg-primary">
                      <Activity className="w-4 h-4 mr-2" />{t("startCamera")}
                    </Button>
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1">
                      <Upload className="w-4 h-4 mr-2" />{t("uploadVideo")}
                    </Button>
                  </div>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
            </Card>

            {/* Chat History */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{t("chatHistory")}</h3>
                <Button onClick={createNewChat} size="sm" className="bg-primary">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Inline name input */}
              {showNameInput && (
                <div className="mb-3 flex gap-2">
                  <input
                    type="text"
                    value={newChatName}
                    onChange={e => setNewChatName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") confirmNewChat(); if (e.key === "Escape") setShowNameInput(false); }}
                    autoFocus
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-primary outline-none bg-background"
                    placeholder={language === "ar" ? "اسم المحادثة..." : language === "de" ? "Chat-Name..." : "Chat name..."}
                  />
                  <Button onClick={confirmNewChat} size="sm" className="bg-primary px-3">✓</Button>
                  <Button onClick={() => setShowNameInput(false)} size="sm" variant="outline" className="px-3">✗</Button>
                </div>
              )}

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {chatSessions.map(session => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                      currentChatId === session.id
                        ? "bg-primary text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() => setCurrentChatId(session.id)}
                  >
                    <div className="flex-1 min-w-0" onClick={(e) => {
                        e.stopPropagation();
                        setEditingChatId(session.id);
                        setEditingName(session.name);
                      }}>
                      {editingChatId === session.id ? (
                        <input
                          autoFocus
                          type="text"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onBlur={() => {
                            if (editingName.trim()) {
                              setChatSessions(prev => prev.map(s =>
                                s.id === session.id ? { ...s, name: editingName.trim() } : s
                              ));
                            }
                            setEditingChatId(null);
                          }}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              if (editingName.trim()) {
                                setChatSessions(prev => prev.map(s =>
                                  s.id === session.id ? { ...s, name: editingName.trim() } : s
                                ));
                              }
                              setEditingChatId(null);
                            }
                            if (e.key === "Escape") setEditingChatId(null);
                          }}
                          className="w-full bg-transparent border-b border-white/50 outline-none text-sm font-medium text-white"
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-sm font-medium truncate block cursor-text" title="Click to rename">
                          {session.name}
                        </span>
                      )}
                      <span className={`text-xs ${currentChatId === session.id ? "text-white/70" : "text-gray-400"}`}>
                        {new Date(session.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <Button
                      onClick={(e) => { e.stopPropagation(); deleteChat(session.id); }}
                      size="sm" variant="ghost" className="h-6 w-6 p-0 ml-2 flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: Chat */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 flex flex-col" style={{ minHeight: "500px" }}>
              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {currentChat?.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-primary text-white ml-auto"
                        : "bg-gray-100 mr-auto"
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                {!currentChat && (
                  <div className="text-center text-gray-400 mt-8">
                    <p>{language === "ar" ? "ابدأ محادثة جديدة" : "Start a new chat"}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder={t("sendMessage")}
                  disabled={isProcessing || !currentChat}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isProcessing || !chatInput.trim()}
                  className="bg-primary"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
