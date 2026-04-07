==============================================
🏋️  Smart Gym AI Coach - دليل الدمج الكامل
==============================================

البنية بعد الدمج:
─────────────────
coach_ai/                    ← مجلد Python
  ├── api_server.py          ← ✅ محدَّث
  ├── predict_final.py
  ├── recommend.py
  ├── build_references.py
  ├── model_lstm_final.keras
  ├── scaler.pkl
  ├── encoder.pkl
  ├── references.npy
  ├── pose_landmarker_full.task
  └── hand_landmarker.task

sports-ai-coach/             ← مجلد Next.js
  ├── .env                   ← أضيفي PYTHON_API_URL
  ├── server/routers.ts      ← ✅ محدَّث (ربط حقيقي بـ Python)
  └── client/src/pages/
      ├── AdvancedAnalysis.tsx ← ✅ محدَّث (تحليل حقيقي)
      ├── AnalysisResult.tsx   ← ✅ محدَّث (نتائج حقيقية)
      └── Dashboard.tsx        ← ✅ محدَّث (إحصائيات حقيقية)

==============================================
خطوات التشغيل (بالترتيب):
==============================================

[مرة واحدة فقط] بناء الـ references:
  cd coach_ai
  python build_references.py

1. شغّلي XAMPP → أنشئي قاعدة بيانات اسمها: coach_ai

2. في مجلد sports-ai-coach، أنشئي ملف .env:
   DATABASE_URL=mysql://root:@localhost:3306/coach_ai
   SESSION_SECRET=supersecretkey123456
   OAUTH_SERVER_URL=http://localhost:3003
   PYTHON_API_URL=http://localhost:8000

3. شغّلي قاعدة البيانات:
   cd sports-ai-coach
   pnpm install
   pnpm db:push

4. Terminal 1 - شغّلي Python API:
   cd coach_ai
   pip install flask flask-cors tensorflow mediapipe joblib opencv-python
   python api_server.py
   → يشتغل على http://localhost:8000

5. Terminal 2 - شغّلي الواجهة:
   cd sports-ai-coach
   pnpm dev
   → يشتغل على http://localhost:3003

6. افتحي المتصفح: http://localhost:3003

==============================================
كيف يعمل الدمج؟
==============================================

المستخدم يرفع فيديو في AdvancedAnalysis
    ↓
الـ Frontend يحوّله base64 → يرسله عبر tRPC
    ↓
server/routers.ts يستقبله → يحوّله لـ FormData
    ↓
يرسله لـ Python API (http://localhost:8000/api/analyze)
    ↓
predict_final.py يحلّله → BiLSTM + DTW
    ↓
النتيجة ترجع للـ Frontend → تُحفظ في MySQL
    ↓
AnalysisResult.tsx يعرض: التمرين + المستوى + التصحيحات
    ↓
المستخدم يسأل الكوتش AI → Claude يردّ بناءً على النتيجة

==============================================
Endpoints Python API:
==============================================
GET  /api/health    → فحص حالة الموديل
POST /api/analyze   → تحليل فيديو (multipart/form-data)
POST /api/recommend → توصيات تمارين (JSON)

==============================================
tRPC Procedures الجديدة:
==============================================
analysis.checkPythonApi   → فحص Python API
analysis.analyzeVideo     → تحليل الفيديو الحقيقي
analysis.getRecommendations → توصيات
analysis.getHistory       → سجل تحليلات المستخدم
analysis.getStats         → إحصائيات الداشبورد
analysis.chat             → شات مع الكوتش AI
