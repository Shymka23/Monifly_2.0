"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n-new";
import { useEffect, useState } from "react";

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    // Чекаємо поки i18n ініціалізується
    if (i18n.isInitialized) {
      setIsI18nReady(true);
    } else {
      i18n.on("initialized", () => {
        setIsI18nReady(true);
      });
    }

    // Обновляємо lang атрибут при зміні мови
    const handleLanguageChange = (lng: string) => {
      document.documentElement.lang = lng;
    };

    i18n.on("languageChanged", handleLanguageChange);

    // Встановлюємо початкову мову
    if (i18n.language) {
      document.documentElement.lang = i18n.language;
    }

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
      i18n.off("initialized", () => setIsI18nReady(true));
    };
  }, []);

  // Показуємо лоадер поки i18n не готовий
  if (!isI18nReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
