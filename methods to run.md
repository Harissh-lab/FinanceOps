# Methods To Run

This file is a practical runbook for reviewers and recruiters to run the project quickly, inspect API usage, and verify PostgreSQL files/folders.

## 1. Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+
- Windows PowerShell (for helper scripts)

## 2. PostgreSQL Setup

1. Start PostgreSQL service.
2. Create database:

```sql
CREATE DATABASE finance_app;
```

3. Verify backend connection string in `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance_app?schema=public
```

## 3. Project Setup (One Time)

From repository root:

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/setup-all.ps1
```

What this script does:

- Creates `backend/.env` from `.env.example` if missing
- Installs backend dependencies
- Runs Prisma generate + migrate
- Seeds database
- Installs frontend dependencies

## 4. Start Application

From repository root:

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/start-all.ps1
```

Expected URLs:

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Swagger Docs: http://localhost:4000/api/docs

## 5. Manual Start (Alternative)

Terminal 1:

```powershell
Set-Location .\backend
npm run dev
```

Terminal 2:

```powershell
Set-Location .\frontend
npm run dev
```

## 6. Verify Build and Tests

Run full verification from root:

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/verify-all.ps1
```

Manual commands:

```powershell
Set-Location .\backend
npm run build
npm test

Set-Location ..\frontend
npm run build
```

## 7. API Usage Guide

Base URL: `http://localhost:4000`

### Health Check

```http
GET /health
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@finance.com",
  "password": "Admin@123"
}
```

### Use Bearer Token

Include header for protected routes:

```http
Authorization: Bearer <accessToken>
```

### Records Import

```http
POST /api/records/import
Content-Type: multipart/form-data
Field name: file
```

Supported file types:

- `.json`
- `.csv`
- `.xls`
- `.xlsx`

Expected columns/keys:

- `amount`
- `type` (INCOME or EXPENSE)
- `category`
- `date`
- `notes` (optional)

Import behavior:

- New import archives old active records first
- Imported file becomes the active dataset displayed in records/dashboard

### Common Endpoint Groups

- Auth: `/api/auth/*`
- Users: `/api/users/*` (ADMIN only)
- Records: `/api/records/*` (ANALYST + ADMIN, with admin-only update/delete)
- Dashboard: `/api/dashboard/*` (all authenticated users)

## 8. PostgreSQL Files and Folders (Important)

Core DB assets:

- `backend/prisma/schema.prisma`:
  - Prisma datasource and generator
  - Models: User, FinancialRecord, RefreshToken, PasswordResetToken
  - Enums: Role, Status, RecordType

- `backend/prisma/migrations/`:
  - SQL migration history applied by Prisma

- `backend/prisma/seed.ts`:
  - Initial user records only (admin, analyst, viewer)
  - No default financial records

- `backend/.env.example`:
  - Required DB/auth/cors environment variables

- `backend/.env`:
  - Local runtime credentials and secrets (developer machine only)

## 9. Reviewer Walkthrough (5 Minutes)

1. Open Swagger at http://localhost:4000/api/docs.
2. Login using seeded admin credentials via `/api/auth/login`.
3. Import a sample JSON/CSV/XLSX from Records page.
4. Confirm records/dashboard reflect imported data set.
5. Run backend tests (`npm test`) to verify API behavior.

## 10. Troubleshooting

- Backend cannot connect to DB:
  - Ensure PostgreSQL is running
  - Verify `DATABASE_URL` in `backend/.env`

- CORS errors from frontend:
  - Confirm frontend is running on `5173` or `5174`
  - Check `CORS_ORIGIN` in `backend/.env`

- Import fails:
  - Ensure multipart field name is exactly `file`
  - Verify columns: amount, type, category, date, notes

- Port already in use:
  - Stop old Node process or use a free port and update env
