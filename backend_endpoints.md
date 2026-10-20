# Backend API Endpoints Specification

This document details all RESTful API endpoints for the **Mobile-First Personal Finance Platform**. All requests and responses communicate via JSON (`Content-Type: application/json`). Data is persisted in `data/db.json` via atomic operations.

---

## 1. Summary of Endpoint Groups

| Group | Base Path | Description |
| :--- | :--- | :--- |
| **Wallet** | `/api/wallet` | Query balance, deposit income, and configure base currency |
| **Transactions** | `/api/transactions` | Full CRUD, refunds/returns, and undo/deletion |
| **Quick Actions** | `/api/quick-actions` | 1-tap logging for Breakfast, Lunch, Dinner, and Transport |
| **Daily Routines** | `/api/routines` | Manage recurring habits and process daily Yes/No check-in prompts |
| **What-If Simulator** | `/api/simulator` | Calculate projected monthly and yearly habit savings |
| **Analytics & Reports** | `/api/analytics` | Period summaries and category breakdowns (Day, Week, Month, Custom) |
| **Currency** | `/api/currency` | Fetch live exchange rates and convert amounts |
| **System & Backups** | `/api/system` | Export and import database snapshots |

---

## 2. Wallet & Balance APIs

### 2.1 Get Current Wallet Overview
- **Endpoint**: `GET /api/wallet`
- **Description**: Returns current balance in the base currency, along with converted approximations in user-favorite currencies (EUR, GBP, JPY).
- **Query Parameters**:
  - `targetCurrencies` *(optional, string)*: Comma-separated currency codes (e.g. `EUR,GBP,JPY,DZD`). Default: `EUR,GBP`.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "balance": 3840.50,
    "baseCurrency": "USD",
    "updatedAt": "2026-10-20T20:10:00.000Z",
    "convertedBalances": {
      "EUR": 3552.46,
      "GBP": 3014.79,
      "JPY": 582603.85
    }
  }
}
```

---

### 2.2 Add Funds / Deposit Income
- **Endpoint**: `POST /api/wallet/deposit`
- **Description**: Increments the wallet balance with salary, cash deposits, or transfers.
- **Request Body**:
```json
{
  "amount": 2500.00,
  "title": "Monthly Salary Deposit",
  "category": "Income",
  "date": "2026-10-20T10:00:00.000Z",
  "notes": "Direct bank deposit"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Funds deposited successfully",
  "data": {
    "newBalance": 6340.50,
    "transactionId": "tx_salary_1020"
  }
}
```

---

### 2.3 Update Base Currency
- **Endpoint**: `PATCH /api/wallet/base-currency`
- **Description**: Changes the base currency of the wallet. Existing balance will be converted using current exchange rates.
- **Request Body**:
```json
{
  "newBaseCurrency": "EUR"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Base currency updated to EUR",
  "data": {
    "previousBalance": 3840.50,
    "previousCurrency": "USD",
    "newBalance": 3552.46,
    "newBaseCurrency": "EUR",
    "rateApplied": 0.925
  }
}
```

---

## 3. Transactions & Ledger APIs

### 3.1 List Transactions (Filtered & Paginated)
- **Endpoint**: `GET /api/transactions`
- **Query Parameters**:
  - `period` *(optional, string)*: `today` | `this_week` | `this_month` | `custom`.
  - `startDate` *(optional, ISO string)*: e.g. `2026-10-01`.
  - `endDate` *(optional, ISO string)*: e.g. `2026-10-20`.
  - `categoryId` *(optional, string)*: Filter by specific category.
  - `type` *(optional, string)*: `EXPENSE` | `INCOME` | `REFUND`.
  - `page` *(optional, integer)*: Default `1`.
  - `limit` *(optional, integer)*: Default `20`.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "totalCount": 42,
    "page": 1,
    "limit": 20,
    "transactions": [
      {
        "id": "tx_pc_001",
        "title": "Custom Gaming PC Build",
        "amount": 1250.00,
        "type": "EXPENSE",
        "categoryId": "cat_tech",
        "categoryName": "Electronics & Tech",
        "isQuickAction": false,
        "isRoutine": false,
        "isRefunded": false,
        "date": "2026-10-18T14:22:00.000Z",
        "notes": "Workstation upgrade"
      },
      {
        "id": "tx_lunch_002",
        "title": "Quick Lunch - Burrito Bowl",
        "amount": 14.50,
        "type": "EXPENSE",
        "categoryId": "cat_lunch",
        "categoryName": "Lunch",
        "isQuickAction": true,
        "isRoutine": false,
        "isRefunded": false,
        "date": "2026-10-20T12:30:00.000Z"
      }
    ]
  }
}
```

---

### 3.2 Add Manual Expense
- **Endpoint**: `POST /api/transactions`
- **Description**: Records a new expense (e.g. buying a PC) and automatically cuts the amount from `wallet.balance`.
- **Request Body**:
```json
{
  "title": "Gaming PC Build",
  "amount": 1250.00,
  "type": "EXPENSE",
  "categoryId": "cat_tech",
  "date": "2026-10-20T15:30:00.000Z",
  "notes": "Bought from MicroCenter"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Expense logged and balance deducted",
  "data": {
    "transaction": {
      "id": "tx_pc_1020",
      "title": "Gaming PC Build",
      "amount": 1250.00,
      "type": "EXPENSE",
      "categoryId": "cat_tech",
      "isRefunded": false,
      "date": "2026-10-20T15:30:00.000Z"
    },
    "updatedBalance": 2590.50
  }
}
```

---

### 3.3 Delete / Undo Mistake
- **Endpoint**: `DELETE /api/transactions/:id`
- **Description**: Deletes an accidental entry and credits the expense amount back to the wallet balance.
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Transaction deleted. Balance restored.",
  "data": {
    "deletedTransactionId": "tx_pc_1020",
    "amountRestored": 1250.00,
    "newBalance": 3840.50
  }
}
```

---

### 3.4 Return / Refund Item
- **Endpoint**: `POST /api/transactions/:id/refund`
- **Description**: Marks an existing purchase as returned/refunded. Adds the money back to the wallet balance and logs a linked refund event.
- **Request Body** *(optional)*:
```json
{
  "reason": "Returned graphics card to store"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Item marked as refunded. Balance credited.",
  "data": {
    "originalTransaction": {
      "id": "tx_pc_1020",
      "isRefunded": true,
      "refundedAt": "2026-10-20T18:00:00.000Z"
    },
    "refundTransaction": {
      "id": "tx_refund_994",
      "title": "Refund: Gaming PC Build",
      "amount": 1250.00,
      "type": "REFUND",
      "date": "2026-10-20T18:00:00.000Z"
    },
    "newBalance": 3840.50
  }
}
```

---

## 4. Quick Actions APIs (The 4 Categories)

### 4.1 Fetch Quick Actions Presets
- **Endpoint**: `GET /api/quick-actions`
- **Description**: Returns metadata and recent average costs for the 4 quick categories: Breakfast, Lunch, Dinner, Transport.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    { "id": "cat_breakfast", "name": "Breakfast", "icon": "Croissant", "defaultAmount": 7.50, "recentAverage": 8.20 },
    { "id": "cat_lunch", "name": "Lunch", "icon": "Salad", "defaultAmount": 14.00, "recentAverage": 15.10 },
    { "id": "cat_dinner", "name": "Dinner", "icon": "Utensils", "defaultAmount": 22.00, "recentAverage": 24.50 },
    { "id": "cat_transport", "name": "Transport", "icon": "Car", "defaultAmount": 4.50, "recentAverage": 5.00 }
  ]
}
```

---

### 4.2 1-Tap Quick Action Log
- **Endpoint**: `POST /api/quick-actions/log`
- **Description**: Submits a fast expense for one of the 4 quick categories with minimal payload.
- **Request Body**:
```json
{
  "categoryId": "cat_lunch",
  "amount": 16.50,
  "notes": "Salmon bowl"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Quick lunch logged",
  "data": {
    "transactionId": "tx_quick_lunch_1020",
    "amount": 16.50,
    "newBalance": 3824.00
  }
}
```

---

## 5. Daily Routines & Daily Check-In APIs

### 5.1 List All Routines
- **Endpoint**: `GET /api/routines`
- **Description**: Retrieves configured habits (e.g. daily cigarettes, gym, daily latte).
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "rt_cigg_001",
      "title": "Packet of Cigarettes",
      "cost": 8.00,
      "currency": "USD",
      "frequency": "DAILY",
      "reminderTime": "20:00",
      "isActive": true,
      "stats": {
        "currentStreakSkipped": 4,
        "totalSavedThisMonth": 32.00,
        "totalSpentThisMonth": 24.00
      }
    }
  ]
}
```

---

### 5.2 Create New Daily Routine
- **Endpoint**: `POST /api/routines`
- **Request Body**:
```json
{
  "title": "Packet of Cigarettes",
  "cost": 8.00,
  "categoryId": "cat_habits",
  "frequency": "DAILY",
  "reminderTime": "20:00"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Routine created successfully",
  "data": {
    "id": "rt_cigg_001",
    "title": "Packet of Cigarettes",
    "cost": 8.00,
    "reminderTime": "20:00"
  }
}
```

---

### 5.3 Get Pending Daily Reminders
- **Endpoint**: `GET /api/routines/pending-today`
- **Description**: Checks whether routines have been answered today. If not, the frontend displays the prompt banner.
- **Response `200 OK`**:
```json
{
  "success": true,
  "date": "2026-10-20",
  "pendingCount": 1,
  "routines": [
    {
      "id": "rt_cigg_001",
      "title": "Packet of Cigarettes",
      "cost": 8.00,
      "promptMessage": "Did you buy a packet of cigarettes today for $8.00?"
    }
  ]
}
```

---

### 5.4 Routine Check-in (Quick Yes / No)
- **Endpoint**: `POST /api/routines/:id/checkin`
- **Description**: Submits the daily response.
  - If `CONFIRMED` (Yes): Automatically deducts cost from wallet and logs expense.
  - If `SKIPPED` (No): Marks money as saved, increments streak, and leaves wallet untouched.
- **Request Body**:
```json
{
  "action": "SKIPPED", // "CONFIRMED" | "SKIPPED"
  "date": "2026-10-20"
}
```
- **Response `200 OK` (when SKIPPED)**:
```json
{
  "success": true,
  "action": "SKIPPED",
  "message": "Awesome! You skipped this routine today and saved $8.00!",
  "data": {
    "savedToday": 8.00,
    "cleanStreakDays": 5,
    "totalMonthSavings": 40.00,
    "balanceUnchanged": 3840.50
  }
}
```
- **Response `200 OK` (when CONFIRMED)**:
```json
{
  "success": true,
  "action": "CONFIRMED",
  "message": "Expense logged for daily routine",
  "data": {
    "transactionId": "tx_rt_cigg_1020",
    "amountDeducted": 8.00,
    "newBalance": 3832.50
  }
}
```

---

## 6. What-If Habit & Savings Simulator APIs

### 6.1 Habit Savings Potential
- **Endpoint**: `GET /api/simulator/routines`
- **Description**: Calculates projected cumulative savings if active routines are dropped.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "routines": [
      {
        "routineId": "rt_cigg_001",
        "title": "Packet of Cigarettes",
        "dailyCost": 8.00,
        "projections": {
          "oneMonth": 240.00,
          "threeMonths": 720.00,
          "sixMonths": 1440.00,
          "oneYear": 2920.00,
          "fiveYearInvestedAt7Percent": 17352.84
        },
        "purchasingPowerEquivalents": [
          "1 Month: 1x Sony WH-1000XM5 Headphones ($240)",
          "6 Months: 1x High-End Gaming PC ($1,440)",
          "1 Year: 1x M3 Max MacBook Pro ($2,920)"
        ]
      }
    ]
  }
}
```

---

### 6.2 Custom Simulation Calculator
- **Endpoint**: `POST /api/simulator/calculate`
- **Description**: Runs an on-the-fly What-If simulation with custom inputs.
- **Request Body**:
```json
{
  "dailyExpenseAmount": 12.50,
  "durationMonths": 12,
  "annualInterestRate": 8.0
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "dailyAmount": 12.50,
    "monthlyExpense": 375.00,
    "totalCashSaved": 4562.50,
    "totalInvestedReturn": 4761.22,
    "interestEarned": 198.72
  }
}
```

---

## 7. Analytics & Reports APIs

### 7.1 Period Summary
- **Endpoint**: `GET /api/analytics/summary`
- **Query Parameters**:
  - `period`: `today` | `this_week` | `this_month` | `custom`
  - `startDate`, `endDate` (when period is `custom`)
- **Response `200 OK`**:
```json
{
  "success": true,
  "period": "this_month",
  "data": {
    "totalSpent": 1845.25,
    "totalIncome": 4000.00,
    "netSavings": 2154.75,
    "dailyAverage": 92.26,
    "routineExpensesTotal": 168.00,
    "discretionaryExpensesTotal": 1677.25
  }
}
```

---

### 7.2 The "Big 4" Quick Categories Breakdown
- **Endpoint**: `GET /api/analytics/quick-four`
- **Query Parameters**:
  - `period`: `today` | `this_week` | `this_month` | `custom`
  - `startDate`, `endDate`
- **Response `200 OK`**:
```json
{
  "success": true,
  "period": "this_month",
  "data": {
    "grandTotalQuickFour": 700.00,
    "categories": {
      "breakfast": { "total": 120.00, "percentage": 17.14, "count": 16 },
      "lunch": { "total": 210.00, "percentage": 30.00, "count": 14 },
      "dinner": { "total": 275.00, "percentage": 39.29, "count": 12 },
      "transport": { "total": 95.00, "percentage": 13.57, "count": 22 }
    }
  }
}
```

---

### 7.3 Full Category Breakdown
- **Endpoint**: `GET /api/analytics/categories`
- **Response `200 OK`**:
```json
{
  "success": true,
  "period": "this_month",
  "data": [
    { "categoryId": "cat_tech", "categoryName": "Electronics & Tech", "total": 1250.00, "percentage": 67.74 },
    { "categoryId": "cat_dinner", "categoryName": "Dinner", "total": 275.00, "percentage": 14.90 },
    { "categoryId": "cat_lunch", "categoryName": "Lunch", "total": 210.00, "percentage": 11.38 },
    { "categoryId": "cat_breakfast", "categoryName": "Breakfast", "total": 120.00, "percentage": 6.50 },
    { "categoryId": "cat_transport", "categoryName": "Transport", "total": 95.00, "percentage": 5.15 },
    { "categoryId": "cat_habits", "categoryName": "Habits & Routines", "total": 48.00, "percentage": 2.60 }
  ]
}
```

---

## 8. Currency & Exchange Rate APIs

### 8.1 Get Live Exchange Rates
- **Endpoint**: `GET /api/currency/rates`
- **Description**: Returns live exchange rates against base currency. Cached in `exchange_rates_cache.json` for 12 hours.
- **Response `200 OK`**:
```json
{
  "success": true,
  "base": "USD",
  "cachedAt": "2026-10-20T12:00:00.000Z",
  "isStale": false,
  "rates": {
    "EUR": 0.925,
    "GBP": 0.785,
    "JPY": 151.70,
    "CAD": 1.38,
    "DZD": 134.50,
    "MAD": 9.95,
    "EGP": 48.80
  }
}
```

---

### 8.2 Currency Converter
- **Endpoint**: `POST /api/currency/convert`
- **Request Body**:
```json
{
  "amount": 1250.00,
  "from": "USD",
  "to": "EUR"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "originalAmount": 1250.00,
    "fromCurrency": "USD",
    "convertedAmount": 1156.25,
    "toCurrency": "EUR",
    "rate": 0.925
  }
}
```

---

## 9. System & Backup APIs

### 9.1 Export Raw Database
- **Endpoint**: `GET /api/system/export`
- **Description**: Triggers a clean download of the current `db.json` file.
- **Headers**: `Content-Disposition: attachment; filename="db-backup-2026-10-20.json"`

### 9.2 Restore / Import Database
- **Endpoint**: `POST /api/system/import`
- **Description**: Validates schema and overwrites `db.json` with an uploaded JSON payload. Creates an automated fallback snapshot before applying.
