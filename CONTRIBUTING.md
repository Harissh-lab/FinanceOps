# Contributing

Thanks for contributing to FinanceOps.

## Code Style
- Use TypeScript for backend and frontend changes.
- Keep lint/build green before opening a PR.
- Follow existing response envelope patterns:
  - success: `{ success: true, data, meta? }`
  - error: `{ success: false, error: { code, message, details? } }`
- Prefer small, focused commits with clear messages.

## Folder Conventions
- Backend modules follow `routes -> controller -> schema` pattern under `backend/src/modules/*`.
- Shared middleware goes in `backend/src/middlewares`.
- Shared helpers go in `backend/src/utils`.
- Frontend route pages go in `frontend/src/pages`.
- Reusable UI primitives go in `frontend/src/components/ui`.
- API clients stay in `frontend/src/api`.

## How to Add a New Backend Module
1. Create folder: `backend/src/modules/budgets`.
2. Add:
  - `budgets.schemas.ts` (Zod contracts)
  - `budgets.controller.ts` (business logic)
  - `budgets.routes.ts` (routing + middleware chain)
3. Register routes in `backend/src/app.ts`.
4. Add OpenAPI docs in `backend/src/config/swagger.ts`.
5. Add tests in `backend/tests` if API behavior changes.

## Environment Setup for Contributors
1. Copy backend env template:
```powershell
Set-Location .\backend
Copy-Item .\.env.example .\.env
```
2. Fill `DATABASE_URL`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET`.
3. Install and prepare DB:
```powershell
npm install
npx prisma migrate dev --name init
npm run seed
```
4. Run backend and frontend:
```powershell
npm run dev
Set-Location ..\frontend
npm install
npm run dev
```

## Pull Request Checklist
- Backend builds: `npm run build`
- Backend tests pass: `npm run test`
- Frontend builds: `npm run build`
- Swagger docs still load: `/api/docs`
- No secrets committed
