export type Gender = "female" | "male" | "other";
export type ActivityLevel = "low" | "medium" | "high";
export type LifestyleGoal = "lose_weight" | "gain_weight" | "maintain";
export type BloodPressure = "high" | "low" | "normal" | "unknown";

export interface LifestyleProfileInput {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: LifestyleGoal;
  allergies: string[];
  bloodPressure: BloodPressure;
}

export interface LifestylePlan {
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  waterLiters: number;
  restDays: string[];
  meals: Array<{
    title: string;
    time: string;
    items: string[];
  }>;
  workouts: Array<{
    day: string;
    focus: string;
    intensity: "light" | "moderate" | "active";
    details: string;
  }>;
  safetyNotes: string[];
}

const activityMultiplier: Record<ActivityLevel, number> = {
  low: 1.25,
  medium: 1.45,
  high: 1.65,
};

const goalDelta: Record<LifestyleGoal, number> = {
  lose_weight: -350,
  gain_weight: 320,
  maintain: 0,
};

const days = ["Дүйсенбі", "Сейсенбі", "Сәрсенбі", "Бейсенбі", "Жұма", "Сенбі", "Жексенбі"];

export const goalLabels: Record<LifestyleGoal, string> = {
  lose_weight: "Арықтау",
  gain_weight: "Салмақ қосу",
  maintain: "Форма сақтау",
};

export const activityLabels: Record<ActivityLevel, string> = {
  low: "Төмен",
  medium: "Орташа",
  high: "Жоғары",
};

export const bloodPressureLabels: Record<BloodPressure, string> = {
  high: "Жоғары",
  low: "Төмен",
  normal: "Қалыпты",
  unknown: "Белгісіз",
};

export function parseAllergies(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function calculateLifestylePlan(profile: LifestyleProfileInput): LifestylePlan {
  const baseBmr =
    10 * profile.weightKg +
    6.25 * profile.heightCm -
    5 * profile.age +
    (profile.gender === "male" ? 5 : profile.gender === "female" ? -161 : -78);
  const pressureAdjustment = profile.bloodPressure === "high" ? -80 : profile.bloodPressure === "low" ? 40 : 0;
  const calories = Math.max(1250, Math.round(baseBmr * activityMultiplier[profile.activityLevel] + goalDelta[profile.goal] + pressureAdjustment));
  const proteinMultiplier = profile.goal === "gain_weight" ? 1.9 : profile.goal === "lose_weight" ? 1.7 : 1.5;
  const proteinG = Math.round(profile.weightKg * proteinMultiplier);
  const fatG = Math.round((calories * 0.27) / 9);
  const carbsG = Math.max(90, Math.round((calories - proteinG * 4 - fatG * 9) / 4));
  const waterLiters = Number(Math.min(3.4, Math.max(1.8, profile.weightKg * 0.033)).toFixed(1));
  const restDays = profile.goal === "gain_weight" ? ["Сәрсенбі", "Жексенбі"] : ["Бейсенбі", "Жексенбі"];
  const pressureSensitive = profile.bloodPressure === "high" || profile.bloodPressure === "low";

  const mealProtein = profile.goal === "gain_weight" ? "тауық еті, жұмыртқа немесе сүзбе" : "тауық еті, балық немесе бұршақ";
  const carbBase = profile.goal === "lose_weight" ? "қарақұмық, көкөніс және жасыл салат" : "күріш, сұлы, картоп немесе тұтас дәнді нан";
  const allergyText = profile.allergies.length > 0 ? `Аллергияңызды ескеріңіз: ${profile.allergies.join(", ")} қоспаңыз.` : "Аллергия көрсетілмеген, жаңа өнімді аз мөлшерден бастаңыз.";

  const meals = [
    { title: "Таңғы ас", time: "08:00", items: ["сұлы ботқасы немесе жұмыртқа", "жеміс", "қантсыз шай немесе су"] },
    { title: "Түскі ас", time: "13:00", items: [mealProtein, carbBase, "көкөніс"] },
    { title: "Аралық ас", time: "16:30", items: ["айран, йогурт немесе жаңғақ", allergyText] },
    { title: "Кешкі ас", time: "19:30", items: [profile.goal === "gain_weight" ? "ақуыз + күрделі көмірсу" : "ақуыз + жеңіл көкөніс", "ұйқыға 2-3 сағат қалғанда аяқтау"] },
  ];

  const workouts = days.map((day, index) => {
    if (restDays.includes(day)) {
      return {
        day,
        focus: "Қалпына келу",
        intensity: "light" as const,
        details: "20 минут жеңіл серуен, созылу және ұйқы режимін сақтау.",
      };
    }

    if (profile.goal === "lose_weight") {
      return {
        day,
        focus: index % 2 === 0 ? "Кардио" : "Толық денеге жеңіл жаттығу",
        intensity: pressureSensitive ? ("light" as const) : ("moderate" as const),
        details: pressureSensitive
          ? "25-30 минут баяу жүру, жеңіл созылу, секірусіз қозғалыстар."
          : "30-40 минут кардио, отырып-тұру, тіреп тұру, қолды бүгіп-жазудың жеңіл нұсқалары.",
      };
    }

    if (profile.goal === "gain_weight") {
      return {
        day,
        focus: index % 2 === 0 ? "Күш жаттығулары" : "Жоғарғы/төменгі дене",
        intensity: pressureSensitive ? ("moderate" as const) : ("active" as const),
        details: pressureSensitive
          ? "Орташа салмақ, ұзақ тыныс ұстамау, сет арасында 90 секунд демалу."
          : "Негізгі күш қозғалыстары, 3-4 сет, ақуызды ас 60 минут ішінде.",
      };
    }

    return {
      day,
      focus: "Теңгерімді толық дене жаттығуы",
      intensity: pressureSensitive ? ("light" as const) : ("moderate" as const),
      details: pressureSensitive
        ? "Жеңіл қарқын, созылу және тыныс бақылауы."
        : "30 минут толық дене жаттығуы, 10 минут қозғалыс икемділігі, 20 минут серуен.",
    };
  });

  const safetyNotes = [
    "Бұл жоспар медициналық кеңес емес, ақпараттық қолдау ретінде берілген.",
    profile.bloodPressure === "high"
      ? "Қан қысымы жоғары болса, ауыр күш жаттығулары мен тұзды тағамды шектеңіз."
      : profile.bloodPressure === "low"
        ? "Қан қысымы төмен болса, жаттығуды баяу бастап, су мен жеңіл тұз балансын бақылаңыз."
        : "Өзіңізді жайсыз сезінсеңіз, жаттығуды тоқтатып, маманға жүгініңіз.",
    profile.allergies.length > 0
      ? `Мәзірден қауіпті өнімдерді алып тастаңыз: ${profile.allergies.join(", ")}.`
      : "Аллергияңыз болса, профильде міндетті түрде көрсетіңіз.",
  ];

  return {
    calories,
    proteinG,
    fatG,
    carbsG,
    waterLiters,
    restDays,
    meals,
    workouts,
    safetyNotes,
  };
}
