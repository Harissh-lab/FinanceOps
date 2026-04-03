# Finance Data Processing and Access Control Platform

Production-ready full-stack finance application with secure role-based access, file import workflows, and interactive analytics. This repository is designed as an assessment-grade project and presented in a recruiter-friendly structure.

## What This Project Demonstrates

- Secure authentication with access and refresh tokens
- Role-based authorization (ADMIN, ANALYST, VIEWER)
- Financial record CRUD with filtering, pagination, and soft delete
- Bulk import from JSON, CSV, XLS, XLSX
- Dashboard analytics (summary, trends, categories, recents)
- Frontend architecture with protected routes and data-query caching
- End-to-end backend API tests

## Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, TypeScript, Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (access + refresh), bcrypt |
| Validation | Zod |
| API Docs | Swagger UI |
| Frontend | React, Vite, TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Data Fetching | TanStack Query + Axios |
| Testing | Jest + Supertest |

## Monorepo Structure

```text
/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── src/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── records/
│   │   │   └── dashboard/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── index.ts
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── guards/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── scripts/
│   ├── setup-all.ps1
│   ├── start-all.ps1
│   └── verify-all.ps1
├── README.md
└── methods to run.md
```

## API Surface (Summary)

Base URL: `http://localhost:4000`

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/users` (ADMIN)
- `POST /api/users` (ADMIN)
- `PATCH /api/users/:id` (ADMIN)
- `DELETE /api/users/:id` (ADMIN)
- `GET /api/records` (ANALYST, ADMIN)
- `POST /api/records` (ANALYST, ADMIN)
- `POST /api/records/import` (ANALYST, ADMIN)
- `PATCH /api/records/:id` (ADMIN)
- `DELETE /api/records/:id` (ADMIN)
- `GET /api/dashboard/summary`
- `GET /api/dashboard/trends`
- `GET /api/dashboard/categories`
- `GET /api/dashboard/recent`

Swagger: `http://localhost:4000/api/docs`

## Important Import Behavior

When a new file is imported through `POST /api/records/import`, existing active records are archived first, then imported rows are inserted. This means the latest import becomes the currently active dataset (no unintended accumulation in active view).

## Seed Data

Current seed creates users only (no default financial records):

- admin@finance.com / Admin@123
- analyst@finance.com / Analyst@123
- viewer@finance.com / Viewer@123

## PostgreSQL Assets Recruiters Should Check

- Data model: `backend/prisma/schema.prisma`
- Migration history: `backend/prisma/migrations/`
- Seed logic: `backend/prisma/seed.ts`
- Environment template: `backend/.env.example`
- Local env file: `backend/.env` (not committed)

## Quick Start

See full runbook in `methods to run.md`.

Fast path on Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/setup-all.ps1
powershell -ExecutionPolicy Bypass -File ./scripts/start-all.ps1
```

## Quality Checks

Backend checks:

```powershell
Set-Location .\backend
npm run check
```

Frontend build:

```powershell
Set-Location ..\frontend
npm run build
```

Or run everything:

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/verify-all.ps1
```

## Recruiter Notes

This project highlights backend correctness, API security, role-based controls, practical data import flows, and dashboard-oriented frontend delivery. It is suitable as a portfolio-ready full-stack engineering assessment submission.
