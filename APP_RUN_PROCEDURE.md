# How to Run FinanceOps

A step-by-step runbook for setting up and running the project on Windows PowerShell.

## First Time Setup (do this once)
1. Install prerequisites:
   - Node.js 18+
   - npm 9+
   - PostgreSQL (local) or Neon cloud PostgreSQL
2. Create a PostgreSQL database (example name: `finance_app`).
3. Open PowerShell and clone the repository.
```powershell
git clone https://github.com/financeops/financeops.git
Set-Location "My company"
```
4. Move to backend folder.
```powershell
Set-Location .\backend
```
5. Copy environment template.
```powershell
Copy-Item .\.env.example .\.env
```
6. Edit `.env` and set real values for:
   - `DATABASE_URL`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
7. Generate strong JWT secrets.
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
8. Install backend dependencies.
```powershell
npm install
```
9. Apply database migrations.
```powershell
npx prisma migrate dev --name init
```
10. Seed demo users.
```powershell
npm run seed
```
11. Start backend API server.
```powershell
npm run dev
```
12. Open a second PowerShell tab, start frontend, and verify URLs.
```powershell
Set-Location "..\frontend"
npm install
npm run dev
```

Verify:
- Frontend: http://localhost:5173
- Backend health: http://localhost:4000/health
- Swagger UI: http://localhost:4000/api/docs
- Swagger JSON: http://localhost:4000/api/docs-json

## Daily Development (after first setup)
Backend terminal:
```powershell
Set-Location "C:\\Users\\ADMIN\\Desktop\\My company\\backend"
npm run dev
```

Frontend terminal:
```powershell
Set-Location "C:\\Users\\ADMIN\\Desktop\\My company\\frontend"
npm run dev
```

## Useful Commands Reference
| Area | Script/Command | Purpose |
|---|---|---|
| Backend | `npm run dev` | Start backend in watch mode |
| Backend | `npm run dev:api` | Alias of backend dev start |
| Backend | `npm run build` | Compile TypeScript backend |
| Backend | `npm run start` | Run compiled backend build |
| Backend | `npm run seed` | Seed demo users |
| Backend | `npm run test` | Run Jest API tests |
| Backend | `npm run prisma:migrate` | Run Prisma migration in dev |
| Backend | `npx prisma migrate reset` | Reset DB and re-run migrations (no npm script alias currently) |
| Backend | `npx prisma studio` | Open Prisma Studio (no npm script alias currently) |
| Frontend | `npm run dev` | Start Vite dev server |
| Frontend | `npm run build` | Type-check and build frontend |
| Frontend | `npm run preview` | Preview built frontend locally |

## Troubleshooting

### Port 4000 already in use
```powershell
Get-NetTCPConnection -LocalPort 4000 | Select-Object LocalAddress,LocalPort,OwningProcess
Stop-Process -Id 12345 -Force
```
Then restart backend.

### Database connection failed
- Recheck `DATABASE_URL` in `backend/.env`.
- Confirm PostgreSQL instance is reachable.
- Test via Prisma:
```powershell
Set-Location .\backend
npx prisma db pull
```

### Prisma migration errors
- Ensure the same DB is not being used by conflicting migration histories.
- Reset local dev DB when safe:
```powershell
Set-Location .\backend
npx prisma migrate reset
npm run seed
```

### Frontend cannot connect to backend
- Ensure backend is running on `http://localhost:4000`.
- Ensure `CORS_ORIGIN` includes `http://localhost:5173`.
- Reload frontend after backend restart.

### JWT errors after DB reset
- If refresh tokens are invalidated by reset/seed actions, log out and log in again.
- Clear stale browser session state by reloading and re-authenticating.

## Testing the App — Demo Walkthrough
1. Login as Admin using `admin@finance.com / Admin@123`.
2. Open Dashboard and verify summary cards, trend chart, and financial health score.
3. Go to Records and create a new financial record.
4. Import a CSV/XLSX/JSON file using Import and confirm records update.
5. Open Analytics and validate projection cards/charts.
6. Logout and login as Viewer (`viewer@finance.com / Viewer@123`).
7. Confirm viewer cannot access records create/update/delete or users pages.
8. Test forgot password flow:
   - Submit existing email in Forgot Password
   - Copy token from backend terminal `[DEV] Password reset token ...`
   - Reset password and login with new credentials
