# FinanceOps User Tutorial

This guide explains how to use FinanceOps end-to-end using the seeded accounts.

## Before You Start
1. Start backend:
```powershell
Set-Location "C:\Users\ADMIN\Desktop\My company\backend"
npm run dev
```
2. Start frontend in a second terminal:
```powershell
Set-Location "C:\Users\ADMIN\Desktop\My company\frontend"
npm run dev
```
3. Open the app:
- Frontend: http://localhost:5173
- Swagger UI: http://localhost:4000/api/docs

## Seeded Accounts
- Admin: `admin@finance.com` / `Admin@123`
- Analyst: `analyst@finance.com` / `Analyst@123`
- Viewer: `viewer@finance.com` / `Viewer@123`

## Step 1: Login
1. Open http://localhost:5173/login.
2. Enter one of the seeded accounts.
3. Click **Login**.
4. You should land on the protected app shell.

## Step 2: Explore Dashboard
1. Open **Dashboard** from left navigation.
2. Verify top stat cards:
   - Total Income
   - Total Expenses
   - Net Balance
   - Savings Rate
3. Verify trend indicator label:
   - `last 30 days vs prior 30 days`
4. Check charts and widgets:
   - Income vs Expense Trend
   - Category Breakdown + legend
   - Financial Health Score card
   - Recent Transactions table

## Step 3: Create a Financial Record
1. Login as **Admin** or **Analyst**.
2. Open **Records**.
3. Click **Add Record**.
4. Fill fields:
   - amount
   - type (INCOME/EXPENSE)
   - category
   - date
   - notes (optional)
5. Submit and confirm the new row appears in the table.

## Step 4: Import Records
1. Stay on **Records** page (Admin/Analyst account).
2. Choose an import file (`.json`, `.csv`, `.xls`, `.xlsx`).
3. Use one of:
   - **Import and Replace** (archives active records, then imports)
   - **Import and Append** (adds to active records)
4. Confirm success toast appears.
5. Re-open Dashboard and verify summary/trends update.

## Step 5: Use Analytics
1. Open **Analytics** (Admin/Analyst).
2. Review Investment Projection Engine controls:
   - Risk Profile
   - Allocation %
   - Horizon (years)
   - Inflation %
   - Monthly SIP
3. Observe updates in:
   - Scenario cards
   - Profit comparison chart
   - Suggested portfolio pie chart
   - Monthly performance
   - Category totals

## Step 6: Use Reports
1. Open **Reports** (Admin/Analyst).
2. Filter by type/category/search.
3. Save a report snapshot:
   - Enter snapshot name
   - Click **Save Snapshot**
4. Re-apply snapshot from dropdown and verify filters restore.
5. Optionally delete snapshot.

## Step 7: Manage Users (Admin Only)
1. Login as **Admin**.
2. Open **Users**.
3. Try actions:
   - Search user list
   - Add user via **Add User** modal
   - Change role/status
   - Delete user
4. Verify summary line under table:
   - `Showing X of Y users`

## Step 8: Verify Role Restrictions
1. Login as **Viewer**.
2. Confirm Dashboard access works.
3. Confirm restricted pages/actions are blocked:
   - Records create/import/edit/delete
   - Users page
   - Analytics page
   - Reports page

## Step 9: Test Forgot/Reset Password
1. Logout and open `/forgot-password`.
2. In **Request reset token**, submit an existing email (example: `viewer@finance.com`).
3. Check backend terminal for log line:
```text
[DEV] Password reset token for viewer@finance.com: <token>
```
4. Copy token.
5. In **Reset password** form, paste token and set new password.
6. Submit and verify success message.
7. Login with the new password.

## Step 10: Quick API Smoke Check (Optional)
1. Open Swagger UI: http://localhost:4000/api/docs
2. Run `POST /api/auth/login` with seeded admin account.
3. Use returned access token in Swagger **Authorize**.
4. Test protected endpoints:
   - `GET /api/dashboard/summary`
   - `GET /api/records`
   - `GET /api/users`

## Expected Demo Outcome
By the end of this tutorial, you will have verified:
- Auth + role-based access control
- Record CRUD and import workflow
- Dashboard analytics and health scoring
- Advanced analytics projections
- Report snapshot behavior
- Password reset process using backend dev token logs
