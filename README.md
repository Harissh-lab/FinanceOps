# FinanceOps — Finance Data Processing & Access Control

## Overview
FinanceOps is a full-stack finance operations platform for secure user access, financial record management, and decision-ready analytics. The application provides JWT-based authentication, role-based authorization, import-enabled record workflows, and dashboard insights such as trends, category breakdown, and health scoring. It is built with Node.js, Express, TypeScript, PostgreSQL, Prisma, React, and Vite.

## Product Preview
![FinanceOps UI Preview](docs/images/FinanceOps.png)

## Live API Documentation
- Swagger Explore URL: https://app.swaggerhub.com/apis-docs/financeops/financeops-api/1.0.0
- Swagger UI (local): http://localhost:4000/api/docs
- API Spec JSON (local): http://localhost:4000/api/docs-json

## Tech Stack
| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express (TypeScript) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (access + refresh), bcryptjs |
| Validation | Zod |
| API Docs | Swagger UI + OpenAPI 3.0 |
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| State Management | React Context + TanStack Query |
| HTTP Client | Axios |
| Testing | Jest + Supertest |

## Project Structure
```text
My company/
|-- backend/                       # Backend API service (Express + TypeScript)
|   |-- prisma/                    # Database schema, migrations, and seed scripts
|   |   |-- migrations/            # Versioned SQL migration history
|   |   |-- schema.prisma          # Prisma data model (User, records, tokens)
|   |   `-- seed.ts                # Seeded demo users
|   |-- src/                       # Backend source code
|   |   |-- config/                # Env parsing, Prisma client, Swagger spec
|   |   |-- middlewares/           # Auth, role, validation, upload, rate limiting
|   |   |-- modules/               # Domain modules (auth/users/records/dashboard)
|   |   |-- types/                 # Express type augmentation
|   |   |-- utils/                 # Shared helpers (response, pagination, jwt)
|   |   |-- app.ts                 # Express app wiring and middleware stack
|   |   `-- index.ts               # API entrypoint/server start
|   |-- tests/                     # API integration tests
|   |-- .env.example               # Environment variable template
|   `-- package.json               # Backend scripts and dependencies
|-- frontend/                      # React frontend application
|   |-- src/                       # Frontend source code
|   |   |-- api/                   # Axios clients and API wrappers
|   |   |-- components/            # Layout and reusable UI components
|   |   |-- context/               # Auth context state
|   |   |-- guards/                # Protected route + role guard
|   |   |-- hooks/                 # Data hooks (dashboard, records, users)
|   |   |-- pages/                 # Route pages (dashboard, analytics, users)
|   |   |-- App.tsx                # Route graph and role-based navigation
|   |   `-- main.tsx               # App bootstrap
|   `-- package.json               # Frontend scripts and dependencies
|-- scripts/                       # PowerShell automation (setup/start/verify)
|-- README.md                      # Project overview and setup guide
|-- APP_RUN_PROCEDURE.md           # Beginner-friendly runbook
|-- APP_USER_TUTORIAL.md           # End-to-end UI usage walkthrough
|-- API_REFERENCE.md               # Full API endpoint reference
|-- sample-test-data/              # Recruiter-ready import sample files (xlsx/json)
`-- CONTRIBUTING.md                # Contribution workflow and conventions
```

Detailed product walkthrough: [APP_USER_TUTORIAL.md](APP_USER_TUTORIAL.md)

## Quick Setup

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL (local)

### Step 1 — Configure PostgreSQL
- Create a local database named `finance_app`
- Use this connection string format in `.env`:
	`postgresql://postgres:postgres@localhost:5432/finance_app?schema=public`

### Step 2 — Clone the repository
```bash
git clone https://github.com/Harissh-lab/FinanceOps.git
cd "My company"
```

### Step 3 — Configure environment
```powershell
Set-Location .\backend
Copy-Item .\.env.example .\.env
```
Then open .env and fill in the values.

### Step 4 — Generate JWT secrets
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Use the generated values for:
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET

### Step 5 — Install and run backend
```powershell
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

### Step 6 — Install and run frontend
```powershell
Set-Location ..\frontend
npm install
npm run dev
```

### Step 7 — Open the app
- Frontend:  http://localhost:5173
- Backend:   http://localhost:4000/health
- Swagger:   http://localhost:4000/api/docs

## Seeded Login Credentials
| Role | Email | Password | Access Level |
|---|---|---|---|
| ADMIN | admin@finance.com | Admin@123 | Full access: users, records, dashboard, analytics, reports |
| ANALYST | analyst@finance.com | Analyst@123 | Records read/create/import, dashboard, analytics, reports |
| VIEWER | viewer@finance.com | Viewer@123 | Read-only dashboard access |

## Role Permission Matrix
| Endpoint Group | VIEWER | ANALYST | ADMIN |
|---|:---:|:---:|:---:|
| Dashboard | ✓ | ✓ | ✓ |
| Records (read) | ✗ | ✓ | ✓ |
| Records (create) | ✗ | ✓ | ✓ |
| Records (edit/delete) | ✗ | ✗ | ✓ |
| Users management | ✗ | ✗ | ✓ |
| Analytics | ✗ | ✓ | ✓ |
| Reports | ✗ | ✓ | ✓ |
| Import records | ✗ | ✓ | ✓ |

## API Endpoints

### Auth
| Method | Path | Auth Required | Role Required | Description |
|---|---|---|---|---|
| POST | /api/auth/register | No | Public | Register a new viewer account |
| POST | /api/auth/login | No | Public | Authenticate and receive access/refresh tokens |
| POST | /api/auth/refresh | No (refresh token) | Public | Refresh access token using cookie or body token |
| POST | /api/auth/logout | No (refresh token optional) | Public | Revoke refresh token and clear cookie |
| POST | /api/auth/forgot-password | No | Public | Start password reset flow with generic response |
| POST | /api/auth/reset-password | No | Public | Reset password using token + new password |

### Users
| Method | Path | Auth Required | Role Required | Description |
|---|---|---|---|---|
| GET | /api/users | Yes | ADMIN | List users with pagination and search |
| POST | /api/users | Yes | ADMIN | Create a user |
| GET | /api/users/:id | Yes | ADMIN | Fetch user by id |
| PATCH | /api/users/:id | Yes | ADMIN | Update user role or status |
| DELETE | /api/users/:id | Yes | ADMIN | Delete user |

### Records
| Method | Path | Auth Required | Role Required | Description |
|---|---|---|---|---|
| GET | /api/records | Yes | ANALYST, ADMIN | List records with filters and pagination |
| POST | /api/records | Yes | ANALYST, ADMIN | Create a financial record |
| GET | /api/records/:id | Yes | ANALYST, ADMIN | Fetch record by id |
| PATCH | /api/records/:id | Yes | ADMIN | Update record |
| DELETE | /api/records/:id | Yes | ADMIN | Delete record |
| POST | /api/records/import | Yes | ANALYST, ADMIN | Import CSV/XLS/XLSX/JSON records |

### Dashboard
| Method | Path | Auth Required | Role Required | Description |
|---|---|---|---|---|
| GET | /api/dashboard/summary | Yes | Any authenticated | Totals + rolling 30-day trend deltas |
| GET | /api/dashboard/trends | Yes | Any authenticated | 6-month income vs expense trend points |
| GET | /api/dashboard/categories | Yes | Any authenticated | Category income/expense breakdown |
| GET | /api/dashboard/recent | Yes | Any authenticated | Most recent transactions |
| GET | /api/dashboard/health-score | Yes | Any authenticated | Financial health score and insights |

## Environment Variables
| Variable | Required | Description | Example |
|---|---|---|---|
| NODE_ENV | Yes | Runtime mode used for behavior like rate limiting | development |
| PORT | Yes | Backend server port | 4000 |
| DATABASE_URL | Yes | PostgreSQL connection string for Prisma | postgresql://postgres:postgres@localhost:5432/finance_app?schema=public |
| JWT_ACCESS_SECRET | Yes | Secret used to sign access tokens | 64+ char random string |
| JWT_REFRESH_SECRET | Yes | Secret used to sign refresh tokens | 64+ char random string |
| ACCESS_TOKEN_EXPIRES_IN | Yes | Access token lifetime | 15m |
| REFRESH_TOKEN_EXPIRES_IN_DAYS | Yes | Refresh token lifetime in days | 7 |
| CORS_ORIGIN | Yes | Comma-separated allowed frontend origins | http://localhost:5173,http://localhost:5174 |

## Testing Password Reset Flow
1. Open Forgot Password page at `/forgot-password`.
2. Submit an existing seeded user email (example: `viewer@finance.com`).
3. Check backend terminal log for: `[DEV] Password reset token for viewer@finance.com: <token>`.
4. Copy the latest token value.
5. Submit Reset Password form with token and new password.
6. Login with the new password.

## Running Tests
Backend test command:
```powershell
Set-Location .\backend
npm run test
```
What it covers:
- auth flow (login/register/refresh/logout behaviors)
- role-protected access checks
- records and dashboard API behavior
- request validation and response envelope expectations

Verification pipeline:
```powershell
Set-Location .\backend
npm run check
```
This runs TypeScript build + Jest tests.

## Features Beyond Requirements
- Investment Projection Engine with lump sum, SIP, and inflation-adjusted outcomes
- Financial Health Score endpoint and dashboard card with insights
- Reports page with snapshot save/apply/delete workflow
- Multi-format record import (xlsx, xls, csv, json)
- Forgot password flow with privacy-safe API response and dev token logging
- Soft delete for financial records with active dataset filtering
- Configured rate limiting (dev and production tiers)
- Refresh token lifecycle with persistence and cookie support
- Role-guarded frontend routes for dashboard, records, analytics, reports, users
- Exportable OpenAPI JSON endpoint (`/api/docs-json`) for SwaggerHub submission

## Assumptions and Design Decisions
- PostgreSQL was selected for strong relational consistency and robust aggregation support.
- JWT was chosen instead of server sessions for stateless API scaling and clear API-client token flow.
- Prisma was selected for typed schema evolution, migrations, and safer query ergonomics.
- Record deletion uses soft delete to preserve historical traceability and prevent destructive loss.
- Role hierarchy is strict: VIEWER < ANALYST < ADMIN, with users management restricted to ADMIN.
- Error format is normalized (`success: false` + `error` object) for predictable frontend handling.
- Rate limiting is relaxed in development (1000/15m) and stricter in production (100/15m).
- Access token is stored in frontend memory state (not localStorage) to reduce persistent token exposure.
- Forgot-password API always returns a generic message to avoid account enumeration leakage.

## Known Limitations
- SMTP email delivery is not fully production-integrated in the current code; dev reset flow uses terminal token logs.
- HTTPS/TLS termination is not included in this local single-service setup.
- Deployment topology is single-node by default (no horizontal scaling, queueing, or distributed session concerns).
