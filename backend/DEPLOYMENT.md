# Розгортання Monifly Backend

Повний посібник з розгортання backend на різних платформах.

## 📋 Передумови

- Node.js 18+
- PostgreSQL 14+
- npm або yarn
- Git

## 🚀 Локальне розгортання

### 1. Клонування репозиторію

```bash
git clone https://github.com/your-repo/monifly.git
cd monifly/backend
```

### 2. Встановлення залежностей

```bash
npm install
```

### 3. Налаштування змінних середовища

```bash
cp .env.example .env
```

Відредагуйте `.env`:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/monifly"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
```

### 4. Виконання міграцій

```bash
npm run migrate:prod
```

### 5. Збірка проєкту

```bash
npm run build
```

### 6. Запуск

```bash
npm start
```

## 🐳 Docker

### Dockerfile

Створіть `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: monifly
      POSTGRES_PASSWORD: password
      POSTGRES_DB: monifly
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://monifly:password@postgres:5432/monifly
      JWT_SECRET: your-secret-key
      JWT_REFRESH_SECRET: your-refresh-secret
    depends_on:
      - postgres
    command: sh -c "npx prisma migrate deploy && npm start"

volumes:
  postgres_data:
```

### Запуск з Docker

```bash
docker-compose up -d
```

## ☁️ Heroku

### 1. Встановіть Heroku CLI

```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

### 2. Увійдіть в Heroku

```bash
heroku login
```

### 3. Створіть додаток

```bash
heroku create monifly-api
```

### 4. Додайте PostgreSQL

```bash
heroku addons:create heroku-postgresql:hobby-dev
```

### 5. Налаштуйте змінні середовища

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set JWT_REFRESH_SECRET=$(openssl rand -base64 32)
```

### 6. Додайте Procfile

Створіть `Procfile`:

```
web: npm start
release: npx prisma migrate deploy
```

### 7. Deploy

```bash
git push heroku main
```

### 8. Відкрийте додаток

```bash
heroku open
```

## 🌐 Vercel

### 1. Встановіть Vercel CLI

```bash
npm i -g vercel
```

### 2. Увійдіть

```bash
vercel login
```

### 3. Створіть vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ]
}
```

### 4. Deploy

```bash
vercel --prod
```

### 5. Налаштуйте змінні

```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add JWT_REFRESH_SECRET
```

## 🚢 Railway

### 1. Підключіть GitHub

Увійдіть на [railway.app](https://railway.app) та підключіть ваш GitHub репозиторій.

### 2. Додайте PostgreSQL

У проєкті натисніть "New" → "Database" → "PostgreSQL"

### 3. Налаштуйте змінні

Додайте в Variables:

```
NODE_ENV=production
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

### 4. Deploy

Railway автоматично розгорне ваш додаток після push в GitHub.

## 🔧 DigitalOcean App Platform

### 1. Створіть додаток

Увійдіть в DigitalOcean → App Platform → Create App

### 2. Підключіть репозиторій

Виберіть GitHub репозиторій

### 3. Налаштуйте Build

- Build Command: `npm run build`
- Run Command: `npm start`

### 4. Додайте PostgreSQL

Add Component → Database → PostgreSQL

### 5. Налаштуйте змінні

```
NODE_ENV=production
DATABASE_URL=${db.DATABASE_URL}
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

### 6. Deploy

Натисніть "Create Resources"

## 🖥️ VPS (Ubuntu)

### 1. Підключіться до сервера

```bash
ssh root@your-server-ip
```

### 2. Встановіть Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Встановіть PostgreSQL

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 4. Налаштуйте PostgreSQL

```bash
sudo -u postgres psql
CREATE DATABASE monifly;
CREATE USER monifly WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE monifly TO monifly;
\q
```

### 5. Клонуйте репозиторій

```bash
cd /var/www
git clone https://github.com/your-repo/monifly.git
cd monifly/backend
```

### 6. Встановіть залежності

```bash
npm install
```

### 7. Налаштуйте PM2

```bash
sudo npm install -g pm2
pm2 start dist/server.js --name monifly-api
pm2 startup
pm2 save
```

### 8. Налаштуйте Nginx

```bash
sudo apt install nginx

sudo nano /etc/nginx/sites-available/monifly
```

```nginx
server {
    listen 80;
    server_name api.monifly.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/monifly /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. Налаштуйте SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.monifly.com
```

## 🔒 Безпека для Production

### 1. Оновіть залежності

```bash
npm audit fix
```

### 2. Використовуйте сильні паролі

Згенеруйте секретні ключі:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Налаштуйте CORS

```typescript
app.use(
  cors({
    origin: ["https://monifly.com", "https://app.monifly.com"],
    credentials: true,
  })
);
```

### 4. Увімкніть HTTPS

Завжди використовуйте HTTPS в production.

### 5. Налаштуйте Rate Limiting

Вже реалізовано в проєкті.

### 6. Моніторинг

Використовуйте сервіси моніторингу:

- Sentry для відстеження помилок
- LogDNA для логів
- UptimeRobot для перевірки доступності

## 📊 Моніторинг та логування

### PM2 Logs

```bash
pm2 logs monifly-api
```

### Winston Logs

Логи зберігаються в `logs/`:

- `combined.log` - всі логи
- `error.log` - тільки помилки

### Prometheus + Grafana

Додайте метрики для моніторингу:

```typescript
import client from "prom-client";

const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});
```

## 🔄 CI/CD

### GitHub Actions

Створіть `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run build
      - run: npm test
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "monifly-api"
          heroku_email: "your-email@example.com"
```

## 📝 Checklist перед Production

- [ ] Всі тести проходять
- [ ] Секретні ключі згенеровані
- [ ] База даних налаштована
- [ ] Міграції виконані
- [ ] CORS налаштований
- [ ] HTTPS увімкнено
- [ ] Rate limiting активний
- [ ] Логування працює
- [ ] Моніторинг налаштований
- [ ] Backup налаштований
- [ ] DNS налаштований

---

**Успіхів у розгортанні! 🚀**
