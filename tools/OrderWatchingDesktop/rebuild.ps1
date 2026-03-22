# Full rebuild: clean + Release build (avoids stale outputs).
# From repo root: npm run build:orderwatching
# Or: powershell -File tools/OrderWatchingDesktop/rebuild.ps1

$ErrorActionPreference = "Stop"
$proj = Join-Path $PSScriptRoot "OrderWatchingDesktop.csproj"

$running = Get-Process -Name "OrderWatchingDesktop" -ErrorAction SilentlyContinue
if ($running) {
    Write-Host "OrderWatchingDesktop.exe is still running — close it, then run this script again." -ForegroundColor Yellow
    Write-Host "(Windows locks the .exe and DLLs while the app is open.)" -ForegroundColor DarkYellow
    exit 2
}

Write-Host "OrderWatchingDesktop: dotnet clean (Release)..." -ForegroundColor Cyan
dotnet clean $proj -c Release
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "OrderWatchingDesktop: dotnet build (Release, --no-incremental)..." -ForegroundColor Cyan
dotnet build $proj -c Release --no-incremental
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "OK -> bin\Release\net8.0-windows\OrderWatchingDesktop.exe" -ForegroundColor Green
exit 0
