# Monifly API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

Всі захищені endpoints потребують JWT token в заголовку:

```
Authorization: Bearer <your_token>
```

---

## 📊 Budget Endpoints

### Get All Budgets

```http
GET /budgets
Query params:
  - period: string (daily|weekly|monthly|yearly)
```

### Get Budget Overview

```http
GET /budgets/overview
Query params:
  - period: string (default: monthly)
Response:
  - totalBudget: number
  - totalSpent: number
  - remaining: number
  - percentageUsed: number
  - budgets: Array<BudgetWithProgress>
```

### Get Single Budget

```http
GET /budgets/:id
```

### Create Budget Category

```http
POST /budgets
Body:
  {
    "name": "string (required, 2-100 chars)",
    "type": "income | expense (required)",
    "category": "string (required, 2-50 chars)",
    "limit": "number (optional)",
    "period": "daily | weekly | monthly | yearly",
    "color": "string (optional)",
    "icon": "string (optional)"
  }
```

### Update Budget Category

```http
PUT /budgets/:id
Body: (all fields optional)
  {
    "name": "string",
    "type": "income | expense",
    "category": "string",
    "limit": "number",
    "period": "string",
    "color": "string",
    "icon": "string",
    "spent": "number"
  }
```

### Delete Budget Category

```http
DELETE /budgets/:id
```

### Update Spent Amount

```http
PATCH /budgets/:id/spent
Body:
  {
    "amount": "number (required, >= 0)"
  }
```

### Reset Budget Period

```http
POST /budgets/reset-period
Body:
  {
    "period": "daily | weekly | monthly | yearly"
  }
```

---

## 📅 Life Calendar Endpoints

### Get All Calendar Entries

```http
GET /life-calendar
Query params:
  - startYear: number (optional)
  - endYear: number (optional)
```

### Get Calendar Overview

```http
GET /life-calendar/overview
Response:
  - totalYears: number
  - completedYears: number
  - totalMilestones: number
  - completedMilestones: number
  - progressPercentage: number
  - currentYear: number
  - entries: Array<YearSummary>
```

### Get Calendar Entry by Year

```http
GET /life-calendar/year/:year
```

### Create/Update Calendar Entry

```http
POST /life-calendar
Body:
  {
    "year": "number (required, 1900-2200)",
    "age": "number (optional, 0-150)",
    "income": "number (optional)",
    "expenses": "number (optional)",
    "savings": "number (optional)",
    "netWorth": "number (optional)",
    "events": "string[] (optional)",
    "notes": "string (optional, max 1000 chars)",
    "mood": "great | good | neutral | bad (optional)"
  }
```

### Delete Calendar Entry

```http
DELETE /life-calendar/year/:year
```

### Mark Year as Completed

```http
PATCH /life-calendar/year/:year/complete
```

---

## 🎯 Milestone Endpoints

### Get Milestones by Year

```http
GET /life-calendar/year/:year/milestones
```

### Add Milestone to Year

```http
POST /life-calendar/year/:year/milestones
Body:
  {
    "title": "string (required, 2-200 chars)",
    "description": "string (optional, max 1000 chars)",
    "type": "financial | personal | career | health | education (required)",
    "targetDate": "ISO date (required)",
    "targetAmount": "number (optional)",
    "currentAmount": "number (optional, default: 0)",
    "priority": "number (optional, 0-10, default: 0)"
  }
```

### Update Milestone

```http
PUT /life-calendar/milestones/:milestoneId
Body: (all fields optional)
  {
    "title": "string",
    "description": "string",
    "type": "financial | personal | career | health | education",
    "targetDate": "ISO date",
    "targetAmount": "number",
    "currentAmount": "number",
    "status": "pending | in_progress | completed | cancelled",
    "priority": "number (0-10)"
  }
```

### Delete Milestone

```http
DELETE /life-calendar/milestones/:milestoneId
```

---

## 👤 User Endpoints

### Get User Profile

```http
GET /users/profile
Response:
  {
    "id": "string",
    "email": "string",
    "name": "string",
    "avatar": "string | null",
    "currency": "string",
    "language": "string",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  }
```

### Update User Profile

```http
PUT /users/profile
Body: (all fields optional)
  {
    "name": "string (2-100 chars)",
    "avatar": "string (URI)",
    "currency": "string (3 chars, uppercase)",
    "language": "uk | ru | en | de | es | fr"
  }
```

### Get User Settings

```http
GET /users/settings
```

### Update User Settings

```http
PUT /users/settings
Body: (all fields optional)
  {
    "currentAge": "number (0-150)",
    "targetAge": "number (0-150)",
    "retirementAge": "number (0-150)",
    "browserNotifications": "boolean",
    "emailNotifications": "boolean",
    "notificationFrequency": "daily | weekly | monthly",
    "theme": "light | dark | system",
    "primaryCurrency": "string (3 chars, uppercase)"
  }
```

### Change Password

```http
POST /users/change-password
Body:
  {
    "currentPassword": "string (required, min 6 chars)",
    "newPassword": "string (required, 6-100 chars)"
  }
```

### Delete Account

```http
DELETE /users/account
Body:
  {
    "password": "string (required, min 6 chars)"
  }
```

### Get User Statistics

```http
GET /users/statistics
Response:
  {
    "walletsCount": "number",
    "transactionsCount": "number",
    "goalsCount": "number",
    "debtsCount": "number",
    "lifeCalendarYears": "number"
  }
```

---

## 📝 Response Format

### Success Response

```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [ ... ]
}
```

---

## ⚡ WebSocket Events

### Connection

```javascript
socket.on("connect", () => {
  socket.emit("join-room", userId);
});
```

### Real-time Updates

```javascript
// Budget updated
socket.on('budget:updated', (data) => { ... });

// Transaction created
socket.on('transaction:created', (data) => { ... });

// Goal progress updated
socket.on('goal:progress', (data) => { ... });
```

---

## 🔐 Error Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 400  | Bad Request - Invalid input             |
| 401  | Unauthorized - Invalid or missing token |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource not found          |
| 409  | Conflict - Duplicate resource           |
| 422  | Validation Error - Invalid data         |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error                   |

---

## 📌 Notes

1. Всі дати в форматі ISO 8601
2. Всі суми як числа з плаваючою точкою
3. Валюти в форматі ISO 4217 (3 символи, uppercase)
4. Rate limiting: 100 requests/15min на IP
5. Max request size: 10MB
