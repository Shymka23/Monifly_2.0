import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import type { InitOptions, FormatFunction } from "i18next";
import "./types-i18n"; // Імпорт типізації

// Список підтримуваних мов
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

// Типізована функція форматування
const formatFunction: FormatFunction = (
  value: unknown,
  format: string | undefined,
  lng: string | undefined
): string => {
  if (!format || !lng) return String(value);

  if (format === "uppercase") return String(value).toUpperCase();
  if (format === "lowercase") return String(value).toLowerCase();
  if (format === "currency") {
    const v = value as { amount?: number; currency?: string } | number;
    return new Intl.NumberFormat(lng, {
      style: "currency",
      currency:
        (typeof v === "object" &&
          v &&
          "currency" in v &&
          (v as { currency?: string }).currency) ||
        "USD",
    }).format(
      typeof v === "object" && v && "amount" in v
        ? (v as { amount: number }).amount
        : (v as number)
    );
  }
  if (format === "date") {
    return new Intl.DateTimeFormat(lng).format(
      new Date(value as string | number | Date)
    );
  }
  if (format === "datetime") {
    return new Intl.DateTimeFormat(lng, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value as string | number | Date));
  }
  return String(value);
};

// Ініціалізація i18next з правильними типами
const i18nOptions: InitOptions = {
  fallbackLng: "en",
  supportedLngs: SUPPORTED_LANGUAGES.map(lang => lang.code),
  debug: true,

  // Namespace конфігурація
  defaultNS: "common",
  ns: [
    "common",
    "dashboard",
    "budgeting",
    "life-goals",
    "debts",
    "crypto",
    "investment",
    "auth",
    "settings",
  ],

  // Детекція мови
  detection: {
    order: ["localStorage", "cookie", "navigator", "htmlTag"],
    caches: ["localStorage", "cookie"],
    lookupLocalStorage: "i18nextLng",
    lookupCookie: "i18next",
    convertDetectedLanguage: (lng: string) => {
      // Конвертуємо en-US в en, uk-UA в uk, тощо
      return lng.split("-")[0];
    },
  },

  // Backend конфігурація
  backend: {
    loadPath: "/locales/{{lng}}/{{ns}}.json",
  },

  // React конфігурація
  react: {
    useSuspense: false,
    bindI18n: "languageChanged",
    bindI18nStore: "",
    transEmptyNodeValue: "",
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p"],
  },

  // Формати для інтерполяції
  interpolation: {
    escapeValue: false, // React вже захищає від XSS
    format: formatFunction,
    prefix: "{{",
    suffix: "}}",
    formatSeparator: ",",
    unescapePrefix: "-",
    nestingPrefix: "$t(",
    nestingSuffix: ")",
    nestingOptionsSeparator: ",",
    maxReplaces: 1000,
    skipOnVariables: true,
  },

  // Налаштування збереження відсутніх ключів
  saveMissing: false,
  updateMissing: false,
  missingKeyHandler: false,
  load: "languageOnly",
  cleanCode: true,
};

i18n.use(Backend).use(LanguageDetector).use(initReactI18next);

// Ініціалізуємо i18n з обробкою помилок
i18n
  .init(i18nOptions)
  .then(() => {
    // Якщо мова не завантажилася, примусово встановлюємо українську
    if (!i18n.hasResourceBundle(i18n.language, "common")) {
      i18n.changeLanguage("uk");
    }
  })
  .catch(() => {
    // У випадку помилки, встановлюємо українську мову
    i18n.changeLanguage("uk");
  });

export default i18n;

// Хелпер функції
export const getCurrentLanguage = (): LanguageCode => {
  return (i18n.language as LanguageCode) || "en";
};

export const changeLanguage = (lng: LanguageCode) => {
  i18n.changeLanguage(lng);
  document.documentElement.lang = lng;
};

export const getSupportedLanguage = (
  code: string
): (typeof SUPPORTED_LANGUAGES)[number] | undefined => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
};
