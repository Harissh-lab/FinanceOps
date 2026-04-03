$ErrorActionPreference = 'Stop'

Write-Host 'Starting backend and frontend in separate terminals...'

Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "c:\Users\ADMIN\Desktop\My company\backend"; npm run dev'
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "c:\Users\ADMIN\Desktop\My company\frontend"; npm run dev'

Write-Host 'Backend: http://localhost:4000'
Write-Host 'Frontend: http://localhost:5173'
Write-Host 'Swagger: http://localhost:4000/api/docs'
