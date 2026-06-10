import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Lang = "kk" | "en";

interface Translations {
  [key: string]: string;
}

const kk: Translations = {
  // Nav
  "nav.help": "Көмек",
  "nav.history": "Тарих",
  "nav.medicine": "Дәрі",
  "nav.lifestyle": "Lifestyle",
  "nav.reviews": "Пікір",
  "nav.profile": "Профиль",
  "nav.pro": "Pro",
  "nav.admin": "Админ",
  "nav.menu": "Мәзір",
  "nav.logout": "Шығу",
  "nav.subtitle.pro": "Pro медициналық көмекші — лимитсіз",
  "nav.subtitle.free": "Қарапайым медициналық көмекші",

  // Chat
  "chat.placeholder": "Сұрағыңызды жазыңыз...",
  "chat.send": "Жіберу",
  "chat.remaining": "Қалған сұрақ",
  "chat.unlimited": "Шексіз",
  "chat.mode.medical": "Медицина",
  "chat.mode.psychology": "Психология",
  "chat.mode.motivation": "Мотивация",
  "chat.mode.nutrition": "Тамақ",
  "chat.mode.fitness": "Фитнес",
  "chat.welcome": "AIZHAN-ға қош келдіңіз! Денсаулық, психология, тамақтану немесе фитнес бойынша сұрақ қойыңыз.",
  "chat.limit.title": "Сұрақ лимиті бітті",
  "chat.limit.desc": "12 сағатта 5 тегін сұрақ. Pro жазылым арқылы лимитсіз қолданыңыз.",
  "chat.limit.buy": "Pro алу",

  // Pro page
  "pro.badge": "AIZHAN Pro",
  "pro.title": "Лимитсіз және толық жауап беретін Pro режим",
  "pro.desc": "Pro жазылымы AI-ды күнделікті көмекші ретінде жиі қолданатын адамдарға арналған.",
  "pro.price": "4990 тг / ай",
  "pro.active": "Pro белсенді",
  "pro.until": "дейін",
  "pro.unlimited": "мерзімсіз",
  "pro.buy": "WhatsApp арқылы Pro алу",
  "pro.go_chat": "Чатқа өту",
  "pro.price_label": "Бағасы",
  "pro.per_month": "/ ай",
  "pro.benefit1.title": "Лимитсіз сұрақ",
  "pro.benefit1.text": "Pro қолданушылар қанша сұрақ қойса да болады. Free жоспарында 12 сағатқа 5 сұрақ беріледі.",
  "pro.benefit2.title": "Толығырақ жауап",
  "pro.benefit2.text": "Pro режимінде AI жауапты кеңірек түсіндіреді: себептер, қадамдар, қауіп белгілері және келесі әрекеттер.",
  "pro.benefit3.title": "Күштірек AI режимі",
  "pro.benefit3.text": "Free жауап қысқа және жалпы бағыт береді, ал Pro жауабы тереңірек әрі практикалық болады.",
  "pro.benefit4.title": "Қауіпсіз кеңес",
  "pro.benefit4.text": "Медициналық сұрақтарда AI диагноз қоймайды, бірақ маңызды жағдайда дәрігерге қаралуды ескертеді.",
  "pro.diff.title": "Free пен Pro айырмашылығы",
  "pro.diff.text": "Free жоспарында AI қысқа, негізгі бағыттағы жауап береді және 12 сағатқа 5 сұрақпен шектеледі. Pro жоспарында сұрақ саны шектелмейді, жауаптар толық, нақтырақ және қолдануға ыңғайлы құрылыммен беріледі.",
  "pro.check1": "Лимитсіз AI сұрақ",
  "pro.check2": "Толық әрі терең жауап",
  "pro.check3": "Медициналық қауіпсіздік ескертулері",
  "pro.whatsapp_btn": "WhatsApp жіберу",

  // Welcome 3-day Pro gift
  "welcome.badge": "СЫЙЛЫҚ • PRO",
  "welcome.title": "Сізге 3 күн тегін PRO сыйладық!",
  "welcome.subtitle": "AIZHAN-ға тіркелгеніңіз үшін рахмет 💛",
  "welcome.desc": "Тіркелген сәттен бастап 3 күн бойы AIZHAN-ның барлық PRO мүмкіндіктері сізге толықтай ашық. Ешқандай төлем жасамайсыз.",
  "welcome.bullet1": "Лимитсіз AI сұрақтар (free режимінде 12 сағатқа 5 ғана)",
  "welcome.bullet2": "Толық және терең медициналық жауаптар",
  "welcome.bullet3": "Барлық режимдер: медицина, психология, тамақтану, фитнес",
  "welcome.until": "PRO белсенді",
  "welcome.cta": "Тамаша, бастаймын!",
};

const en: Translations = {
  // Nav
  "nav.help": "Help",
  "nav.history": "History",
  "nav.medicine": "Medicine",
  "nav.lifestyle": "Lifestyle",
  "nav.reviews": "Reviews",
  "nav.profile": "Profile",
  "nav.pro": "Pro",
  "nav.admin": "Admin",
  "nav.menu": "Menu",
  "nav.logout": "Logout",
  "nav.subtitle.pro": "Pro medical assistant — unlimited",
  "nav.subtitle.free": "Simple medical assistant",

  // Chat
  "chat.placeholder": "Type your question...",
  "chat.send": "Send",
  "chat.remaining": "Questions left",
  "chat.unlimited": "Unlimited",
  "chat.mode.medical": "Medical",
  "chat.mode.psychology": "Psychology",
  "chat.mode.motivation": "Motivation",
  "chat.mode.nutrition": "Nutrition",
  "chat.mode.fitness": "Fitness",
  "chat.welcome": "Welcome to AIZHAN! Ask questions about health, psychology, nutrition or fitness.",
  "chat.limit.title": "Question limit reached",
  "chat.limit.desc": "5 free questions per 12 hours. Get Pro for unlimited access.",
  "chat.limit.buy": "Get Pro",

  // Pro page
  "pro.badge": "AIZHAN Pro",
  "pro.title": "Unlimited and detailed Pro mode",
  "pro.desc": "Pro subscription is designed for people who frequently use AI as a daily assistant.",
  "pro.price": "4990 KZT / month",
  "pro.active": "Pro active",
  "pro.until": "until",
  "pro.unlimited": "unlimited",
  "pro.buy": "Get Pro via WhatsApp",
  "pro.go_chat": "Go to Chat",
  "pro.price_label": "Price",
  "pro.per_month": "/ month",
  "pro.benefit1.title": "Unlimited questions",
  "pro.benefit1.text": "Pro users can ask as many questions as they want. Free plan gives 5 questions per 12 hours.",
  "pro.benefit2.title": "Detailed answers",
  "pro.benefit2.text": "In Pro mode, AI provides more thorough explanations: causes, steps, warning signs and next actions.",
  "pro.benefit3.title": "Stronger AI mode",
  "pro.benefit3.text": "Free answers are short and general, while Pro answers are deeper and more practical.",
  "pro.benefit4.title": "Safe advice",
  "pro.benefit4.text": "In medical questions AI doesn't diagnose, but warns to see a doctor when necessary.",
  "pro.diff.title": "Difference between Free and Pro",
  "pro.diff.text": "In the Free plan, AI gives short, general answers limited to 5 questions per 12 hours. In the Pro plan, there's no question limit, and answers are complete, specific and well-structured.",
  "pro.check1": "Unlimited AI questions",
  "pro.check2": "Complete and deep answers",
  "pro.check3": "Medical safety warnings",
  "pro.whatsapp_btn": "Send WhatsApp",

  // Welcome 3-day Pro gift
  "welcome.badge": "GIFT • PRO",
  "welcome.title": "You got 3 days of PRO for free!",
  "welcome.subtitle": "Thanks for signing up to AIZHAN 💛",
  "welcome.desc": "From the moment you signed up, all PRO features of AIZHAN are unlocked for 3 days. No payment required.",
  "welcome.bullet1": "Unlimited AI questions (Free is limited to 5 per 12h)",
  "welcome.bullet2": "Full, detailed and in-depth medical answers",
  "welcome.bullet3": "All modes: medical, psychology, nutrition, fitness",
  "welcome.until": "PRO active until",
  "welcome.cta": "Awesome, let's go!",
};

const translations: Record<Lang, Translations> = { kk, en };

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "kk",
  setLang: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("aizhan_lang");
    return (saved === "en" ? "en" : "kk") as Lang;
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("aizhan_lang", l);
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations.kk[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
