"""
coach_chat.py
Smart Gym AI Coach - RAG Chat Service
Groq API + LangChain + FAISS
"""

import os
import requests
from rag_system import get_vectorstore, search_exercises
from prompts import COACH_SYSTEM_PROMPT, GENERAL_CHAT_PROMPT

# ================== CONFIG ==================
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL   = "llama-3.3-70b-versatile"
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"

LANGUAGE_NAMES = {
    "en": "English", "ar": "Arabic", "fr": "French",
    "de": "German",  "es": "Spanish", "zh": "Chinese",
}

def call_groq(prompt: str, max_tokens: int = 300) -> str:
    if not GROQ_API_KEY:
        return "GROQ_API_KEY not configured."

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.7,
    }
    try:
        res = requests.post(GROQ_URL, headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        data = res.json()
        if "choices" in data and data["choices"]:
            return data["choices"][0]["message"]["content"].strip()
        return "Could not generate response."
    except requests.exceptions.Timeout:
        return "Response timed out. Please try again."
    except requests.exceptions.HTTPError as e:
        print(f"[Groq HTTP Error] {e.response.status_code}: {e.response.text[:200]}")
        return "An error occurred. Please try again."
    except Exception as e:
        print(f"[Groq Error] {type(e).__name__}: {e}")
        return "An error occurred. Please try again."

def chat_with_analysis(question, exercise_name, confidence, level, corrections, language="en", user_name=None):
    vectorstore = get_vectorstore()
    context = search_exercises(vectorstore, query=question, exercise_name=exercise_name, k=3)
    corrections_text = "\n".join([f"- {c}" for c in corrections]) if corrections else "None"
    lang_name = LANGUAGE_NAMES.get(language, "English")
    name_part = f"The user's name is {user_name}. Address them by name." if user_name else ""

    prompt = COACH_SYSTEM_PROMPT.format(
        context=context,
        exercise_name=exercise_name,
        confidence=round(confidence * 100, 1),
        level=level or "Not determined",
        corrections=corrections_text,
        question=question,
    ) + f"\n\nIMPORTANT: Respond ONLY in {lang_name}. {name_part}"

    return call_groq(prompt, max_tokens=300)

def chat_general(question, language="en", user_name=None):
    vectorstore = get_vectorstore()
    context = search_exercises(vectorstore, query=question, k=4)
    lang_name = LANGUAGE_NAMES.get(language, "English")
    name_part = f"The user's name is {user_name}. Address them by name." if user_name else ""

    prompt = GENERAL_CHAT_PROMPT.format(
        context=context,
        question=question,
    ) + f"\n\nIMPORTANT: Respond ONLY in {lang_name}. {name_part}"

    return call_groq(prompt, max_tokens=250)
