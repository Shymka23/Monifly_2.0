# Monifly Backend API

Повноцінний backend для додатку Monifly - системи управління особистими фінансами.

## 🚀 Технології

- **Node.js** + **TypeScript** - runtime та мова програмування
- **Express.js** - web framework
- **Prisma** - ORM для роботи з базою даних
- **PostgreSQL** - база даних
- **JWT** - аутентифікація
- **Socket.IO** - real-time оновлення
- **Winston** - логування
- **Joi** - валідація даних
- **Bcrypt** - хешування паролів

## 📁 Структура проєкту

```
backend/
├── prisma/
│   └── schema.prisma          # Схема бази даних
├── src/
│   ├── controllers/           # Контролери (бізнес-логіка)
│   │   └── auth.controller.ts
│   ├── routes/               # Маршрути API
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── wallet.routes.ts
│   │   ├── transaction.routes.ts
│   │   ├── budget.routes.ts
│   │   ├── goal.routes.ts
│   │   ├── debt.routes.ts
│   │   ├── crypto.routes.ts
│   │   ├── investment.routes.ts
│   │   ├── life-calendar.routes.ts
│   │   └── analytics.routes.ts
│   ├── middleware/           # Middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── not-found.middleware.ts
│   │   └── rate-limiter.middleware.ts
│   ├── validators/           # Схеми валідації Joi
│   │   └── auth.validator.ts
│   ├── utils/                # Утиліти
│   │   ├── logger.ts
│   │   ├── response.ts
│   │   ├── jwt.ts
│   │   └── password.ts
│   ├── database/             # База даних
│   │   └── connection.ts
│   └── server.ts             # Точка входу
├── .env                      # Змінні середовища
├── .env.example              # Приклад змінних середовища
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠 Встановлення та запуск

### 1. Встановіть залежності

```bash
cd backend
npm install
```

### 2. Налаштуйте базу даних

Створіть файл `.env` на основі `.env.example`:

```bash
cp .env.example .env
```

Відредагуйте `.env` та вкажіть правильні дані для підключення до PostgreSQL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/monifly?schema=public"
```

### 3. Виконайте міграції бази даних

```bash
npm run migrate
```

### 4. Запустіть сервер

**Development режим (з hot reload):**
```bash
npm run dev
```

**Production режим:**
```bash
npm run build
npm start
```

Сервер запуститься на `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Реєстрація користувача
- `POST /api/v1/auth/login` - Вхід в систему
- `POST /api/v1/auth/refresh` - Оновлення access token
- `POST /api/v1/auth/logout` - Вихід з системи
- `GET /api/v1/auth/me` - Отримання даних поточного користувача
- `PUT /api/v1/auth/change-password` - Зміна пароля

### Users
- `GET /api/v1/users/profile` - Профіль користувача
- `PUT /api/v1/users/profile` - Оновлення профілю
- `DELETE /api/v1/users/account` - Видалення акаунту

### Wallets
- `GET /api/v1/wallets` - Список гаманців
- `POST /api/v1/wallets` - Створити гаманець
- `GET /api/v1/wallets/:id` - Отримати гаманець
- `PUT /api/v1/wallets/:id` - Оновити гаманець
- `DELETE /api/v1/wallets/:id` - Видалити гаманець

### Transactions
- `GET /api/v1/transactions` - Список транзакцій
- `POST /api/v1/transactions` - Створити транзакцію
- `GET /api/v1/transactions/:id` - Отримати транзакцію
- `PUT /api/v1/transactions/:id` - Оновити транзакцію
- `DELETE /api/v1/transactions/:id` - Видалити транзакцію

### Budgets
- `GET /api/v1/budgets` - Список бюджетів
- `POST /api/v1/budgets` - Створити бюджет

### Goals
- `GET /api/v1/goals` - Список цілей
- `POST /api/v1/goals` - Створити ціль

### Debts
- `GET /api/v1/debts` - Список боргів
- `POST /api/v1/debts` - Створити борг

### Crypto
- `GET /api/v1/crypto` - Криптовалютні активи
- `POST /api/v1/crypto/buy` - Купити криптовалюту
- `POST /api/v1/crypto/sell` - Продати криптовалюту
- `GET /api/v1/crypto/prices` - Поточні ціни

### Investments
- `GET /api/v1/investments` - Інвестиційні кейси
- `POST /api/v1/investments` - Створити кейс

### Life Calendar
- `GET /api/v1/life-calendar` - Життєвий календар
- `POST /api/v1/life-calendar` - Додати запис

### Analytics
- `GET /api/v1/analytics/overview` - Загальна аналітика
- `GET /api/v1/analytics/income-expense` - Аналітика доходів/витрат
- `GET /api/v1/analytics/net-worth` - Динаміка капіталу

## 🔒 Аутентифікація

API використовує JWT токени для аутентифікації. Після успішного входу/реєстрації ви отримаєте:

- `accessToken` - короткоживучий токен (15 хвилин)
- `refreshToken` - довготривалий токен (7 днів)

Для доступу до захищених endpoints додайте header:
```
Authorization: Bearer <accessToken>
```

## 🗄 База даних

Схема бази даних включає наступні моделі:

- **User** - користувачі
- **UserSettings** - налаштування користувача
- **Wallet** - гаманці
- **Transaction** - транзакції
- **BudgetCategory** - бюджетні категорії
- **FinancialGoal** - фінансові цілі
- **Debt** - борги
- **DebtPayment** - платежі по боргах
- **CryptoHolding** - криптовалютні активи
- **InvestmentCase** - інвестиційні портфелі
- **InvestmentAsset** - інвестиційні активи
- **LifeCalendarEntry** - записи життєвого календаря
- **Milestone** - віхи/досягнення
- **Subscription** - підписки
- **RefreshToken** - токени оновлення

## 🧪 Тестування

```bash
npm test
```

## 📝 Логування

Логи зберігаються в директорії `logs/`:
- `combined.log` - всі логи
- `error.log` - тільки помилки

## 🔧 Корисні команди

```bash
# Запуск Prisma Studio (GUI для БД)
npm run db:studio

# Створення нової міграції
npm run migrate

# Deploy міграцій (production)
npm run migrate:prod

# Seed даних (тестові дані)
npm run db:seed

# Лінтинг
npm run lint
npm run lint:fix

# Build
npm run build
```

## 🚀 Deploy

### Heroku
```bash
heroku create monifly-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Docker
```bash
docker build -t monifly-backend .
docker run -p 5000:5000 monifly-backend
```

## 📄 Ліцензія

MIT

## 👥 Автори

Monifly Team
