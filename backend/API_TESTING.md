# Тестування API - Monifly Backend

Повний посібник з тестування всіх API endpoints.

## 🚀 Швидкий старт

### 1. Запустіть сервер

```bash
cd backend
npm run dev
```

Сервер запуститься на `http://localhost:5000`

### 2. Перевірте здоров'я

```bash
curl http://localhost:5000/health
```

## 🔐 Аутентифікація

### Реєстрація

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@monifly.com",
    "password": "Test123!@#",
    "name": "Тестовий Користувач",
    "currency": "USD",
    "language": "uk"
  }'
```

**Відповідь:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "test@monifly.com",
      "name": "Тестовий Користувач"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Вхід

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@monifly.com",
    "password": "Test123!@#"
  }'
```

**Збережіть accessToken для подальших запитів!**

### Отримання профілю

```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Оновлення токена

```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Вихід

```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Зміна пароля

```bash
curl -X PUT http://localhost:5000/api/v1/auth/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Test123!@#",
    "newPassword": "NewTest123!@#"
  }'
```

## 💰 Гаманці

### Отримати всі гаманці

```bash
curl -X GET http://localhost:5000/api/v1/wallets \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Отримати один гаманець

```bash
curl -X GET http://localhost:5000/api/v1/wallets/WALLET_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Створити гаманець

```bash
curl -X POST http://localhost:5000/api/v1/wallets \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Мій гаманець",
    "type": "cash",
    "balance": 1000,
    "currency": "USD",
    "color": "#4CAF50",
    "icon": "💰"
  }'
```

**Типи гаманців:** `cash`, `bank`, `card`, `crypto`, `investment`

### Оновити гаманець

```bash
curl -X PUT http://localhost:5000/api/v1/wallets/WALLET_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Оновлений гаманець",
    "color": "#FF5722"
  }'
```

### Видалити гаманець

```bash
curl -X DELETE http://localhost:5000/api/v1/wallets/WALLET_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Отримати баланс гаманця

```bash
curl -X GET http://localhost:5000/api/v1/wallets/WALLET_ID/balance \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Отримати загальний баланс

```bash
curl -X GET http://localhost:5000/api/v1/wallets/balance/total \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 💸 Транзакції

### Отримати всі транзакції

```bash
# Базовий запит
curl -X GET http://localhost:5000/api/v1/transactions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# З фільтрами
curl -X GET "http://localhost:5000/api/v1/transactions?type=expense&category=food&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Параметри фільтрації:**

- `page` - номер сторінки (default: 1)
- `limit` - кількість на сторінці (default: 20)
- `type` - тип транзакції: `income`, `expense`, `transfer`
- `category` - категорія
- `walletId` - ID гаманця
- `startDate` - дата початку (ISO 8601)
- `endDate` - дата кінця (ISO 8601)
- `minAmount` - мінімальна сума
- `maxAmount` - максимальна сума

### Створити транзакцію

```bash
curl -X POST http://localhost:5000/api/v1/transactions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": "WALLET_ID",
    "type": "expense",
    "category": "food",
    "amount": 50.99,
    "currency": "USD",
    "description": "Обід в ресторані",
    "date": "2024-01-15T12:00:00Z",
    "tags": ["ресторан", "обід"],
    "location": "Київ"
  }'
```

**Типи транзакцій:** `income`, `expense`, `transfer`

**Категорії:**

- Доходи: `salary`, `freelance`, `investment`, `gift`, `other`
- Витрати: `food`, `transport`, `shopping`, `entertainment`, `health`, `education`, `bills`, `travel`, `other`

### Оновити транзакцію

```bash
curl -X PUT http://localhost:5000/api/v1/transactions/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 60.00,
    "description": "Оновлений опис"
  }'
```

### Видалити транзакцію

```bash
curl -X DELETE http://localhost:5000/api/v1/transactions/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Отримати статистику транзакцій

```bash
# За поточний місяць
curl -X GET "http://localhost:5000/api/v1/transactions/stats?period=month" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# За поточний рік
curl -X GET "http://localhost:5000/api/v1/transactions/stats?period=year" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🎯 Фінансові цілі

### Отримати всі цілі

```bash
# Всі цілі
curl -X GET http://localhost:5000/api/v1/goals \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Тільки активні
curl -X GET "http://localhost:5000/api/v1/goals?status=active" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Створити ціль

```bash
curl -X POST http://localhost:5000/api/v1/goals \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Накопичити на відпустку",
    "description": "Відпустка в Європі",
    "type": "saving",
    "targetAmount": 5000,
    "currentAmount": 1000,
    "currency": "USD",
    "targetDate": "2024-12-31T00:00:00Z",
    "monthlyContribution": 500,
    "priority": 5,
    "category": "travel",
    "reminderEnabled": true
  }'
```

**Типи цілей:** `saving`, `investment`, `purchase`, `debt_payoff`

### Додати внесок до цілі

```bash
curl -X POST http://localhost:5000/api/v1/goals/GOAL_ID/contribute \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 200
  }'
```

### Оновити ціль

```bash
curl -X PUT http://localhost:5000/api/v1/goals/GOAL_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentAmount": 1500,
    "status": "active"
  }'
```

### Видалити ціль

```bash
curl -X DELETE http://localhost:5000/api/v1/goals/GOAL_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Отримати статистику цілей

```bash
curl -X GET http://localhost:5000/api/v1/goals/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 💳 Борги

### Отримати всі борги

```bash
curl -X GET http://localhost:5000/api/v1/debts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Створити борг

```bash
curl -X POST http://localhost:5000/api/v1/debts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "loan",
    "title": "Кредит на автомобіль",
    "initialAmount": 10000,
    "currency": "USD",
    "interestRate": 5.5,
    "startDate": "2024-01-01T00:00:00Z",
    "dueDate": "2026-01-01T00:00:00Z",
    "description": "Автокредит"
  }'
```

**Типи боргів:** `loan`, `credit`, `mortgage`, `personal`

### Додати платіж по боргу

```bash
curl -X POST http://localhost:5000/api/v1/debts/DEBT_ID/payments \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "currency": "USD",
    "date": "2024-02-01T00:00:00Z",
    "description": "Щомісячний платіж"
  }'
```

### Отримати історію платежів

```bash
curl -X GET http://localhost:5000/api/v1/debts/DEBT_ID/payments \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Оновити борг

```bash
curl -X PUT http://localhost:5000/api/v1/debts/DEBT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "nextDueDate": "2024-03-01T00:00:00Z"
  }'
```

### Видалити борг

```bash
curl -X DELETE http://localhost:5000/api/v1/debts/DEBT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Отримати статистику боргів

```bash
curl -X GET http://localhost:5000/api/v1/debts/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🧪 Тестування з Postman

### 1. Імпортуйте колекцію

Створіть нову колекцію в Postman з такими змінними:

- `base_url`: `http://localhost:5000/api/v1`
- `access_token`: (буде заповнено після логіну)

### 2. Автоматизація токена

Додайте в Tests для логіну:

```javascript
pm.test("Save access token", function () {
  var jsonData = pm.response.json();
  pm.collectionVariables.set("access_token", jsonData.data.accessToken);
});
```

### 3. Authorization

Для всіх захищених endpoints додайте Header:

```
Authorization: Bearer {{access_token}}
```

## 📊 Коди відповідей

- `200` - OK (успішний запит)
- `201` - Created (ресурс створено)
- `400` - Bad Request (помилка валідації)
- `401` - Unauthorized (не авторизовано)
- `403` - Forbidden (доступ заборонено)
- `404` - Not Found (ресурс не знайдено)
- `429` - Too Many Requests (перевищено ліміт запитів)
- `500` - Internal Server Error (внутрішня помилка сервера)

## 🎯 WebSocket

Підключення до WebSocket для real-time оновлень:

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: "YOUR_ACCESS_TOKEN",
  },
});

// Join user room
socket.emit("join-room", userId);

// Listen for events
socket.on("transaction:created", data => {
  console.log("New transaction:", data);
});

socket.on("transaction:updated", data => {
  console.log("Transaction updated:", data);
});

socket.on("transaction:deleted", data => {
  console.log("Transaction deleted:", data);
});
```

## 🔍 Поради по тестуванню

1. **Спочатку зареєструйтесь** - отримайте токен
2. **Збережіть токен** - використовуйте у всіх запитах
3. **Створіть гаманець** - потрібен для транзакцій
4. **Тестуйте крок за кроком** - від простих до складних запитів
5. **Перевіряйте валідацію** - надсилайте невалідні дані
6. **Тестуйте помилки** - 404, 401, 400 коди

## 📝 Приклад повного workflow

```bash
# 1. Реєстрація
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Test123!@#","name":"Test User"}'

# 2. Створення гаманця
curl -X POST http://localhost:5000/api/v1/wallets \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Main Wallet","type":"cash","balance":1000}'

# 3. Додавання транзакції
curl -X POST http://localhost:5000/api/v1/transactions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"walletId":"ID","type":"expense","category":"food","amount":50}'

# 4. Створення цілі
curl -X POST http://localhost:5000/api/v1/goals \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Save 10k","type":"saving","targetAmount":10000,"targetDate":"2024-12-31"}'

# 5. Перевірка статистики
curl -X GET http://localhost:5000/api/v1/transactions/stats \
  -H "Authorization: Bearer TOKEN"
```

---

**Успіхів у тестуванні! 🚀**
