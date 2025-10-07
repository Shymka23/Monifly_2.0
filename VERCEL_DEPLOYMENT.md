# Деплой Monifly на Vercel

## Підготовка

1. Створіть акаунт на [Vercel](https://vercel.com)
2. Встановіть Vercel CLI:
   ```bash
   npm i -g vercel
   ```

## Налаштування проекту

1. Залогіньтесь у Vercel:

   ```bash
   vercel login
   ```

2. Ініціалізуйте проект:

   ```bash
   vercel init
   ```

3. Виберіть "Import Git Repository"

4. Налаштуйте Environment Variables:
   - `NEXT_PUBLIC_API_URL`: https://monifly-backend.onrender.com/api/v1
   - `NEXTAUTH_URL`: https://monifly.vercel.app (або ваш домен)
   - `NEXTAUTH_SECRET`: Згенеруйте секретний ключ (мінімум 32 символи)
   - `NEXT_PUBLIC_DEFAULT_LOGIN_PROVIDER`: credentials

## Деплой

1. Запустіть деплой:

   ```bash
   vercel --prod
   ```

2. Після успішного деплою, перейдіть в налаштування проекту на Vercel:
   - Domains: Налаштуйте свій домен (опціонально)
   - Environment Variables: Перевірте всі змінні
   - Git: Налаштуйте автоматичний деплой

## Перевірка

1. Відкрийте ваш сайт
2. Перевірте:
   - Реєстрацію
   - Логін
   - API запити
   - Всі основні функції

## Troubleshooting

Якщо виникли проблеми:

1. **404 помилки:**

   - Перевірте `next.config.mjs`
   - Перевірте роути в `app/`

2. **API помилки:**

   - Перевірте `NEXT_PUBLIC_API_URL`
   - Перевірте CORS на бекенді

3. **Помилки авторизації:**
   - Перевірте `NEXTAUTH_URL`
   - Перевірте `NEXTAUTH_SECRET`

## Моніторинг

1. Vercel Analytics:

   - Перейдіть в Analytics в дашборді
   - Налаштуйте Real User Monitoring

2. Логи:
   - Перейдіть в Logs в дашборді
   - Налаштуйте сповіщення

## Оновлення

1. Push зміни в Git:

   ```bash
   git push
   ```

2. Vercel автоматично задеплоїть зміни

## Корисні команди

```bash
# Локальний тест продакшн білду
vercel build

# Деплой на прев'ю
vercel

# Деплой на продакшн
vercel --prod

# Показати інформацію про деплої
vercel list

# Видалити деплой
vercel remove
```
