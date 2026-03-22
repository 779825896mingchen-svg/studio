# Lists TCP ports sqlservr.exe is listening on. Prefers instances whose path contains SQLEXPRESS.
#
#   npm run sql:list-sqlexpress-ports

$ErrorActionPreference = "SilentlyContinue"

function TestExpressInstancePath([string]$path) {
  if (-not $path) { return $false }
  return $path -match '(?i)SQLEXPRESS'
}

$allSql = @(Get-CimInstance Win32_Process -Filter "Name = 'sqlservr.exe'")

if ($allSql.Count -lt 1) {
  Write-Host 'No sqlservr.exe process is running on this PC.' -ForegroundColor Red
  Write-Host ''
  Write-Host 'Start the database engine:' -ForegroundColor Yellow
  Write-Host '  Win+R -> services.msc -> SQL Server (SQLEXPRESS) -> Start'
  exit 1
}

$procs = @($allSql | Where-Object { TestExpressInstancePath $_.ExecutablePath })

if ($procs.Count -lt 1) {
  Write-Host 'No sqlservr path contains SQLEXPRESS (path may be hidden without Admin). Scanning ALL sqlservr.exe:' -ForegroundColor Yellow
  Write-Host ''
  $procs = $allSql
}

foreach ($p in $procs) {
  $path = $p.ExecutablePath
  if (-not $path) { $path = '(path empty - run PowerShell as Administrator if you need it)' }
  Write-Host ('PID ' + $p.ProcessId + '  ' + $path) -ForegroundColor Cyan
}

$allPorts = @()
foreach ($p in $procs) {
  $listen = Get-NetTCPConnection -OwningProcess $p.ProcessId -State Listen -ErrorAction SilentlyContinue
  foreach ($l in $listen) {
    if ($l.LocalPort -gt 0) {
      $allPorts += [pscustomobject]@{ Port = $l.LocalPort; Address = $l.LocalAddress; Pid = $p.ProcessId }
    }
  }
}

$allPorts = $allPorts | Sort-Object Port, Address -Unique

Write-Host ""
if ($allPorts.Count -lt 1) {
  Write-Host 'No TCP listen sockets for sqlservr (SSMS can still use Shared Memory).' -ForegroundColor Yellow
  Write-Host ""
  Write-Host 'Enable TCP in SQL Server Configuration Manager:' -ForegroundColor Green
  Write-Host '  Protocols for SQLEXPRESS -> TCP/IP -> Enable'
  Write-Host '  TCP/IP -> IP Addresses -> IPAll -> clear Dynamic Ports, set TCP Port (e.g. 14330)'
  Write-Host '  Restart SQL Server (SQLEXPRESS) in services.msc'
  exit 0
}

Write-Host 'TCP listen ports (set STORE_SQL_PORT to one of these, usually IPv4 0.0.0.0 or 127.0.0.1):' -ForegroundColor Green
$allPorts | ForEach-Object { Write-Host ('  ' + $_.Address + ' : ' + $_.Port + '  (PID ' + $_.Pid + ')') }

$first = ($allPorts | Where-Object { $_.Address -eq '0.0.0.0' -or $_.Address -eq '127.0.0.1' } | Select-Object -First 1).Port
if (-not $first) { $first = ($allPorts | Select-Object -First 1).Port }

Write-Host ""
Write-Host 'Suggested .env line:' -ForegroundColor Green
Write-Host ('STORE_SQL_PORT=' + $first)
