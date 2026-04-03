$ErrorActionPreference = 'Stop'

Write-Host '==> Checking backend env file'
if (!(Test-Path "./backend/.env")) {
  Copy-Item "./backend/.env.example" "./backend/.env"
  Write-Host 'Created backend/.env from template. Update DATABASE_URL and JWT secrets if needed.'
}

Write-Host '==> Installing backend dependencies'
Set-Location "./backend"
npm install

Write-Host '==> Generating Prisma client'
npx prisma generate

Write-Host '==> Applying migrations and seed (requires PostgreSQL running)'
try {
  npx prisma migrate dev --name init
  npm run seed
  Write-Host 'Backend DB setup complete.'
} catch {
  Write-Host 'Database setup failed. Ensure PostgreSQL is running and DATABASE_URL is correct.'
  throw
}

Write-Host '==> Installing frontend dependencies'
Set-Location "../frontend"
npm install

Set-Location ".."
Write-Host 'All setup steps completed.'
