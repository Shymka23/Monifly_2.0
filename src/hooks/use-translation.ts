import { useTranslation as useI18nTranslation } from "react-i18next";
import {
  LanguageCode,
  changeLanguage,
  getCurrentLanguage,
} from "@/lib/i18n-new";

export const useTranslation = (ns?: string | string[]) => {
  const { t, i18n, ready } = useI18nTranslation(ns);

  return {
    // Основна функція перекладу з правильним типізуванням
    t: (key: string, options?: Record<string, unknown>) => {
      // Перевіряємо чи i18n готовий
      if (!ready) {
        return key.split(".").pop() || key;
      }

      const result = t(key, {
        ...options,
        defaultValue: key.split(".").pop() || key,
      });

      return typeof result === "string" ? result : String(result);
    },

    // i18n інстанс
    i18n,

    // Стан готовності
    ready,

    // Поточна мова
    currentLanguage: getCurrentLanguage(),

    // Зміна мови
    changeLanguage: (lng: LanguageCode) => changeLanguage(lng),

    // Перевірка чи завантажена мова
    isLanguageLoaded: (lng: string, namespace?: string) => {
      return i18n.hasResourceBundle(lng, namespace || "common");
    },

    // Перевірка чи існує переклад
    exists: (key: string, options?: Record<string, unknown>) =>
      i18n.exists(key, options),

    // Отримання всіх підтримуваних мов
    getSupportedLanguages: () => {
      const langs = i18n.options.supportedLngs;
      if (Array.isArray(langs)) {
        return langs.filter((lng: string) => lng !== "cimode");
      }
      return [];
    },

    // Форматування з урахуванням локалі
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(i18n.language, options).format(value);
    },

    formatCurrency: (value: number, currency = "USD") => {
      return new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency,
      }).format(value);
    },

    formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
      return new Intl.DateTimeFormat(i18n.language, options).format(
        new Date(date)
      );
    },

    formatDateTime: (date: Date | string) => {
      return new Intl.DateTimeFormat(i18n.language, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(date));
    },

    // Переклад з множиною
    tCount: (key: string, count: number, options?: Record<string, unknown>) => {
      const result = t(key, { count, ...options });
      return typeof result === "string" ? result : String(result);
    },

    // Переклад з інтерполяцією
    tInterpolate: (key: string, values: Record<string, unknown>) => {
      const result = t(key, values);
      return typeof result === "string" ? result : String(result);
    },
  };
};
