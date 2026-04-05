# FinanceOps API Reference

## Base URL
http://localhost:4000

## Authentication
FinanceOps uses Bearer access tokens for protected routes and refresh tokens for token renewal.

1. Login to get access token:
```json
POST /api/auth/login
{
  "email": "admin@finance.com",
  "password": "Admin@123"
}
```
2. Include access token in requests:
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample.access.token
```
3. Refresh expired access token:
```json
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample.refresh.token"
}
```

## Request/Response Format
Standard success envelope:
```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

Standard error envelope:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

Error codes used:
- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `INVALID_IMPORT_FILE`
- `INVALID_RESET_TOKEN`
- `RATE_LIMIT_EXCEEDED`

## Endpoints — Full Reference

### POST /api/auth/register
**Description**: Register a new user account (default role VIEWER).
**Auth required**: No
**Role required**: ANY
**Request body**:
```json
{
  "name": "string (required, 2-100)",
  "email": "string email (required)",
  "password": "string (required, min 8, uppercase+lowercase+number)"
}
```
**Success response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@finance.com",
    "role": "VIEWER",
    "status": "ACTIVE"
  }
}
```
**Error responses**:
- `400` validation failed
- `409` email already exists

### POST /api/auth/login
**Description**: Authenticate user and return access/refresh tokens.
**Auth required**: No
**Role required**: ANY
**Request body**:
```json
{
  "email": "string email (required)",
  "password": "string (required)"
}
```
**Success response** (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt",
    "refreshToken": "jwt",
    "user": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@finance.com",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  }
}
```
**Error responses**:
- `400` invalid payload
- `401` invalid credentials
- `403` inactive user

### POST /api/auth/refresh
**Description**: Issue a new access token using refresh token.
**Auth required**: No (refresh token required via cookie or body)
**Role required**: ANY
**Request body**:
```json
{
  "refreshToken": "string (optional if sent as cookie)"
}
```
**Success response** (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt"
  }
}
```
**Error responses**:
- `401` missing/invalid/expired refresh token

### POST /api/auth/logout
**Description**: Revoke refresh token and clear refresh cookie.
**Auth required**: No
**Role required**: ANY
**Request body**:
```json
{
  "refreshToken": "string (optional if sent as cookie)"
}
```
**Success response** (200):
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```
**Error responses**:
- `400` malformed payload

### POST /api/auth/forgot-password
**Description**: Start password reset flow with privacy-safe response.
**Auth required**: No
**Role required**: ANY
**Request body**:
```json
{
  "email": "string email (required)"
}
```
**Success response** (200):
```json
{
  "success": true,
  "data": {
    "message": "If an account exists, a reset email has been sent."
  }
}
```
**Error responses**:
- `400` invalid email payload

### POST /api/auth/reset-password
**Description**: Reset password using a valid reset token.
**Auth required**: No
**Role required**: ANY
**Request body**:
```json
{
  "token": "string (required, min 32)",
  "newPassword": "string (required, min 8, uppercase+lowercase+number)"
}
```
**Success response** (200):
```json
{
  "success": true,
  "data": {
    "message": "Password has been reset successfully"
  }
}
```
**Error responses**:
- `400` invalid payload or reset token invalid/expired

### GET /api/users
**Description**: List users with pagination and search.
**Auth required**: Yes
**Role required**: ADMIN only
**Query parameters**:
- `page` number, optional, default 1
- `limit` number, optional, default 10, max 100
- `search` string, optional
**Success response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@finance.com",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 3
  }
}
```
**Error responses**:
- `401` missing token
- `403` non-admin token

### POST /api/users
**Description**: Create a new user account.
**Auth required**: Yes
**Role required**: ADMIN only
**Request body**:
```json
{
  "name": "string (required)",
  "email": "string email (required)",
  "password": "string (required, min 8, uppercase+lowercase+number)",
  "role": "VIEWER|ANALYST|ADMIN (required)",
  "status": "ACTIVE|INACTIVE (optional, default ACTIVE)"
}
```
**Success response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New Analyst",
    "email": "analyst2@finance.com",
    "role": "ANALYST",
    "status": "ACTIVE"
  }
}
```
**Error responses**:
- `400` validation error
- `401` missing token
- `403` non-admin token
- `409` email already exists

### GET /api/users/:id
**Description**: Fetch a single user by id.
**Auth required**: Yes
**Role required**: ADMIN only
**Success response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Viewer User",
    "email": "viewer@finance.com",
    "role": "VIEWER",
    "status": "ACTIVE"
  }
}
```
**Error responses**:
- `401` missing token
- `403` non-admin token
- `404` user not found

### PATCH /api/users/:id
**Description**: Update user role and/or status.
**Auth required**: Yes
**Role required**: ADMIN only
**Request body**:
```json
{
  "role": "VIEWER|ANALYST|ADMIN (optional)",
  "status": "ACTIVE|INACTIVE (optional)"
}
```
At least one field is required.
**Success response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "role": "ANALYST",
    "status": "ACTIVE"
  }
}
```
**Error responses**:
- `400` validation error
- `401` missing token
- `403` non-admin token
- `404` user not found

### DELETE /api/users/:id
**Description**: Delete user by id.
**Auth required**: Yes
**Role required**: ADMIN only
**Success response** (200):
```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  }
}
```
**Error responses**:
- `401` missing token
- `403` non-admin token
- `404` user not found

### GET /api/records
**Description**: List records with filters and pagination.
**Auth required**: Yes
**Role required**: ANALYST+
**Query parameters**:
- `type` INCOME|EXPENSE, optional
- `category` string, optional
- `startDate` date, optional
- `endDate` date, optional
- `search` string, optional
- `page` number, default 1
- `limit` number, default 10
**Success response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 3200,
      "type": "INCOME",
      "category": "Salary",
      "date": "2026-03-05T00:00:00.000Z",
      "notes": "Monthly salary"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42
  }
}
```
**Error responses**:
- `400` validation error
- `401` missing token
- `403` insufficient role

### POST /api/records
**Description**: Create a financial record.
**Auth required**: Yes
**Role required**: ANALYST+
**Request body**:
```json
{
  "amount": "number > 0 (required)",
  "type": "INCOME|EXPENSE (required)",
  "category": "string 2-100 (required)",
  "date": "date string (required)",
  "notes": "string up to 500 (optional)"
}
```
**Success response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 450,
    "type": "EXPENSE",
    "category": "Groceries",
    "date": "2026-04-01T00:00:00.000Z"
  }
}
```
**Error responses**:
- `400` validation error
- `401` missing token
- `403` insufficient role

### GET /api/records/:id
**Description**: Get one record by id.
**Auth required**: Yes
**Role required**: ANALYST+
**Success response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 700,
    "type": "EXPENSE",
    "category": "Insurance",
    "date": "2026-03-18T00:00:00.000Z"
  }
}
```
**Error responses**:
- `401` missing token
- `403` insufficient role
- `404` record not found

### PATCH /api/records/:id
**Description**: Update a record by id.
**Auth required**: Yes
**Role required**: ADMIN only
**Request body**:
```json
{
  "amount": "number > 0 (optional)",
  "type": "INCOME|EXPENSE (optional)",
  "category": "string 2-100 (optional)",
  "date": "date string (optional)",
  "notes": "string up to 500 (optional)"
}
```
At least one field is required.
**Success response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "category": "Utilities"
  }
}
```
**Error responses**:
- `400` validation error
- `401` missing token
- `403` non-admin token
- `404` record not found

### DELETE /api/records/:id
**Description**: Delete a record by id.
**Auth required**: Yes
**Role required**: ADMIN only
**Success response** (200):
```json
{
  "success": true,
  "data": {
    "message": "Record deleted successfully"
  }
}
```
**Error responses**:
- `401` missing token
- `403` non-admin token
- `404` record not found

### POST /api/records/import
**Description**: Import records from JSON/CSV/XLS/XLSX file.
**Auth required**: Yes
**Role required**: ANALYST+
**Request body** (`multipart/form-data`):
- `file` (required)
**Query parameters**:
- `allowReplaceExisting` boolean (optional, default false)
**Success response** (201):
```json
{
  "success": true,
  "data": {
    "importedCount": 120,
    "failedCount": 2,
    "mode": "append",
    "errors": [
      { "rowNumber": 8, "reason": "Invalid amount" }
    ],
    "message": "Import completed with partial failures. Check errors for invalid rows."
  }
}
```
**Error responses**:
- `400` invalid file/invalid rows
- `401` missing token
- `403` insufficient role

### GET /api/dashboard/summary
**Description**: Get aggregate totals and rolling trend percentages.
**Auth required**: Yes
**Role required**: ANY
**Success response** (200):
```json
{
  "success": true,
  "data": {
    "totalIncome": 12850,
    "totalExpenses": 3750,
    "netBalance": 9100,
    "recordCount": 64,
    "trendWindow": {
      "label": "last 30 days vs prior 30 days",
      "incomeChangePct": 12.4,
      "expenseChangePct": -3.8,
      "netBalanceChangePct": 18.2,
      "savingsRateChangePct": 4.7
    }
  }
}
```
**Error responses**:
- `401` missing token

### GET /api/dashboard/trends
**Description**: Get 6-month trend chart points.
**Auth required**: Yes
**Role required**: ANY
**Success response** (200):
```json
{
  "success": true,
  "data": [
    { "month": "Nov 2025", "income": 3200, "expense": 900 },
    { "month": "Dec 2025", "income": 3000, "expense": 450 }
  ]
}
```
**Error responses**:
- `401` missing token

### GET /api/dashboard/categories
**Description**: Get category-level income/expense totals.
**Auth required**: Yes
**Role required**: ANY
**Success response** (200):
```json
{
  "success": true,
  "data": [
    { "category": "Salary", "income": 9050, "expense": 0, "total": 9050 },
    { "category": "Rent", "income": 0, "expense": 1800, "total": 1800 }
  ]
}
```
**Error responses**:
- `401` missing token

### GET /api/dashboard/recent
**Description**: Get latest transactions (top 10 by date).
**Auth required**: Yes
**Role required**: ANY
**Success response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 3500,
      "type": "INCOME",
      "category": "Salary",
      "date": "2026-03-05T00:00:00.000Z",
      "creator": {
        "id": "uuid",
        "name": "Analyst User",
        "email": "analyst@finance.com",
        "role": "ANALYST"
      }
    }
  ]
}
```
**Error responses**:
- `401` missing token

### GET /api/dashboard/health-score
**Description**: Get computed financial health score and insights.
**Auth required**: Yes
**Role required**: ANY
**Success response** (200):
```json
{
  "success": true,
  "data": {
    "score": 74,
    "label": "Good",
    "savingsRate": 41.2,
    "expenseRatio": 58.8,
    "recordCount": 64,
    "insights": [
      "Savings rate is 41.2% of income.",
      "Expenses consume 58.8% of income.",
      "Score confidence uses 64 active records.",
      "Strong cushion: continue investing and keep fixed costs stable."
    ]
  }
}
```
**Error responses**:
- `401` missing token

## Rate Limiting
FinanceOps applies an Express rate limiter globally:
- Production: `100` requests per `15` minutes per IP
- Development: `1000` requests per `15` minutes per IP

Error response when exceeded:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later."
  }
}
```
