import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    uk: {
      translation: {
        landing: {
          title: "Monifly - Ваш фінансовий помічник",
          description:
            "Керуйте своїми фінансами розумно та ефективно. Відстежуйте витрати, плануйте бюджет та досягайте своїх фінансових цілей.",
          login: "Увійти",
          signup: "Зареєструватися",
        },
        login: {
          title: "Вхід",
          description: "Увійдіть у свій обліковий запис",
          emailPlaceholder: "Електронна пошта",
          passwordPlaceholder: "Пароль",
          forgotPassword: "Забули пароль?",
          signIn: "Увійти",
          signingIn: "Вхід...",
          noAccount: "Немає облікового запису?",
          signUp: "Зареєструватися",
        },
        signup: {
          title: "Реєстрація",
          description: "Створіть свій обліковий запис",
          firstNamePlaceholder: "Ім'я",
          lastNamePlaceholder: "Прізвище",
          emailPlaceholder: "Електронна пошта",
          passwordPlaceholder: "Пароль",
          confirmPasswordPlaceholder: "Підтвердіть пароль",
          signUp: "Зареєструватися",
          signingUp: "Реєстрація...",
          haveAccount: "Вже маєте обліковий запис?",
          signIn: "Увійти",
        },
        forgotPassword: {
          title: "Забули пароль?",
          description:
            "Введіть свою електронну пошту і ми надішлемо вам інструкції для скидання паролю",
          emailPlaceholder: "Електронна пошта",
          sendButton: "Надіслати інструкції",
          sending: "Надсилання...",
          backToLogin: "Повернутися до входу",
        },
        resetPassword: {
          title: "Скидання паролю",
          description: "Введіть новий пароль для вашого облікового запису",
          newPasswordPlaceholder: "Новий пароль",
          confirmPasswordPlaceholder: "Підтвердіть новий пароль",
          resetButton: "Скинути пароль",
          resetting: "Скидання...",
          invalidToken: "Недійсний токен",
          invalidTokenDescription:
            "Посилання для скидання паролю недійсне або застаріле",
          requestNewToken: "Запросити нове посилання",
        },
        404: {
          title: "404 - Сторінку не знайдено",
          description: "Вибачте, але сторінку, яку ви шукаєте, не знайдено.",
          backHome: "На головну",
        },
      },
    },
  },
  lng: "uk",
  fallbackLng: "uk",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
