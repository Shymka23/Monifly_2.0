# Структура Проєкту Monifly

Цей документ представляє огляд структури папок та файлів у проєкті Monifly.

```
/
├── .env                  # Змінні середовища (напр. API ключі)
├── .vscode/
│   └── settings.json     # Налаштування VS Code для проєкту
├── components.json       # Конфігурація для shadcn/ui
├── next.config.ts        # Конфігураційний файл Next.js
├── package.json          # Залежності та скрипти проєкту
├── public/               # Папка для статичних файлів
├── README.md             # Основна документація проєкту
├── tailwind.config.ts    # Конфігураційний файл Tailwind CSS
├── tsconfig.json         # Конфігураційний файл TypeScript
└── src/
    ├── ai/
    │   ├── dev.ts        # Точка входу для запуску Genkit в режимі розробки
    │   ├── flows/        # Папка для Genkit AI Flows
    │   │   ├── ai-assistant-chat-flow.ts
    │   │   ├── crypto-portfolio-insights.ts
    │   │   ├── generate-goal-reminder-flow.ts
    │   │   ├── investment-portfolio-advice-flow.ts
    │   │   └── smart-goal-creator.ts
    │   └── genkit.ts     # Ініціалізація та конфігурація Genkit
    ├── app/
    │   ├── (app)/        # Група маршрутів для аутентифікованих користувачів
    │   │   ├── ai-assistant/
    │   │   │   └── page.tsx
    │   │   ├── budgeting/
    │   │   │   └── page.tsx
    │   │   ├── crypto-portfolio/
    │   │   │   └── page.tsx
    │   │   ├── dashboard/
    │   │   │   └── page.tsx
    │   │   ├── debts/
    │   │   │   └── page.tsx
    │   │   ├── financial-goals/
    │   │   │   └── page.tsx
    │   │   ├── investment-portfolio/
    │   │   │   └── page.tsx
    │   │   ├── layout.tsx      # Основний макет для сторінок додатку (з сайдбаром)
    │   │   └── settings/
    │   │       └── page.tsx
    │   ├── globals.css     # Глобальні стилі та змінні Tailwind/shadcn
    │   ├── layout.tsx      # Кореневий макет додатку
    │   ├── page.tsx        # Головна сторінка (лендінг)
    │   ├── login/
    │   │   └── page.tsx    # Сторінка входу
    │   └── signup/
    │       └── page.tsx    # Сторінка реєстрації
    ├── components/
    │   ├── budgeting/      # Компоненти для сторінки бюджетування
    │   ├── crypto/         # Компоненти для сторінки крипто-портфеля
    │   ├── dashboard/      # Компоненти для головної панелі
    │   │   └── charts/     # Компоненти діаграм
    │   ├── debts/          # Компоненти для сторінки боргів
    │   ├── financial-goals/# Компоненти для сторінки фінансових цілей
    │   ├── icons/          # Кастомні іконки (напр. логотип)
    │   ├── investment-portfolio/ # Компоненти для інвестиційного портфеля
    │   └── ui/             # Компоненти shadcn/ui
    ├── hooks/
    │   ├── use-budget-store.ts # Сховище стану Zustand
    │   ├── use-mobile.tsx      # Хук для визначення мобільного пристрою
    │   └── use-toast.ts        # Хук для відображення сповіщень
    └── lib/
        ├── i18n.ts         # Логіка інтернаціоналізації (перекладів)
        ├── types.ts        # Глобальні типи TypeScript
        └── utils.ts        # Допоміжні функції (напр. cn, formatCurrency)

```
