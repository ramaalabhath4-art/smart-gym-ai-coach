"""
prompts.py
Smart Gym AI Coach - RAG Prompts (English)
All prompts written in English for consistency.
Auto-translation handled separately.
"""

# ================== MAIN SYSTEM PROMPT ==================

COACH_SYSTEM_PROMPT = """You are Coach Smart, an expert fitness coach and movement analyst 
working within the Smart Gym AI Coach system.

Your knowledge comes from a specialized database of 22 gym exercises including:
- Correct performance techniques
- Common mistakes to avoid
- Level-specific tips (beginner, intermediate, advanced)
- Safety guidelines
- Complementary exercise recommendations

Response rules:
1. Always be friendly, encouraging, and motivating
2. Use information from the retrieved context first
3. Give specific, actionable advice — not generic tips
4. Always mention safety when relevant
5. Suggest complementary exercises when appropriate
6. Keep responses under 150 words
7. Praise the user's effort and progress

Retrieved exercise information:
{context}

Last analysis result:
- Exercise: {exercise_name}
- Confidence: {confidence}%
- Performance Level: {level}
- Suggested Corrections: {corrections}

User question: {question}
"""

# ================== GENERAL CHAT PROMPT ==================

GENERAL_CHAT_PROMPT = """You are Coach Smart, an expert fitness coach in the Smart Gym AI Coach system.

Answer the user's question based on the following exercise database information:
{context}

Rules:
1. Be clear, concise and encouraging (under 120 words)
2. Suggest relevant exercises from the available list when appropriate
3. Always be positive and motivating
4. If the question is outside fitness scope, redirect to fitness topics politely
5. Give practical, actionable advice

User question: {question}
"""

# ================== SPECIFIC SITUATION PROMPTS ==================

EXERCISE_CORRECTION_PROMPT = """Based on the analysis of {exercise_name}:

Analysis Result:
- Confidence Score: {confidence}%
- Performance Level: {level}
- Suggested Corrections: {corrections}

Exercise Information from Database:
{context}

Provide specific, personalized improvement advice based on the user's actual result.
Focus on the most important correction first.
Keep it encouraging and actionable.
Under 120 words.

User question: {question}
"""

EXERCISE_PROGRESSION_PROMPT = """The user is performing {exercise_name} and wants to progress further.

Current Performance:
- Level: {level}
- Confidence: {confidence}%

Progression Information from Database:
{context}

Suggest a clear, specific progression plan appropriate for their current level.
Include the next steps and what to focus on.
Keep it motivating and realistic.
Under 130 words.

User question: {question}
"""

COMPLEMENTARY_EXERCISES_PROMPT = """The user just performed {exercise_name} and wants to know 
what other exercises to add to their workout.

Exercise Information:
{context}

Recommend 2-3 complementary exercises with brief explanation of why they pair well.
Keep it practical and motivating.
Under 100 words.

User question: {question}
"""

SAFETY_ADVICE_PROMPT = """Safety information for {exercise_name}:

{context}

Provide clear, direct safety advice.
Be firm but not alarming.
Under 80 words.

User question: {question}
"""

BEGINNER_GUIDE_PROMPT = """The user is a beginner asking about {exercise_name}.

Beginner-Focused Information:
{context}

Give simple, clear guidance appropriate for a complete beginner.
Be extra encouraging and patient.
Break down steps simply.
Under 130 words.

User question: {question}
"""

# ================== TRANSLATION PROMPT ==================

TRANSLATION_PROMPT = """Translate the following fitness coaching response to {target_language}.

Keep the same tone: friendly, encouraging, and professional.
Maintain all technical exercise terms accurately.
Keep emojis if present.

Text to translate:
{text}

Translated text:
"""

# ================== LEVEL TRANSLATIONS ==================
# Pre-built translations for performance levels (no API needed)

LEVEL_TRANSLATIONS = {
    "ممتاز ⭐⭐⭐": {
        "en": "Excellent ⭐⭐⭐",
        "ar": "ممتاز ⭐⭐⭐",
        "fr": "Excellent ⭐⭐⭐",
        "de": "Ausgezeichnet ⭐⭐⭐",
        "es": "Excelente ⭐⭐⭐",
        "zh": "优秀 ⭐⭐⭐",
    },
    "جيد ⭐⭐": {
        "en": "Good ⭐⭐",
        "ar": "جيد ⭐⭐",
        "fr": "Bien ⭐⭐",
        "de": "Gut ⭐⭐",
        "es": "Bien ⭐⭐",
        "zh": "良好 ⭐⭐",
    },
    "مقبول ⭐": {
        "en": "Acceptable ⭐",
        "ar": "مقبول ⭐",
        "fr": "Acceptable ⭐",
        "de": "Akzeptabel ⭐",
        "es": "Aceptable ⭐",
        "zh": "及格 ⭐",
    },
    "يحتاج تدريب ⚠️": {
        "en": "Needs Training ⚠️",
        "ar": "يحتاج تدريب ⚠️",
        "fr": "Besoin d'entraînement ⚠️",
        "de": "Braucht Training ⚠️",
        "es": "Necesita entrenamiento ⚠️",
        "zh": "需要训练 ⚠️",
    },
}

DTW_FEEDBACK_TRANSLATIONS = {
    "أداء رائع! استمر هكذا": {
        "en": "Great performance! Keep it up",
        "ar": "أداء رائع! استمر هكذا",
        "fr": "Excellente performance! Continuez ainsi",
        "de": "Tolle Leistung! Weiter so",
        "es": "¡Excelente rendimiento! Sigue así",
        "zh": "表现出色！继续保持",
    },
    "أداء جيد مع بعض التحسينات": {
        "en": "Good performance with some improvements needed",
        "ar": "أداء جيد مع بعض التحسينات",
        "fr": "Bonne performance avec quelques améliorations",
        "de": "Gute Leistung mit einigen Verbesserungen",
        "es": "Buen rendimiento con algunas mejoras",
        "zh": "表现良好，需要一些改进",
    },
    "تحتاج لتحسين الأداء": {
        "en": "Performance needs improvement",
        "ar": "تحتاج لتحسين الأداء",
        "fr": "La performance nécessite des améliorations",
        "de": "Die Leistung muss verbessert werden",
        "es": "El rendimiento necesita mejorar",
        "zh": "表现需要改进",
    },
    "راجع طريقة أداء التمرين": {
        "en": "Please review your exercise technique",
        "ar": "راجع طريقة أداء التمرين",
        "fr": "Veuillez revoir votre technique d'exercice",
        "de": "Bitte überprüfen Sie Ihre Übungstechnik",
        "es": "Por favor revise su técnica de ejercicio",
        "zh": "请检查您的运动技术",
    },
}

CORRECTION_TRANSLATIONS = {
    "⚠️ الركبة منحنية كثيراً - لا تتجاوز أصابع القدم": {
        "en": "⚠️ Knees bending too much — do not go past your toes",
        "fr": "⚠️ Genoux trop fléchis — ne dépassez pas vos orteils",
        "de": "⚠️ Knie zu stark gebeugt — nicht über die Zehen gehen",
        "es": "⚠️ Rodillas demasiado dobladas — no sobrepasar los dedos del pie",
        "zh": "⚠️ 膝盖弯曲太多——不要超过脚趾",
    },
    "⚠️ الظهر منحني - حافظ على استقامة الظهر": {
        "en": "⚠️ Back is rounded — keep your back straight",
        "fr": "⚠️ Dos arrondi — gardez le dos droit",
        "de": "⚠️ Rücken gerundet — Rücken gerade halten",
        "es": "⚠️ Espalda redondeada — mantén la espalda recta",
        "zh": "⚠️ 背部弯曲——保持背部挺直",
    },
    "⚠️ المرفق منحني كثيراً - اخفض الثقل أكثر": {
        "en": "⚠️ Elbow bent too much — lower the weight more",
        "fr": "⚠️ Coude trop fléchi — descendez davantage le poids",
        "de": "⚠️ Ellbogen zu stark gebeugt — Gewicht weiter senken",
        "es": "⚠️ Codo muy doblado — baja más el peso",
        "zh": "⚠️ 肘部弯曲太多——更多地降低重量",
    },
    "⚠️ الكتفان غير متوازيان - ثبت جسمك": {
        "en": "⚠️ Shoulders are uneven — stabilize your body",
        "fr": "⚠️ Épaules inégales — stabilisez votre corps",
        "de": "⚠️ Schultern ungleich — Körper stabilisieren",
        "es": "⚠️ Hombros desiguales — estabiliza tu cuerpo",
        "zh": "⚠️ 肩膀不平衡——稳定你的身体",
    },
    "⚠️ الظهر منحني - حافظ على جسم مستقيم": {
        "en": "⚠️ Back is sagging — keep body in a straight line",
        "fr": "⚠️ Dos affaissé — gardez le corps en ligne droite",
        "de": "⚠️ Rücken durchhängend — Körper gerade halten",
        "es": "⚠️ Espalda caída — mantén el cuerpo en línea recta",
        "zh": "⚠️ 背部下垂——保持身体成直线",
    },
    "✅ الأداء صحيح! استمر": {
        "en": "✅ Great form! Keep it up",
        "fr": "✅ Bonne forme! Continuez",
        "de": "✅ Gute Form! Weiter so",
        "es": "✅ ¡Buena forma! Sigue así",
        "zh": "✅ 动作正确！继续保持",
    },
}

# ================== HELPER FUNCTIONS ==================

def get_level_translation(level: str, language: str) -> str:
    """Get pre-translated performance level"""
    if not level:
        return level
    for arabic_level, translations in LEVEL_TRANSLATIONS.items():
        if arabic_level in level:
            return translations.get(language, translations.get("en", level))
    return level


def get_dtw_feedback_translation(feedback: str, language: str) -> str:
    """Get pre-translated DTW feedback"""
    if not feedback:
        return feedback
    for arabic_feedback, translations in DTW_FEEDBACK_TRANSLATIONS.items():
        if arabic_feedback in feedback:
            return translations.get(language, translations.get("en", feedback))
    return feedback


def get_correction_translation(correction: str, language: str) -> str:
    """Get pre-translated correction message"""
    if language == "ar":
        return correction
    for arabic_correction, translations in CORRECTION_TRANSLATIONS.items():
        if arabic_correction in correction:
            return translations.get(language, translations.get("en", correction))
    return correction


def translate_corrections(corrections: list, language: str) -> list:
    """Translate a list of corrections to target language"""
    if language == "ar":
        return corrections
    return [get_correction_translation(c, language) for c in corrections]


def build_exercise_search_query(exercise_name: str, question: str) -> str:
    """Build search query for RAG retrieval"""
    return f"{exercise_name} {question}"


def build_general_search_query(question: str) -> str:
    """Build general search query for RAG"""
    return question


SUPPORTED_LANGUAGES = {
    "en": "English",
    "ar": "Arabic",
    "fr": "French",
    "de": "German",
    "es": "Spanish",
    "zh": "Chinese",
}
