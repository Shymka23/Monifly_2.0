# 🚀 Підключення Backend до Render

## Крок 1: Підготовка проекту

### 1.1 Додайте `.env.example` файл

Створіть файл `.env.example` в папці `backend/`:

```env
# Server
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Logging
LOG_LEVEL=info
```

### 1.2 Перевірте `package.json`

Переконайтесь що є команда для production:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "postinstall": "prisma generate"
  }
}
```

---

## Крок 2: Створення PostgreSQL бази даних на Render

### 2.1 Створення бази даних

1. Відкрийте https://dashboard.render.com
2. Натисніть **"New +"** → **"PostgreSQL"**
3. Заповніть:
   - **Name**: `monifly-db`
   - **Database**: `monifly`
   - **User**: `monifly_user`
   - **Region**: Оберіть найближчий (Frankfurt для Європи)
   - **Plan**: Free (або Starter $7/міс)
4. Натисніть **"Create Database"**

### 2.2 Отримайте DATABASE_URL

Після створення БД:

1. Відкрийте вашу базу даних
2. Прокрутіть до розділу **"Connections"**
3. Скопіюйте **"External Database URL"**
4. Виглядає приблизно так:

```
postgresql://monifly_user:password@dpg-xxxxx-a.frankfurt-postgres.render.com/monifly
```

---

## Крок 3: Створення Web Service на Render

### 3.1 Підключення Git репозиторію

1. Натисніть **"New +"** → **"Web Service"**
2. Підключіть GitHub/GitLab репозиторій
3. Оберіть ваш репозиторій `Monifly`

### 3.2 Налаштування Web Service

Заповніть форму:

**Basic:**

- **Name**: `monifly-backend`
- **Region**: Frankfurt (той самий що і БД)
- **Branch**: `main` (або ваша гілка)
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
- **Start Command**: `npm start`

**Advanced:**

- **Plan**: Free (або Starter $7/міс)
- **Auto-Deploy**: Yes

### 3.3 Додайте Environment Variables

В розділі **"Environment"** додайте:

| Key                      | Value                              |
| ------------------------ | ---------------------------------- |
| `NODE_ENV`               | `production`                       |
| `PORT`                   | `5000`                             |
| `API_VERSION`            | `v1`                               |
| `DATABASE_URL`           | `<скопійований URL з кроку 2.2>`   |
| `JWT_SECRET`             | `<генеруйте складний ключ>`        |
| `JWT_REFRESH_SECRET`     | `<генеруйте інший складний ключ>`  |
| `JWT_EXPIRES_IN`         | `15m`                              |
| `JWT_REFRESH_EXPIRES_IN` | `7d`                               |
| `CORS_ORIGIN`            | `https://your-frontend.vercel.app` |
| `LOG_LEVEL`              | `info`                             |

**💡 Як згенерувати секретні ключі:**

```bash
# В терміналі на Mac:
openssl rand -base64 32
```

---

## Крок 4: Створення `render.yaml` (опціонально)

Для автоматичного деплою створіть `render.yaml` в корені проекту:

```yaml
services:
  - type: web
    name: monifly-backend
    env: node
    region: frankfurt
    buildCommand: cd backend && npm install && npm run build && npx prisma generate && npx prisma migrate deploy
    startCommand: cd backend && npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: DATABASE_URL
        fromDatabase:
          name: monifly-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true
      - key: CORS_ORIGIN
        value: https://your-frontend.vercel.app

databases:
  - name: monifly-db
    databaseName: monifly
    user: monifly_user
    region: frankfurt
    plan: free
```

---

## Крок 5: Запуск міграцій

### 5.1 Автоматично при deploy

Render виконає міграції автоматично завдяки команді:

```bash
npx prisma migrate deploy
```

### 5.2 Вручну (якщо потрібно)

1. Відкрийте ваш Web Service на Render
2. Перейдіть в **"Shell"**
3. Виконайте:

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed # якщо є seed файл
```

---

## Крок 6: Перевірка деплою

### 6.1 Перевірте статус

1. Дочекайтеся завершення деплою (5-10 хвилин)
2. Статус має бути **"Live"** (зелений)

### 6.2 Перевірте API

Ваш API буде доступний за адресою:

```
https://monifly-backend.onrender.com
```

Перевірте health endpoint:

```bash
curl https://monifly-backend.onrender.com/health
```

Відповідь:

```json
{
  "status": "success",
  "message": "Monifly API is running",
  "timestamp": "2025-10-01T...",
  "environment": "production"
}
```

### 6.3 Тестування API

```bash
# Реєстрація
curl -X POST https://monifly-backend.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'

# Логін
curl -X POST https://monifly-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

---

## Крок 7: Підключення Frontend до Backend

### 7.1 Додайте ENV змінні у Vercel/Netlify

```env
NEXT_PUBLIC_API_URL=https://monifly-backend.onrender.com/api/v1
```

### 7.2 Створіть API клієнт

В frontend проекті створіть `src/lib/api.ts`:

```typescript
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export class ApiClient {
  private static getToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  private static async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  }

  static async get(endpoint: string) {
    return this.request(endpoint, { method: "GET" });
  }

  static async post(endpoint: string, body: any) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  static async put(endpoint: string, body: any) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  static async delete(endpoint: string) {
    return this.request(endpoint, { method: "DELETE" });
  }
}
```

---

## Крок 8: Моніторинг та Логи

### 8.1 Перегляд логів

1. Відкрийте Web Service на Render
2. Перейдіть на вкладку **"Logs"**
3. Переглядайте логи в реальному часі

### 8.2 Налаштування алертів

1. Перейдіть в **"Settings"**
2. Додайте **"Deploy Notifications"**
3. Вкажіть email для отримання сповіщень

---

## 🔧 Troubleshooting

### Помилка: "Build failed"

**Рішення:**

```bash
# Локально перевірте збірку
cd backend
npm install
npm run build
```

### Помилка: "Database connection failed"

**Рішення:**

1. Перевірте DATABASE_URL в environment variables
2. Переконайтесь що БД в тому ж регіоні
3. Перевірте що IP Render додано в whitelist БД

### Помилка: "Prisma migration failed"

**Рішення:**

1. Використовуйте `prisma migrate deploy` замість `migrate dev`
2. Переконайтесь що schema.prisma коректна
3. Запустіть міграції вручну через Shell

### Сервіс падає після деплою

**Рішення:**

1. Перевірте логи в розділі "Logs"
2. Переконайтесь що всі ENV змінні встановлені
3. Перевірте що PORT не захардкоджений

---

## 📊 Моніторинг Performance

### Метрики на Render:

- **CPU Usage** - має бути < 50%
- **Memory Usage** - має бути < 512MB на Free плані
- **Response Time** - < 200ms
- **Uptime** - 99%+

### Оптимізація для Free плану:

⚠️ **Важливо:** Free план Render "засинає" після 15 хвилин неактивності.

**Рішення:**

1. Використайте UptimeRobot для ping кожні 14 хвилин
2. Або оновіться до Starter плану ($7/міс)

---

## 🎯 Фінальний Checklist

- [ ] База даних створена на Render
- [ ] Web Service створений
- [ ] Всі ENV змінні додані
- [ ] Build успішний
- [ ] Міграції виконані
- [ ] Health endpoint працює
- [ ] API endpoints тестуються
- [ ] Frontend підключений до backend
- [ ] CORS налаштований правильно
- [ ] Логи моніторяться

---

## 🔗 Корисні посилання

- 📘 [Render Docs](https://render.com/docs)
- 📙 [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)
- 📗 [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 💰 Ціни Render

| Plan     | Ціна    | Specs                          |
| -------- | ------- | ------------------------------ |
| Free     | $0      | 512MB RAM, засинає після 15 хв |
| Starter  | $7/міс  | 512MB RAM, без засинання       |
| Standard | $25/міс | 2GB RAM, автоскейлінг          |

**PostgreSQL:**

- Free: 1GB storage, 97 годин/міс
- Starter: $7/міс, 10GB storage

**Рекомендація:** Starter план для production ($14/міс разом)

---

## 🆘 Підтримка

Якщо виникли проблеми:

1. Перевірте логи на Render
2. Перевірте DATABASE_URL
3. Перевірте чи всі ENV змінні встановлені
4. Напишіть в Render support (дуже швидко відповідають)

**Готово! Backend на Render буде працювати 24/7! 🎉**
