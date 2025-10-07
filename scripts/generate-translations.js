#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Підтримувані мови
const LANGUAGES = ["en", "uk", "ru", "de", "es", "fr"];

// Namespace'и для створення
const NAMESPACES = [
  "common",
  "dashboard",
  "budgeting",
  "financial-goals",
  "debts",
  "crypto",
  "investment",
  "auth",
  "settings",
];

// Шаблони для кожного namespace
const TEMPLATES = {
  "financial-goals": {
    en: {
      title: "Financial Goals",
      subtitle: "Set and achieve your financial objectives",
      actions: {
        addGoal: "Add Goal",
        editGoal: "Edit Goal",
        deleteGoal: "Delete Goal",
        markCompleted: "Mark as Completed",
      },
      types: {
        savings: "Savings",
        investment: "Investment",
        debt: "Debt Payment",
        purchase: "Major Purchase",
        emergency: "Emergency Fund",
      },
      status: {
        active: "Active",
        completed: "Completed",
        paused: "Paused",
        cancelled: "Cancelled",
      },
      messages: {
        goalAdded: "Financial goal added successfully",
        goalUpdated: "Financial goal updated successfully",
        goalDeleted: "Financial goal deleted successfully",
        goalCompleted: "Congratulations! Goal completed!",
        noGoals: "No financial goals found",
        addFirstGoal: "Set your first financial goal",
      },
    },
    uk: {
      title: "Фінансові цілі",
      subtitle: "Встановлюйте та досягайте своїх фінансових цілей",
      actions: {
        addGoal: "Додати ціль",
        editGoal: "Редагувати ціль",
        deleteGoal: "Видалити ціль",
        markCompleted: "Відмітити як виконану",
      },
      types: {
        savings: "Накопичення",
        investment: "Інвестиції",
        debt: "Погашення боргу",
        purchase: "Велика покупка",
        emergency: "Резервний фонд",
      },
      status: {
        active: "Активна",
        completed: "Виконана",
        paused: "Призупинена",
        cancelled: "Скасована",
      },
      messages: {
        goalAdded: "Фінансову ціль успішно додано",
        goalUpdated: "Фінансову ціль успішно оновлено",
        goalDeleted: "Фінансову ціль успішно видалено",
        goalCompleted: "Вітаємо! Ціль досягнута!",
        noGoals: "Фінансові цілі не знайдено",
        addFirstGoal: "Встановіть свою першу фінансову ціль",
      },
    },
    ru: {
      title: "Финансовые цели",
      subtitle: "Устанавливайте и достигайте своих финансовых целей",
      actions: {
        addGoal: "Добавить цель",
        editGoal: "Редактировать цель",
        deleteGoal: "Удалить цель",
        markCompleted: "Отметить как выполненную",
      },
      types: {
        savings: "Накопления",
        investment: "Инвестиции",
        debt: "Погашение долга",
        purchase: "Крупная покупка",
        emergency: "Резервный фонд",
      },
      status: {
        active: "Активная",
        completed: "Выполнена",
        paused: "Приостановлена",
        cancelled: "Отменена",
      },
      messages: {
        goalAdded: "Финансовая цель успешно добавлена",
        goalUpdated: "Финансовая цель успешно обновлена",
        goalDeleted: "Финансовая цель успешно удалена",
        goalCompleted: "Поздравляем! Цель достигнута!",
        noGoals: "Финансовые цели не найдены",
        addFirstGoal: "Установите свою первую финансовую цель",
      },
    },
  },

  debts: {
    en: {
      title: "Debt Management",
      subtitle: "Track and manage your debts effectively",
      actions: {
        addDebt: "Add Debt",
        editDebt: "Edit Debt",
        deleteDebt: "Delete Debt",
        recordPayment: "Record Payment",
      },
      types: {
        creditCard: "Credit Card",
        loan: "Loan",
        mortgage: "Mortgage",
        personalLoan: "Personal Loan",
        other: "Other",
      },
      status: {
        active: "Active",
        paid: "Paid Off",
        overdue: "Overdue",
      },
      messages: {
        debtAdded: "Debt added successfully",
        debtUpdated: "Debt updated successfully",
        debtDeleted: "Debt deleted successfully",
        paymentRecorded: "Payment recorded successfully",
        debtPaidOff: "Congratulations! Debt paid off!",
        noDebts: "No debts found",
        addFirstDebt: "Add your first debt to track",
      },
    },
    uk: {
      title: "Управління боргами",
      subtitle: "Відстежуйте та керуйте своїми боргами ефективно",
      actions: {
        addDebt: "Додати борг",
        editDebt: "Редагувати борг",
        deleteDebt: "Видалити борг",
        recordPayment: "Записати платіж",
      },
      types: {
        creditCard: "Кредитна картка",
        loan: "Кредит",
        mortgage: "Іпотека",
        personalLoan: "Особистий кредит",
        other: "Інше",
      },
      status: {
        active: "Активний",
        paid: "Погашений",
        overdue: "Прострочений",
      },
      messages: {
        debtAdded: "Борг успішно додано",
        debtUpdated: "Борг успішно оновлено",
        debtDeleted: "Борг успішно видалено",
        paymentRecorded: "Платіж успішно записано",
        debtPaidOff: "Вітаємо! Борг погашено!",
        noDebts: "Борги не знайдено",
        addFirstDebt: "Додайте свій перший борг для відстеження",
      },
    },
    ru: {
      title: "Управление долгами",
      subtitle: "Отслеживайте и управляйте своими долгами эффективно",
      actions: {
        addDebt: "Добавить долг",
        editDebt: "Редактировать долг",
        deleteDebt: "Удалить долг",
        recordPayment: "Записать платеж",
      },
      types: {
        creditCard: "Кредитная карта",
        loan: "Кредит",
        mortgage: "Ипотека",
        personalLoan: "Личный кредит",
        other: "Прочее",
      },
      status: {
        active: "Активный",
        paid: "Погашен",
        overdue: "Просрочен",
      },
      messages: {
        debtAdded: "Долг успешно добавлен",
        debtUpdated: "Долг успешно обновлен",
        debtDeleted: "Долг успешно удален",
        paymentRecorded: "Платеж успешно записан",
        debtPaidOff: "Поздравляем! Долг погашен!",
        noDebts: "Долги не найдены",
        addFirstDebt: "Добавьте свой первый долг для отслеживания",
      },
    },
  },

  auth: {
    en: {
      title: "Authentication",
      login: {
        title: "Sign In",
        subtitle: "Welcome back to Monifly",
        email: "Email",
        password: "Password",
        rememberMe: "Remember me",
        forgotPassword: "Forgot password?",
        signInButton: "Sign In",
        noAccount: "Don't have an account?",
        signUp: "Sign up",
      },
      signup: {
        title: "Create Account",
        subtitle: "Join Monifly today",
        firstName: "First Name",
        lastName: "Last Name",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        signUpButton: "Create Account",
        haveAccount: "Already have an account?",
        signIn: "Sign in",
      },
      messages: {
        loginSuccess: "Successfully signed in",
        loginError: "Invalid credentials",
        signupSuccess: "Account created successfully",
        signupError: "Error creating account",
        logoutSuccess: "Successfully signed out",
      },
    },
    uk: {
      title: "Автентифікація",
      login: {
        title: "Вхід",
        subtitle: "Ласкаво просимо назад до Monifly",
        email: "Електронна пошта",
        password: "Пароль",
        rememberMe: "Запам'ятати мене",
        forgotPassword: "Забули пароль?",
        signInButton: "Увійти",
        noAccount: "Немає облікового запису?",
        signUp: "Зареєструватися",
      },
      signup: {
        title: "Створити обліковий запис",
        subtitle: "Приєднуйтесь до Monifly сьогодні",
        firstName: "Ім'я",
        lastName: "Прізвище",
        email: "Електронна пошта",
        password: "Пароль",
        confirmPassword: "Підтвердити пароль",
        signUpButton: "Створити обліковий запис",
        haveAccount: "Вже маєте обліковий запис?",
        signIn: "Увійти",
      },
      messages: {
        loginSuccess: "Успішно увійшли",
        loginError: "Невірні облікові дані",
        signupSuccess: "Обліковий запис успішно створено",
        signupError: "Помилка створення облікового запису",
        logoutSuccess: "Успішно вийшли",
      },
    },
    ru: {
      title: "Аутентификация",
      login: {
        title: "Вход",
        subtitle: "Добро пожаловать обратно в Monifly",
        email: "Электронная почта",
        password: "Пароль",
        rememberMe: "Запомнить меня",
        forgotPassword: "Забыли пароль?",
        signInButton: "Войти",
        noAccount: "Нет аккаунта?",
        signUp: "Зарегистрироваться",
      },
      signup: {
        title: "Создать аккаунт",
        subtitle: "Присоединяйтесь к Monifly сегодня",
        firstName: "Имя",
        lastName: "Фамилия",
        email: "Электронная почта",
        password: "Пароль",
        confirmPassword: "Подтвердить пароль",
        signUpButton: "Создать аккаунт",
        haveAccount: "Уже есть аккаунт?",
        signIn: "Войти",
      },
      messages: {
        loginSuccess: "Успешно вошли",
        loginError: "Неверные учетные данные",
        signupSuccess: "Аккаунт успешно создан",
        signupError: "Ошибка создания аккаунта",
        logoutSuccess: "Успешно вышли",
      },
    },
  },
};

// Функция для создания файлов
function createTranslationFiles() {
  const localesDir = path.join(process.cwd(), "public", "locales");

  // Создаем директории для языков
  LANGUAGES.forEach(lang => {
    const langDir = path.join(localesDir, lang);
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }

    // Создаем файлы для каждого namespace
    NAMESPACES.forEach(ns => {
      const filePath = path.join(langDir, `${ns}.json`);

      // Проверяем, существует ли файл
      if (!fs.existsSync(filePath)) {
        let content = {};

        // Используем шаблон если есть
        if (TEMPLATES[ns] && TEMPLATES[ns][lang]) {
          content = TEMPLATES[ns][lang];
        } else {
          // Базовый шаблон
          content = {
            title: `${ns.charAt(0).toUpperCase() + ns.slice(1)}`,
            subtitle: `Manage your ${ns}`,
            loading: "Loading...",
            noData: `No ${ns} found`,
            addNew: `Add new ${ns.slice(0, -1)}`,
          };
        }

        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        console.log(`✅ Created: ${filePath}`);
      } else {
        console.log(`⏭️  Exists: ${filePath}`);
      }
    });
  });
}

// Функция для валідації перекладів
function validateTranslations() {
  const errors = [];
  const localesDir = path.join(process.cwd(), "public", "locales");

  // Перевіряємо що всі мови мають всі namespace'и
  LANGUAGES.forEach(lang => {
    NAMESPACES.forEach(ns => {
      const filePath = path.join(localesDir, lang, `${ns}.json`);
      if (!fs.existsSync(filePath)) {
        errors.push(`Missing file: ${filePath}`);
      }
    });
  });

  if (errors.length > 0) {
    console.log("❌ Validation errors:");
    errors.forEach(error => console.log(`  - ${error}`));
    return false;
  }

  console.log("✅ All translations are valid!");
  return true;
}

// Основна функція
function main() {
  console.log("🌍 Generating translation files...");
  createTranslationFiles();

  console.log("\n🔍 Validating translations...");
  validateTranslations();

  console.log("\n✨ Translation generation complete!");
}

// Запускаємо якщо це основний модуль
if (require.main === module) {
  main();
}

module.exports = { createTranslationFiles, validateTranslations };
