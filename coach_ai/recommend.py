"""
recommend.py
Smart Exercise Recommendation System - Multi-language
"""
import locale
import os

# ================== LANGUAGE DETECTION ==================

def detect_language():
    """Auto-detect system language"""
    try:
        lang = locale.getdefaultlocale()[0] or ""
        if lang.startswith("ar"):
            return "ar"
        elif lang.startswith("fr"):
            return "fr"
        elif lang.startswith("de"):
            return "de"
        elif lang.startswith("es"):
            return "es"
        else:
            return "en"
    except:
        return "en"

LANG = detect_language()

# ================== TRANSLATIONS ==================

T = {
    "welcome": {
        "en": "Welcome! I'm your Smart Fitness Assistant",
        "ar": "مرحباً! أنا مساعدك الرياضي الذكي",
        "fr": "Bienvenue! Je suis votre assistant fitness intelligent",
        "de": "Willkommen! Ich bin Ihr intelligenter Fitness-Assistent",
        "es": "¡Bienvenido! Soy tu asistente de fitness inteligente",
    },
    "goal_q": {
        "en": "What is your fitness goal?",
        "ar": "ما هو هدفك الرياضي؟",
        "fr": "Quel est votre objectif fitness?",
        "de": "Was ist Ihr Fitnessziel?",
        "es": "¿Cuál es tu objetivo de fitness?",
    },
    "goal_1": {
        "en": "Weight Loss", "ar": "خسارة وزن",
        "fr": "Perte de poids", "de": "Gewichtsverlust", "es": "Pérdida de peso",
    },
    "goal_2": {
        "en": "Muscle Building", "ar": "بناء عضلات",
        "fr": "Musculation", "de": "Muskelaufbau", "es": "Desarrollo muscular",
    },
    "goal_3": {
        "en": "Fitness", "ar": "لياقة بدنية",
        "fr": "Fitness", "de": "Fitness", "es": "Fitness",
    },
    "goal_4": {
        "en": "Strength", "ar": "قوة",
        "fr": "Force", "de": "Kraft", "es": "Fuerza",
    },
    "level_q": {
        "en": "What is your fitness level?",
        "ar": "ما هو مستواك؟",
        "fr": "Quel est votre niveau?",
        "de": "Was ist Ihr Fitnessniveau?",
        "es": "¿Cuál es tu nivel?",
    },
    "level_1": {
        "en": "Beginner (< 6 months)", "ar": "مبتدئ (أقل من 6 أشهر)",
        "fr": "Débutant (< 6 mois)", "de": "Anfänger (< 6 Monate)", "es": "Principiante (< 6 meses)",
    },
    "level_2": {
        "en": "Intermediate (6m - 2y)", "ar": "متوسط (6 أشهر - 2 سنة)",
        "fr": "Intermédiaire (6m - 2a)", "de": "Mittel (6m - 2J)", "es": "Intermedio (6m - 2a)",
    },
    "level_3": {
        "en": "Advanced (> 2 years)", "ar": "متقدم (أكثر من 2 سنة)",
        "fr": "Avancé (> 2 ans)", "de": "Fortgeschritten (> 2J)", "es": "Avanzado (> 2 años)",
    },
    "muscle_q": {
        "en": "Which muscle group to target? (e.g. 1,3)",
        "ar": "أي جزء تريد تدريبه؟ (مثال: 1,3)",
        "fr": "Quel groupe musculaire cibler? (ex: 1,3)",
        "de": "Welche Muskelgruppe? (z.B. 1,3)",
        "es": "¿Qué grupo muscular? (ej: 1,3)",
    },
    "equip_q": {
        "en": "What equipment do you have? (e.g. 1,2)",
        "ar": "ما الأدوات المتاحة لديك؟ (مثال: 1,2)",
        "fr": "Quel équipement avez-vous? (ex: 1,2)",
        "de": "Welche Ausrüstung haben Sie? (z.B. 1,2)",
        "es": "¿Qué equipo tienes? (ej: 1,2)",
    },
    "plan_title": {
        "en": "Your Recommended Workout Plan",
        "ar": "خطة التمارين الموصى بها",
        "fr": "Votre plan d'entraînement recommandé",
        "de": "Ihr empfohlener Trainingsplan",
        "es": "Tu plan de entrenamiento recomendado",
    },
    "choose": {
        "en": "Choose number: ", "ar": "اختر رقم: ",
        "fr": "Choisissez: ", "de": "Wählen: ", "es": "Elige: ",
    },
    "calories": {
        "en": "Calories", "ar": "سعرات",
        "fr": "Calories", "de": "Kalorien", "es": "Calorías",
    },
    "muscles": {
        "en": "Muscles", "ar": "العضلات",
        "fr": "Muscles", "de": "Muskeln", "es": "Músculos",
    },
    "equipment_label": {
        "en": "Equipment", "ar": "الأدوات",
        "fr": "Équipement", "de": "Ausrüstung", "es": "Equipo",
    },
    "match": {
        "en": "Match", "ar": "التوافق",
        "fr": "Correspondance", "de": "Übereinstimmung", "es": "Compatibilidad",
    },
    "total_cal": {
        "en": "Total estimated calories", "ar": "إجمالي السعرات المحروقة",
        "fr": "Calories totales estimées", "de": "Geschätzte Gesamtkalorien", "es": "Calorías totales estimadas",
    },
    "est_time": {
        "en": "Estimated time", "ar": "الوقت المقدر",
        "fr": "Temps estimé", "de": "Geschätzte Zeit", "es": "Tiempo estimado",
    },
    "minutes": {
        "en": "minutes", "ar": "دقيقة",
        "fr": "minutes", "de": "Minuten", "es": "minutos",
    },
    "tips": {
        "en": "Training Tips", "ar": "نصائح للتدريب",
        "fr": "Conseils d'entraînement", "de": "Trainingstipps", "es": "Consejos de entrenamiento",
    },
}

def t(key):
    """Get translation for current language"""
    return T.get(key, {}).get(LANG, T.get(key, {}).get("en", key))

# ================== EXERCISES DATABASE ==================

EXERCISES_DB = {
    "squat": {
        "muscle_groups": ["legs", "glutes"],
        "equipment":     ["no equipment", "barbell"],
        "difficulty":    ["beginner", "intermediate", "advanced"],
        "goal":          ["muscle building", "fitness", "weight loss"],
        "calories":      8,
        "desc": {
            "en": "Essential exercise for legs and glutes",
            "ar": "تمرين أساسي لتقوية الأرجل والمؤخرة",
            "fr": "Exercice essentiel pour les jambes",
            "de": "Grundübung für Beine und Gesäß",
            "es": "Ejercicio esencial para piernas y glúteos",
        }
    },
    "deadlift": {
        "muscle_groups": ["back", "legs", "glutes"],
        "equipment":     ["barbell"],
        "difficulty":    ["intermediate", "advanced"],
        "goal":          ["muscle building", "strength"],
        "calories":      9,
        "desc": {
            "en": "Best full body strength exercise",
            "ar": "من أقوى تمارين بناء العضلات الكاملة",
            "fr": "Meilleur exercice de force du corps entier",
            "de": "Beste Ganzkörper-Kraftübung",
            "es": "Mejor ejercicio de fuerza de cuerpo completo",
        }
    },
    "romanian deadlift": {
        "muscle_groups": ["back", "hamstrings", "glutes"],
        "equipment":     ["barbell", "dumbbell"],
        "difficulty":    ["intermediate", "advanced"],
        "goal":          ["muscle building", "fitness"],
        "calories":      7,
        "desc": {
            "en": "Targets hamstrings and lower back",
            "ar": "يركز على عضلات الأرجل الخلفية والظهر السفلي",
            "fr": "Cible les ischio-jambiers et le bas du dos",
            "de": "Zielt auf Oberschenkelrückseite und unteren Rücken",
            "es": "Trabaja isquiotibiales y espalda baja",
        }
    },
    "bench press": {
        "muscle_groups": ["chest", "shoulder", "arms"],
        "equipment":     ["barbell", "bench"],
        "difficulty":    ["beginner", "intermediate", "advanced"],
        "goal":          ["muscle building", "strength"],
        "calories":      6,
        "desc": {
            "en": "Primary chest building exercise",
            "ar": "التمرين الأساسي لبناء عضلات الصدر",
            "fr": "Exercice principal pour la poitrine",
            "de": "Primäre Brustübung",
            "es": "Ejercicio principal para el pecho",
        }
    },
    "incline bench press": {
        "muscle_groups": ["upper chest", "shoulder", "arms"],
        "equipment":     ["barbell", "incline bench"],
        "difficulty":    ["intermediate", "advanced"],
        "goal":          ["muscle building"],
        "calories":      6,
        "desc": {
            "en": "Targets upper chest",
            "ar": "يركز على الجزء العلوي من الصدر",
            "fr": "Cible la partie supérieure de la poitrine",
            "de": "Zielt auf den oberen Brustbereich",
            "es": "Trabaja la parte superior del pecho",
        }
    },
    "decline bench press": {
        "muscle_groups": ["lower chest", "arms"],
        "equipment":     ["barbell", "decline bench"],
        "difficulty":    ["intermediate", "advanced"],
        "goal":          ["muscle building"],
        "calories":      6,
        "desc": {
            "en": "Targets lower chest",
            "ar": "يركز على الجزء السفلي من الصدر",
            "fr": "Cible la partie inférieure de la poitrine",
            "de": "Zielt auf den unteren Brustbereich",
            "es": "Trabaja la parte inferior del pecho",
        }
    },
    "push-up": {
        "muscle_groups": ["chest", "shoulder", "arms"],
        "equipment":     ["no equipment"],
        "difficulty":    ["beginner", "intermediate"],
        "goal":          ["muscle building", "fitness", "weight loss"],
        "calories":      7,
        "desc": {
            "en": "No equipment chest and arms exercise",
            "ar": "تمرين أساسي بدون أدوات لتقوية الصدر والذراعين",
            "fr": "Exercice sans équipement pour poitrine et bras",
            "de": "Übung ohne Ausrüstung für Brust und Arme",
            "es": "Ejercicio sin equipo para pecho y brazos",
        }
    },
    "pull up": {
        "muscle_groups": ["back", "arms"],
        "equipment":     ["pull-up bar"],
        "difficulty":    ["intermediate", "advanced"],
        "goal":          ["muscle building", "fitness"],
        "calories":      8,
        "desc": {
            "en": "Best back and arms exercise",
            "ar": "من أفضل تمارين تقوية الظهر والذراعين",
            "fr": "Meilleur exercice pour le dos et les bras",
            "de": "Beste Übung für Rücken und Arme",
            "es": "Mejor ejercicio para espalda y brazos",
        }
    },
    "lat pulldown": {
        "muscle_groups": ["back", "arms"],
        "equipment":     ["cable"],
        "difficulty":    ["beginner", "intermediate"],
        "goal":          ["muscle building", "fitness"],
        "calories":      5,
        "desc": {
            "en": "Great pull-up alternative for beginners",
            "ar": "بديل ممتاز للـ pull up للمبتدئين",
            "fr": "Excellente alternative aux tractions pour débutants",
            "de": "Hervorragende Alternative zum Klimmzug für Anfänger",
            "es": "Excelente alternativa a las dominadas para principiantes",
        }
    },
    "t bar row": {
        "muscle_groups": ["back", "arms"],
        "equipment":     ["barbell", "T-bar"],
        "difficulty":    ["intermediate", "advanced"],
        "goal":          ["muscle building", "strength"],
        "calories":      7,
        "desc": {
            "en": "Strengthens middle back muscles",
            "ar": "يقوي عضلات الظهر الوسطى",
            "fr": "Renforce les muscles du milieu du dos",
            "de": "Stärkt die mittleren Rückenmuskeln",
            "es": "Fortalece los músculos de la espalda media",
        }
    },
    "shoulder press": {
        "muscle_groups": ["shoulder", "arms"],
        "equipment":     ["dumbbell", "barbell"],
        "difficulty":    ["beginner", "intermediate", "advanced"],
        "goal":          ["muscle building"],
        "calories":      5,
        "desc": {
            "en": "Primary shoulder building exercise",
            "ar": "التمرين الأساسي لبناء عضلات الكتف",
            "fr": "Exercice principal pour les épaules",
            "de": "Primäre Schulterübung",
            "es": "Ejercicio principal para los hombros",
        }
    },
    "lateral raise": {
        "muscle_groups": ["shoulder"],
        "equipment":     ["dumbbell"],
        "difficulty":    ["beginner", "intermediate"],
        "goal":          ["muscle building", "fitness"],
        "calories":      4,
        "desc": {
            "en": "Widens shoulders for V-shape",
            "ar": "يعزز عرض الكتف ويعطي مظهر مثلث",
            "fr": "Élargit les épaules pour une forme en V",
            "de": "Verbreitert die Schultern für V-Form",
            "es": "Ensancha los hombros para forma en V",
        }
    },
    "barbell biceps curl": {
        "muscle_groups": ["arms", "biceps"],
        "equipment":     ["barbell"],
        "difficulty":    ["beginner", "intermediate"],
        "goal":          ["muscle building"],
        "calories":      4,
        "desc": {
            "en": "Primary biceps building exercise",
            "ar": "التمرين الأساسي لبناء عضلة الثنائي",
            "fr": "Exercice principal pour les biceps",
            "de": "Primäre Bizepsübung",
            "es": "Ejercicio principal para bíceps",
        }
    },
    "hammer curl": {
        "muscle_groups": ["arms", "biceps", "forearms"],
        "equipment":     ["dumbbell"],
        "difficulty":    ["beginner", "intermediate"],
        "goal":          ["muscle building"],
        "calories":      4,
        "desc": {
            "en": "Builds biceps and forearms together",
            "ar": "يقوي عضلة الثنائي والساعد معاً",
            "fr": "Développe les biceps et les avant-bras",
            "de": "Baut Bizeps und Unterarme auf",
            "es": "Desarrolla bíceps y antebrazos juntos",
        }
    },
    "tricep pushdown": {
        "muscle_groups": ["arms", "triceps"],
        "equipment":     ["cable"],
        "difficulty":    ["beginner", "intermediate"],
        "goal":          ["muscle building"],
        "calories":      4,
        "desc": {
            "en": "Focuses on triceps",
            "ar": "يركز على عضلة الثلاثي",
            "fr": "Se concentre sur les triceps",
            "de": "Konzentriert sich auf den Trizeps",
            "es": "Se enfoca en los tríceps",
        }
    },
    "tricep dips": {
        "muscle_groups": ["arms", "triceps", "chest"],
        "equipment":     ["no equipment", "bench"],
        "difficulty":    ["beginner", "intermediate"],
        "goal":          ["muscle building", "fitness"],
        "calories":      6,
        "desc": {
            "en": "Effective triceps exercise without equipment",
            "ar": "تمرين فعال للثلاثي بدون أدوات",
            "fr": "Exercice efficace pour les triceps sans équipement",
            "de": "Effektive Trizepsübung ohne Ausrüstung",
            "es": "Ejercicio efectivo de tríceps sin equipo",
        }
    },
    "chest fly machine": {
        "muscle_groups": ["chest"],
        "equipment":     ["machine"],
        "difficulty":    ["beginner", "intermediate"],
        "goal":          ["muscle building"],
        "calories":      4,
        "desc": {
            "en": "Isolates and defines chest muscles",
            "ar": "يعزز الفصل بين عضلات الصدر",
            "fr": "Isole et définit les muscles pectoraux",
            "de": "Isoliert und definiert die Brustmuskeln",
            "es": "Aísla y define los músculos pectorales",
        }
    },
    "leg extension": {
        "muscle_groups": ["legs", "quadriceps"],
        "equipment":     ["machine"],
        "difficulty":    ["beginner", "intermediate"],
        "goal":          ["muscle building"],
        "calories":      4,
        "desc": {
            "en": "Focuses on quadriceps",
            "ar": "يركز على عضلة الرباعي",
            "fr": "Se concentre sur les quadriceps",
            "de": "Konzentriert sich auf den Quadrizeps",
            "es": "Se enfoca en los cuádriceps",
        }
    },
    "leg raises": {
        "muscle_groups": ["abs", "legs"],
        "equipment":     ["no equipment"],
        "difficulty":    ["beginner", "intermediate"],
        "goal":          ["fitness", "weight loss"],
        "calories":      5,
        "desc": {
            "en": "Strengthens abs and legs",
            "ar": "يقوي عضلات البطن والأرجل",
            "fr": "Renforce les abdominaux et les jambes",
            "de": "Stärkt Bauch und Beine",
            "es": "Fortalece abdominales y piernas",
        }
    },
    "hip thrust": {
        "muscle_groups": ["glutes", "hamstrings"],
        "equipment":     ["barbell", "bench"],
        "difficulty":    ["beginner", "intermediate"],
        "goal":          ["muscle building"],
        "calories":      5,
        "desc": {
            "en": "Best glute building exercise",
            "ar": "أفضل تمرين لبناء عضلات المؤخرة",
            "fr": "Meilleur exercice pour les fessiers",
            "de": "Beste Gesäßübung",
            "es": "Mejor ejercicio para los glúteos",
        }
    },
    "plank": {
        "muscle_groups": ["abs", "back", "core"],
        "equipment":     ["no equipment"],
        "difficulty":    ["beginner", "intermediate"],
        "goal":          ["fitness", "weight loss"],
        "calories":      3,
        "desc": {
            "en": "Builds core stability",
            "ar": "يقوي عضلات الكور والاستقرار",
            "fr": "Renforce la stabilité du core",
            "de": "Baut Core-Stabilität auf",
            "es": "Desarrolla la estabilidad del core",
        }
    },
    "russian twist": {
        "muscle_groups": ["abs", "obliques"],
        "equipment":     ["no equipment", "dumbbell"],
        "difficulty":    ["beginner", "intermediate"],
        "goal":          ["fitness", "weight loss"],
        "calories":      5,
        "desc": {
            "en": "Targets obliques and burns waist fat",
            "ar": "يقوي البطن الجانبي ويحرق دهون الخصر",
            "fr": "Cible les obliques et brûle les graisses de la taille",
            "de": "Zielt auf schräge Bauchmuskeln",
            "es": "Trabaja oblicuos y quema grasa de cintura",
        }
    },
}

# ================== MUSCLE & GOAL MAPPING ==================

MUSCLE_KEYS = {
    "1": "chest",   "2": "back",    "3": "legs",
    "4": "shoulder","5": "arms",    "6": "abs",
    "7": "glutes",  "8": "full",
}
MUSCLE_LABELS = {
    "en": {"1":"Chest","2":"Back","3":"Legs","4":"Shoulder","5":"Arms","6":"Abs","7":"Glutes","8":"Full Body"},
    "ar": {"1":"صدر","2":"ظهر","3":"أرجل","4":"كتف","5":"ذراع","6":"بطن","7":"مؤخرة","8":"كامل الجسم"},
    "fr": {"1":"Poitrine","2":"Dos","3":"Jambes","4":"Épaule","5":"Bras","6":"Abdos","7":"Fessiers","8":"Corps entier"},
    "de": {"1":"Brust","2":"Rücken","3":"Beine","4":"Schulter","5":"Arme","6":"Bauch","7":"Gesäß","8":"Ganzkörper"},
    "es": {"1":"Pecho","2":"Espalda","3":"Piernas","4":"Hombro","5":"Brazos","6":"Abdomen","7":"Glúteos","8":"Cuerpo completo"},
}

EQUIP_KEYS = {
    "1":"no equipment","2":"dumbbell","3":"barbell",
    "4":"cable","5":"machine","6":"all",
}
EQUIP_LABELS = {
    "en": {"1":"No Equipment","2":"Dumbbell","3":"Barbell","4":"Cable","5":"Machine","6":"All Equipment"},
    "ar": {"1":"بدون أدوات","2":"دمبل","3":"بار","4":"كابل","5":"آلات","6":"كل الأدوات"},
    "fr": {"1":"Sans équipement","2":"Haltère","3":"Barre","4":"Câble","5":"Machine","6":"Tout équipement"},
    "de": {"1":"Ohne Ausrüstung","2":"Hantel","3":"Langhantel","4":"Kabel","5":"Maschine","6":"Alle Ausrüstung"},
    "es": {"1":"Sin equipo","2":"Mancuerna","3":"Barra","4":"Cable","5":"Máquina","6":"Todo el equipo"},
}

GOAL_MAP = {
    "1": {"en":"weight loss","ar":"خسارة وزن","fr":"perte de poids","de":"Gewichtsverlust","es":"pérdida de peso"},
    "2": {"en":"muscle building","ar":"بناء عضلات","fr":"musculation","de":"Muskelaufbau","es":"desarrollo muscular"},
    "3": {"en":"fitness","ar":"لياقة","fr":"fitness","de":"Fitness","es":"fitness"},
    "4": {"en":"strength","ar":"قوة","fr":"force","de":"Kraft","es":"fuerza"},
}
LEVEL_MAP = {
    "1": {"en":"beginner","ar":"مبتدئ","fr":"débutant","de":"Anfänger","es":"principiante"},
    "2": {"en":"intermediate","ar":"متوسط","fr":"intermédiaire","de":"mittel","es":"intermedio"},
    "3": {"en":"advanced","ar":"متقدم","fr":"avancé","de":"fortgeschritten","es":"avanzado"},
}

# ================== RECOMMENDATION ENGINE ==================

def get_recommendations(goal_en, level_en, target_muscles, equipment_list, n=6):
    scores = {}
    for exercise, info in EXERCISES_DB.items():
        score = 0
        if goal_en in info["goal"]:              score += 3
        if level_en in info["difficulty"]:        score += 2
        for m in target_muscles:
            if any(m in mg for mg in info["muscle_groups"]): score += 2
        for eq in equipment_list:
            if eq in info["equipment"]:           score += 1
        if "no equipment" in equipment_list and "no equipment" in info["equipment"]:
            score += 2
        if score > 0:
            scores[exercise] = score
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)[:n]

# ================== PRINT PLAN ==================

def print_plan(user_info, recommendations):
    print("\n" + "="*60)
    print(f"🏋️  {t('plan_title')}")
    print("="*60)
    print(f"🎯 Goal:    {user_info['goal_label']}")
    print(f"📊 Level:   {user_info['level_label']}")
    print(f"💪 Target:  {user_info['muscles_label']}")
    print(f"🛠️  Equip:   {user_info['equip_label']}")
    print("="*60)

    total_cal = 0
    for i, (exercise, score) in enumerate(recommendations, 1):
        info = EXERCISES_DB[exercise]
        cal  = info["calories"] * 10
        total_cal += cal
        desc = info["desc"].get(LANG, info["desc"]["en"])

        print(f"\n{i}. {exercise.upper()}")
        print(f"   📝 {desc}")
        print(f"   💪 {t('muscles')}: {', '.join(info['muscle_groups'])}")
        print(f"   🛠️  {t('equipment_label')}: {', '.join(info['equipment'])}")
        print(f"   🔥 {t('calories')}: ~{cal}/10 min")
        print(f"   ⭐ {t('match')}: {'⭐' * min(score, 5)}")

    print("\n" + "="*60)
    print(f"🔥 {t('total_cal')}: ~{total_cal}")
    print(f"⏱️  {t('est_time')}: ~{len(recommendations)*10} {t('minutes')}")
    print("="*60)

# ================== USER INPUT ==================

def get_user_input():
    print("\n" + "="*60)
    print(f"🏋️  {t('welcome')}")
    print("="*60)

    # Goal
    print(f"\n🎯 {t('goal_q')}")
    for k in ["1","2","3","4"]:
        label = GOAL_MAP[k].get(LANG, GOAL_MAP[k]["en"])
        print(f"  {k}. {label}")
    goal_in = input(f"{t('choose')}").strip()
    goal_data  = GOAL_MAP.get(goal_in, GOAL_MAP["3"])
    goal_en    = goal_data["en"]
    goal_label = goal_data.get(LANG, goal_en)

    # Level
    print(f"\n📊 {t('level_q')}")
    for k in ["1","2","3"]:
        label = LEVEL_MAP[k].get(LANG, LEVEL_MAP[k]["en"])
        print(f"  {k}. {label}")
    level_in = input(f"{t('choose')}").strip()
    level_data  = LEVEL_MAP.get(level_in, LEVEL_MAP["1"])
    level_en    = level_data["en"]
    level_label = level_data.get(LANG, level_en)

    # Muscles
    print(f"\n💪 {t('muscle_q')}")
    ml = MUSCLE_LABELS.get(LANG, MUSCLE_LABELS["en"])
    for k, v in ml.items():
        print(f"  {k}. {v}")
    muscle_in   = input(f"{t('choose')}").strip()
    target_muscles = []
    muscles_labels = []
    for m in muscle_in.split(","):
        key = m.strip()
        if key in MUSCLE_KEYS:
            target_muscles.append(MUSCLE_KEYS[key])
            muscles_labels.append(ml.get(key, key))
    if not target_muscles:
        target_muscles = ["chest"]
        muscles_labels = [ml.get("1", "chest")]

    # Equipment
    print(f"\n🛠️  {t('equip_q')}")
    el = EQUIP_LABELS.get(LANG, EQUIP_LABELS["en"])
    for k, v in el.items():
        print(f"  {k}. {v}")
    equip_in = input(f"{t('choose')}").strip()
    equipment_list = []
    equip_labels   = []
    for e in equip_in.split(","):
        key = e.strip()
        if key == "6":
            equipment_list = list(EQUIP_KEYS.values())[:-1]
            equip_labels   = [el.get(k, k) for k in list(EQUIP_KEYS.keys())[:-1]]
            break
        elif key in EQUIP_KEYS:
            equipment_list.append(EQUIP_KEYS[key])
            equip_labels.append(el.get(key, key))
    if not equipment_list:
        equipment_list = ["no equipment"]
        equip_labels   = [el.get("1", "no equipment")]

    return {
        "goal_en":      goal_en,
        "goal_label":   goal_label,
        "level_en":     level_en,
        "level_label":  level_label,
        "target_muscles": target_muscles,
        "muscles_label":  ", ".join(muscles_labels),
        "equipment_list": equipment_list,
        "equip_label":    ", ".join(equip_labels),
    }

# ================== RUN ==================

if __name__ == "__main__":
    print(f"\n🌍 Detected language: {LANG.upper()}")
    user_info       = get_user_input()
    recommendations = get_recommendations(
        goal_en        = user_info["goal_en"],
        level_en       = user_info["level_en"],
        target_muscles = user_info["target_muscles"],
        equipment_list = user_info["equipment_list"],
        n              = 6
    )
    print_plan(user_info, recommendations)
