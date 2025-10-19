import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "kk" | "ru" | "en";

interface Translations {
  navbar: {
    home: string;
    categories: string;
    signIn: string;
    signOut: string;
    admin: string;
    purchases: string;
    cart: string;
  };
  hero: {
    title: string;
    subtitle: string;
    search: string;
    searchPlaceholder: string;
  };
  categories: {
    all: string;
    title: string;
  };
  websiteCard: {
    viewDemo: string;
    addToCart: string;
    viewDetails: string;
    removeFromCart: string;
  };
  cart: {
    title: string;
    empty: string;
    total: string;
    checkout: string;
    continueShopping: string;
    remove: string;
  };
  sort: {
    label: string;
    newest: string;
    oldest: string;
    priceLow: string;
    priceHigh: string;
  };
  auth: {
    email: string;
    password: string;
    signUp: string;
    signIn: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
  };
  admin: {
    panel: string;
    addWebsite: string;
    title: string;
    description: string;
    price: string;
    category: string;
    imageUrl: string;
    demoUrl: string;
    add: string;
  };
  messages: {
    success: string;
    error: string;
    addedToCart: string;
    removedFromCart: string;
    alreadyInCart: string;
  };
  purchases: {
    title: string;
  };
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const translations: Record<Language, Translations> = {
  en: {
    navbar: {
      home: "Home",
      categories: "Categories",
      signIn: "Sign In",
      signOut: "Sign Out",
      admin: "Admin",
      purchases: "Purchases",
      cart: "Cart",
    },
    hero: {
      title: "Discover Amazing Websites",
      subtitle: "Browse our collection of premium website templates",
      search: "Search websites...",
      searchPlaceholder: "Search by title or description...",
    },
    categories: {
      all: "All",
      title: "Categories",
    },
    websiteCard: {
      viewDemo: "View Demo",
      addToCart: "Add to Cart",
      viewDetails: "View Details",
      removeFromCart: "Remove from Cart",
    },
    cart: {
      title: "Shopping Cart",
      empty: "Your cart is empty",
      total: "Total",
      checkout: "Proceed to Checkout",
      continueShopping: "Continue Shopping",
      remove: "Remove",
    },
    sort: {
      label: "Sort by",
      newest: "Newest First",
      oldest: "Oldest First",
      priceLow: "Price: Low to High",
      priceHigh: "Price: High to Low",
    },
    auth: {
      email: "Email",
      password: "Password",
      signUp: "Sign Up",
      signIn: "Sign In",
      alreadyHaveAccount: "Already have an account?",
      dontHaveAccount: "Don't have an account?",
    },
    admin: {
      panel: "Admin Panel",
      addWebsite: "Add Website",
      title: "Title",
      description: "Description",
      price: "Price",
      category: "Category",
      imageUrl: "Image URL",
      demoUrl: "Demo URL",
      add: "Add",
    },
    messages: {
      success: "Success!",
      error: "An error occurred",
      addedToCart: "Added to cart",
      removedFromCart: "Removed from cart",
      alreadyInCart: "Already in cart",
    },
    purchases: {
      title: "My Purchases",
    },
  },
  ru: {
    navbar: {
      home: "Главная",
      categories: "Категории",
      signIn: "Войти",
      signOut: "Выйти",
      admin: "Админ",
      purchases: "Покупки",
      cart: "Корзина",
    },
    hero: {
      title: "Удивительные веб-сайты",
      subtitle: "Просмотрите нашу коллекцию премиум шаблонов",
      search: "Поиск сайтов...",
      searchPlaceholder: "Поиск по названию или описанию...",
    },
    categories: {
      all: "Все",
      title: "Категории",
    },
    websiteCard: {
      viewDemo: "Демо",
      addToCart: "В корзину",
      viewDetails: "Подробнее",
      removeFromCart: "Удалить из корзины",
    },
    cart: {
      title: "Корзина",
      empty: "Ваша корзина пуста",
      total: "Итого",
      checkout: "Оформить заказ",
      continueShopping: "Продолжить покупки",
      remove: "Удалить",
    },
    sort: {
      label: "Сортировка",
      newest: "Сначала новые",
      oldest: "Сначала старые",
      priceLow: "Цена: по возрастанию",
      priceHigh: "Цена: по убыванию",
    },
    auth: {
      email: "Email",
      password: "Пароль",
      signUp: "Регистрация",
      signIn: "Войти",
      alreadyHaveAccount: "Уже есть аккаунт?",
      dontHaveAccount: "Нет аккаунта?",
    },
    admin: {
      panel: "Панель администратора",
      addWebsite: "Добавить сайт",
      title: "Название",
      description: "Описание",
      price: "Цена",
      category: "Категория",
      imageUrl: "URL изображения",
      demoUrl: "URL демо",
      add: "Добавить",
    },
    messages: {
      success: "Успешно!",
      error: "Произошла ошибка",
      addedToCart: "Добавлено в корзину",
      removedFromCart: "Удалено из корзины",
      alreadyInCart: "Уже в корзине",
    },
    purchases: {
      title: "Мои покупки",
    },
  },
  kk: {
    navbar: {
      home: "Басты бет",
      categories: "Санаттар",
      signIn: "Кіру",
      signOut: "Шығу",
      admin: "Админ",
      purchases: "Сатып алулар",
      cart: "Себет",
    },
    hero: {
      title: "Керемет веб-сайттар",
      subtitle: "Біздің премиум үлгілер жинағын қараңыз",
      search: "Сайттарды іздеу...",
      searchPlaceholder: "Атауы немесе сипаттамасы бойынша іздеу...",
    },
    categories: {
      all: "Барлығы",
      title: "Санаттар",
    },
    websiteCard: {
      viewDemo: "Демо",
      addToCart: "Себетке қосу",
      viewDetails: "Толығырақ",
      removeFromCart: "Себеттен алу",
    },
    cart: {
      title: "Себет",
      empty: "Себетіңіз бос",
      total: "Барлығы",
      checkout: "Төлемге өту",
      continueShopping: "Сатып алуды жалғастыру",
      remove: "Өшіру",
    },
    sort: {
      label: "Сұрыптау",
      newest: "Алдымен жаңалары",
      oldest: "Алдымен ескілері",
      priceLow: "Бағасы: өсу бойынша",
      priceHigh: "Бағасы: кему бойынша",
    },
    auth: {
      email: "Email",
      password: "Құпия сөз",
      signUp: "Тіркелу",
      signIn: "Кіру",
      alreadyHaveAccount: "Аккаунтыңыз бар ма?",
      dontHaveAccount: "Аккаунтыңыз жоқ па?",
    },
    admin: {
      panel: "Әкімші панелі",
      addWebsite: "Сайт қосу",
      title: "Атауы",
      description: "Сипаттама",
      price: "Бағасы",
      category: "Санат",
      imageUrl: "Сурет URL",
      demoUrl: "Демо URL",
      add: "Қосу",
    },
    messages: {
      success: "Сәтті!",
      error: "Қате орын алды",
      addedToCart: "Себетке қосылды",
      removedFromCart: "Себеттен алынды",
      alreadyInCart: "Себетте бар",
    },
    purchases: {
      title: "Менің сатып алуларым",
    },
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "kk";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
