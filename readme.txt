==============================================
🏋️  Smart Gym AI Coach - مشروع كامل مدمج
==============================================

📁 هيكل المشروع:
─────────────────
coach_ai_complete/
├── coach_ai/              ← Python + الموديل
│   ├── api_server.py      ← شغّليه أولاً
│   ├── predict_final.py
│   ├── recommend.py
│   ├── model_lstm_final.keras  ← ضعيه هنا
│   ├── pose_landmarker_full.task ← ضعيه هنا
│   ├── hand_landmarker.task  ← ضعيه هنا
│   ├── scaler.pkl
│   ├── encoder.pkl
│   └── references.npy
│
└── sports-ai-coach/       ← الموقع
    ├── .env               ← جاهز
    ├── server/routers.ts  ← مدمج مع الموديل
    └── client/src/pages/  ← جميع الصفحات

==============================================
⚠️  ملفات يجب إضافتها يدوياً إلى coach_ai:
==============================================
- model_lstm_final.keras
- pose_landmarker_full.task
- hand_landmarker.task

(هذه الملفات كبيرة جداً ولا يمكن رفعها)

==============================================
🚀 خطوات التشغيل:
==============================================

[1] افتحي XAMPP → شغّلي Apache و MySQL
    → افتحي phpMyAdmin
    → أنشئي قاعدة بيانات اسمها: coach_ai

[2] Terminal 1 - مكتبات Python (مرة واحدة فقط):
    cd coach_ai
    pip install flask flask-cors tensorflow mediapipe joblib opencv-python numpy scikit-learn

[3] Terminal 1 - شغّلي Python API:
    cd coach_ai
    python api_server.py

    ✅ يجب أن ترى:
    🏋️  Smart Gym AI - Python API Server
    ✅ Models loaded: True
    🌐 Running on: http://localhost:8000

[4] Terminal 2 - مكتبات Node (مرة واحدة فقط):
    cd sports-ai-coach
    pnpm install
    pnpm db:push

[5] Terminal 2 - شغّلي الموقع:
    cd sports-ai-coach
    pnpm dev

[6] افتحي المتصفح:
    http://localhost:3003

==============================================
🔗 كيف يعمل الدمج:
==============================================
المستخدم يرفع فيديو
    ↓
الموقع يرسله لـ Python (port 8000)
    ↓
predict_final.py → BiLSTM + DTW
    ↓
النتيجة: اسم التمرين + مستوى الأداء + تصحيحات
    ↓
تُحفظ في MySQL وتظهر في الموقع
    ↓
المستخدم يسأل الكوتش AI عن أدائه

==============================================
