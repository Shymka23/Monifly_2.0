// TypeScript типізація для i18next
import "react-i18next";

// Імпорти типів ресурсів
import type commonEN from "../../public/locales/en/common.json";
import type dashboardEN from "../../public/locales/en/dashboard.json";

// Розширення модуля react-i18next для типізації
declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof commonEN;
      dashboard: typeof dashboardEN;
      budgeting: typeof dashboardEN; // Поки використовуємо dashboard як шаблон
      "financial-goals": typeof dashboardEN;
      debts: typeof dashboardEN;
      crypto: typeof dashboardEN;
      investment: typeof dashboardEN;
      auth: typeof dashboardEN;
      settings: typeof dashboardEN;
    };
    returnNull: false;
    returnEmptyString: false;
    returnObjects: false;
  }
}

// Допоміжні типи для використання поза модулем
interface ICustomTypeOptions {
  defaultNS: "common";
  resources: {
    common: typeof commonEN;
    dashboard: typeof dashboardEN;
    budgeting: typeof dashboardEN;
    "financial-goals": typeof dashboardEN;
    debts: typeof dashboardEN;
    crypto: typeof dashboardEN;
    investment: typeof dashboardEN;
    auth: typeof dashboardEN;
    settings: typeof dashboardEN;
  };
}

export type TranslationNamespace = keyof ICustomTypeOptions["resources"];
export type TranslationKey<T extends TranslationNamespace> =
  keyof ICustomTypeOptions["resources"][T];

// Тип для функції перекладу з правильним типізуванням
export type TFunction = (
  key: string,
  options?: Record<string, unknown>
) => string;

export {};
