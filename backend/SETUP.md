# Інструкція з налаштування Backend

## 📋 Передумови

Перед початком переконайтеся, що у вас встановлено:

- **Node.js** (v18 або новіше) - [Завантажити](https://nodejs.org/)
- **PostgreSQL** (v14 або новіше) - [Завантажити](https://www.postgresql.org/download/)
- **npm** або **yarn**

## 🚀 Крок 1: Встановлення PostgreSQL

### macOS (через Homebrew)

```bash
brew install postgresql@14
brew services start postgresql@14
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows

Завантажте інсталятор з [офіційного сайту](https://www.postgresql.org/download/windows/)

## 🗄 Крок 2: Створення бази даних

```bash
# Увійдіть в PostgreSQL
psql postgres

# Створіть базу даних
CREATE DATABASE monifly;

# Створіть користувача (опціонально)
CREATE USER monifly_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE monifly TO monifly_user;

# Вийдіть
\q
```

## 📦 Крок 3: Встановлення залежностей

```bash
cd backend
npm install
```

## ⚙️ Крок 4: Налаштування змінних середовища

Створіть файл `.env` у директорії `backend/`:

```bash
cp .env.example .env
```

Відредагуйте `.env` та вкажіть свої налаштування:

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database (замініть на свої дані)
DATABASE_URL="postgresql://postgres:password@localhost:5432/monifly?schema=public"

# JWT (згенеруйте свої секретні ключі)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Як згенерувати секретні ключі:

```bash
# В терміналі виконайте:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🔧 Крок 5: Запуск міграцій

```bash
npm run migrate
```

Ця команда створить всі необхідні таблиці в базі даних.

## 🎉 Крок 6: Запуск сервера

### Development режим (з автоматичним перезапуском)

```bash
npm run dev
```

### Production режим

```bash
npm run build
npm start
```

Сервер запуститься на `http://localhost:5000`

## ✅ Крок 7: Перевірка

Відкрийте браузер або Postman і перейдіть на:

```
http://localhost:5000/health
```

Ви повинні побачити:

```json
{
  "status": "success",
  "message": "Monifly API is running",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "development"
}
```

## 🧪 Тестування API

### Реєстрація користувача

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User",
    "currency": "USD",
    "language": "uk"
  }'
```

### Вхід в систему

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

Ви отримаєте `accessToken` та `refreshToken`.

### Отримання профілю (потрібна автентифікація)

```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔍 Prisma Studio (GUI для бази даних)

Щоб переглянути дані в базі через зручний інтерфейс:

```bash
npm run db:studio
```

Відкриється браузер з Prisma Studio на `http://localhost:5555`

## 🐛 Вирішення проблем

### Проблема: Не можу підключитися до PostgreSQL

**Рішення:**

```bash
# Перевірте, чи запущений PostgreSQL
sudo systemctl status postgresql  # Linux
brew services list                # macOS

# Перезапустіть PostgreSQL
sudo systemctl restart postgresql  # Linux
brew services restart postgresql   # macOS
```

### Проблема: Помилка міграції Prisma

**Рішення:**

```bash
# Видаліть папку міграцій та згенеруйте заново
rm -rf prisma/migrations
npm run migrate
```

### Проблема: Port 5000 вже використовується

**Рішення:**
Змініть `PORT` у файлі `.env` на інший (наприклад, 5001)

### Проблема: Cannot find module

**Рішення:**

```bash
# Видаліть node_modules та встановіть заново
rm -rf node_modules package-lock.json
npm install
```

## 📚 Корисні команди

```bash
# Переглянути всі міграції
npx prisma migrate status

# Створити нову міграцію
npx prisma migrate dev --name migration_name

# Reset бази даних (видалить всі дані!)
npx prisma migrate reset

# Згенерувати Prisma Client
npx prisma generate

# Форматувати Prisma схему
npx prisma format
```

## 🔐 Безпека

### Production налаштування:

1. **Змініть всі секретні ключі** на сильні випадкові значення
2. **Використовуйте HTTPS** замість HTTP
3. **Налаштуйте CORS** тільки для дозволених доменів
4. **Додайте rate limiting** (вже є в коді)
5. **Використовуйте environment variables** для всіх чутливих даних
6. **Увімкніть логування** та моніторинг

## 📖 Наступні кроки

1. Ознайомтеся з [API документацією](README.md)
2. Подивіться [схему бази даних](prisma/schema.prisma)
3. Вивчіть [структуру проєкту](README.md#-структура-проєкту)
4. Реалізуйте відсутні контролери (TODO в routes)

## 💡 Поради

- Використовуйте **Postman** або **Insomnia** для тестування API
- Встановіть **TablePlus** або **pgAdmin** для роботи з базою даних
- Використовуйте **VS Code** з розширенням **Prisma** для підсвітки синтаксису
- Читайте логи у папці `logs/` при виникненні помилок

## 🆘 Підтримка

Якщо у вас виникли проблеми:

1. Перевірте логи у папці `logs/`
2. Перегляньте консоль сервера
3. Переконайтеся, що всі залежності встановлені
4. Перевірте підключення до бази даних
5. Подивіться документацію [Prisma](https://www.prisma.io/docs) та [Express](https://expressjs.com/)

---

**Успіхів у розробці! 🚀**
