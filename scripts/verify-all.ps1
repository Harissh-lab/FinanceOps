$ErrorActionPreference = 'Stop'

Write-Host '==> Verifying backend'
Set-Location "./backend"
npm run check

Write-Host '==> Verifying frontend'
Set-Location "../frontend"
npm run build

Set-Location ".."
Write-Host 'Verification complete: backend tests/build + frontend build passed.'
