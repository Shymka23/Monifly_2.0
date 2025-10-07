# 🚀 Повний гайд з деплою Monifly

## Огляд

Monifly складається з двох частин:

- **Frontend**: Next.js додаток (deploy на Vercel)
- **Backend**: Express.js API (deploy на Render)

---

## 📦 Частина 1: Backend на Render

### 1. Створіть PostgreSQL базу даних

1. Відкрийте https://dashboard.render.com
2. Натисніть **New +** → **PostgreSQL**
3. Налаштування:
   - Name: `monifly-db`
   - Database: `monifly`
   - User: `monifly_user`
   - Region: `Frankfurt`
   - Plan: **Free** або **Starter ($7/міс)**
4. Натисніть **Create Database**
5. **Збережіть "External Database URL"** - він знадобиться!

### 2. Створіть Web Service для Backend

1. Натисніть **New +** → **Web Service**
2. Підключіть GitHub репозиторій
3. Налаштування:
   - **Name**: `monifly-backend`
   - **Region**: `Frankfurt` (той самий що БД!)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build && npx prisma generate && npx prisma migrate deploy
     ```
   - **Start Command**:
     ```bash
     npm start
     ```

### 3. Додайте Environment Variables

| Key                      | Value                             | Примітка                               |
| ------------------------ | --------------------------------- | -------------------------------------- |
| `NODE_ENV`               | `production`                      |                                        |
| `PORT`                   | `5000`                            |                                        |
| `API_VERSION`            | `v1`                              |                                        |
| `DATABASE_URL`           | `<URL з кроку 1>`                 | Скопіюйте з БД                         |
| `JWT_SECRET`             | `<випадковий ключ>`               | Використайте `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET`     | `<інший ключ>`                    | Інший ключ!                            |
| `JWT_EXPIRES_IN`         | `15m`                             |                                        |
| `JWT_REFRESH_EXPIRES_IN` | `7d`                              |                                        |
| `CORS_ORIGIN`            | `https://ваш-frontend.vercel.app` | Додасте пізніше                        |
| `LOG_LEVEL`              | `info`                            |                                        |

### 4. Deploy!

1. Натисніть **Create Web Service**
2. Дочекайтеся завершення (5-10 хвилин)
3. Статус має стати **"Live"** 🟢
4. Ваш backend URL: `https://monifly-backend.onrender.com`

### 5. Перевірте що працює

```bash
curl https://monifly-backend.onrender.com/health
```

Має повернути:

```json
{
  "status": "success",
  "message": "Monifly API is running"
}
```

---

## 🌐 Частина 2: Frontend на Vercel

### 1. Підготовка проекту

В корені проекту (НЕ в backend) створіть `.env.production`:

```env
NEXT_PUBLIC_API_URL=https://monifly-backend.onrender.com/api/v1
```

### 2. Deploy на Vercel

**Варіант A: Через веб-інтерфейс**

1. Відкрийте https://vercel.com
2. Натисніть **New Project**
3. Import Git Repository
4. Налаштування:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (корінь проекту)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

**Варіант B: Через CLI**

```bash
# Встановіть Vercel CLI
npm i -g vercel

# З кореня проекту
cd "/Users/mac/Desktop/practica-project/проект Monifly/Monifly_cursor"
vercel

# Слідуйте інструкціям:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? monifly
# - Directory? ./
# - Override settings? No
```

### 3. Додайте Environment Variables

В Vercel Dashboard → Project → Settings → Environment Variables:

| Key                   | Value                                         |
| --------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | `https://monifly-backend.onrender.com/api/v1` |
| `NEXTAUTH_URL`        | `https://your-app.vercel.app`                 |
| `NEXTAUTH_SECRET`     | `<випадковий ключ>`                           |

### 4. Оновіть CORS на Backend

Поверніться на Render:

1. Відкрийте `monifly-backend`
2. Environment → `CORS_ORIGIN`
3. Змініть на: `https://ваш-frontend.vercel.app`
4. Натисніть **Save Changes**
5. Backend автоматично передеплоїться

### 5. Redeploy Frontend

```bash
vercel --prod
```

---

## ✅ Перевірка що все працює

### Backend (Render)

```bash
✅ https://monifly-backend.onrender.com/health
✅ https://monifly-backend.onrender.com/api/v1/auth/login (POST)
```

### Frontend (Vercel)

```bash
✅ https://ваш-домен.vercel.app
✅ Реєстрація працює
✅ Логін працює
✅ Dashboard показує дані
```

---

## 🔧 Налаштування Custom Domain (опціонально)

### На Vercel:

1. Settings → Domains
2. Додайте ваш домен
3. Налаштуйте DNS записи

### На Render:

1. Settings → Custom Domain
2. Додайте subdomain (api.yourdomain.com)
3. Оновіть `NEXT_PUBLIC_API_URL` на Vercel

---

## 💰 Вартість

### Безкоштовний варіант (для тестування):

- **Render Free**: $0 (засинає після 15 хв)
- **Vercel Hobby**: $0
- **PostgreSQL Free**: $0 (1GB, 97 годин/міс)
- **Всього: $0/міс** ✅

### Рекомендований варіант (для production):

- **Render Starter**: $7/міс (backend)
- **Render PostgreSQL**: $7/міс (БД)
- **Vercel Pro** (опц): $20/міс
- **Всього: $14-34/міс**

---

## 🆘 Troubleshooting

### Backend не запускається

1. Перевірте логи на Render
2. Перевірте DATABASE_URL
3. Перевірте чи запустились міграції

### Frontend не підключається до Backend

1. Перевірте NEXT_PUBLIC_API_URL
2. Перевірте CORS_ORIGIN на backend
3. Перевірте чи backend "Live"

### База даних не підключається

1. Перевірте DATABASE_URL
2. Перевірте що БД в тому ж регіоні
3. Запустіть міграції вручну через Shell

---

## 📊 Моніторинг

### Render Dashboard:

- CPU/Memory usage
- Response times
- Error logs
- Uptime

### Vercel Analytics:

- Page views
- Performance metrics
- Error tracking

---

## 🎯 Наступні кроки

1. ✅ Додайте custom domain
2. ✅ Налаштуйте CI/CD
3. ✅ Додайте моніторинг (Sentry)
4. ✅ Налаштуйте backups БД
5. ✅ Додайте CDN для static файлів

**Готово! Ваш додаток в production! 🚀**
