# ⚡ Швидкий старт Backend

## 🔥 За 5 хвилин до запуску!

### Крок 1: Налаштування ENV (30 сек)

```bash
cd backend
cp env.example .env
```

Відредагуйте `.env` файл:

- Замініть `DATABASE_URL` на ваш PostgreSQL URL
- Замініть `JWT_SECRET` на випадковий ключ
- Замініть `JWT_REFRESH_SECRET` на інший випадковий ключ

**Генерація секретів:**

```bash
# Mac/Linux
openssl rand -base64 32

# Або онлайн
https://randomkeygen.com/
```

### Крок 2: Встановлення залежностей (2 хв)

```bash
npm install
```

### Крок 3: Налаштування БД (1 хв)

```bash
# Генерація Prisma Client
npx prisma generate

# Запуск міграцій
npx prisma migrate dev

# Опціонально: відкрити Prisma Studio
npx prisma studio
```

### Крок 4: Запуск сервера (10 сек)

```bash
npm run dev
```

### Крок 5: Перевірка (10 сек)

Відкрийте в браузері або curl:

```bash
curl http://localhost:5000/health
```

Має повернути:

```json
{
  "status": "success",
  "message": "Monifly API is running",
  "timestamp": "2025-10-01T...",
  "environment": "development"
}
```

---

## 🧪 Тестування API

### Реєстрація користувача

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'
```

### Логін

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!@#"
  }'
```

### Отримання профілю (потрібен token)

```bash
# Замініть YOUR_TOKEN на token з логіну
curl http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📁 Структура Backend

```
backend/
├── src/
│   ├── controllers/      # 10 контролерів ✅
│   ├── routes/          # 11 роутів ✅
│   ├── validators/      # 10 валідаторів ✅
│   ├── middleware/      # 5 middleware ✅
│   ├── services/        # Сервіси (crypto price) ✅
│   ├── utils/          # JWT, Password, Logger, Response ✅
│   ├── database/       # Prisma connection ✅
│   └── server.ts       # Express app ✅
├── prisma/
│   └── schema.prisma   # Database schema ✅
└── package.json
```

---

## 🚀 Готово!

Backend запущено на `http://localhost:5000`

**API доступний за адресою:**

```
http://localhost:5000/api/v1
```

**Endpoints:**

- `/auth` - Аутентифікація
- `/users` - Користувачі
- `/wallets` - Гаманці
- `/transactions` - Транзакції
- `/budgets` - Бюджети ⭐ NEW
- `/goals` - Фінансові цілі
- `/debts` - Борги
- `/crypto` - Криптовалюта
- `/investments` - Інвестиції
- `/life-calendar` - Життєвий календар ⭐ NEW
- `/analytics` - Аналітика

---

## 📚 Документація

- 📘 `API_DOCS.md` - Повна документація API
- 📙 `API_TESTING.md` - Приклади тестування
- 📗 `DEPLOYMENT.md` - Деплой інструкції
- 🚀 `RENDER_DEPLOYMENT.md` - Підключення до Render
- 📊 `BACKEND_SUMMARY.md` - Підсумок створеного

**Успіхів! 🎉**
