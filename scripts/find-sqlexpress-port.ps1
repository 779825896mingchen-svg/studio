# Prints the TCP port SQL Server is listening on for instance SQLEXPRESS (from registry).
# Run in PowerShell (Run as Administrator if you get an error):
#   cd path\to\studio
#   powershell -ExecutionPolicy Bypass -File .\scripts\find-sqlexpress-port.ps1
#
# Then set in .env:
#   STORE_SQL_PORT=<that number>
# Restart npm run dev.

$ErrorActionPreference = "Stop"
$base = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server"
$namesPath = Join-Path $base "Instance Names\SQL"

if (-not (Test-Path $namesPath)) {
  Write-Host "Registry path not found: $namesPath" -ForegroundColor Red
  Write-Host "Try running PowerShell as Administrator." -ForegroundColor Yellow
  exit 1
}

$inst = (Get-ItemProperty $namesPath).SQLEXPRESS
if (-not $inst) {
  Write-Host "No SQLEXPRESS entry under Instance Names\SQL." -ForegroundColor Red
  exit 1
}

$tcpAll = Join-Path $base "$inst\MSSQLServer\SuperSocketNetLib\Tcp\IPAll"
if (-not (Test-Path $tcpAll)) {
  Write-Host "TCP IPAll key not found: $tcpAll" -ForegroundColor Red
  exit 1
}

$p = Get-ItemProperty $tcpAll
$dyn = [string]$p.TcpDynamicPorts
$static = [string]$p.TcpPort
$dyn = if ($dyn) { $dyn.Trim() } else { "" }
$static = if ($static) { $static.Trim() } else { "" }

Write-Host "Instance folder: $inst" -ForegroundColor Cyan
Write-Host "TCP Dynamic Ports (registry): '$dyn'"
Write-Host "TCP Port (registry):          '$static'"
Write-Host ""

function Is-UsablePort([string]$s) {
  return $s -ne "" -and $s -ne "0"
}

if (Is-UsablePort $static) {
  Write-Host "Use this in .env:" -ForegroundColor Green
  Write-Host "STORE_SQL_PORT=$static"
} elseif (Is-UsablePort $dyn) {
  Write-Host "Use this in .env:" -ForegroundColor Green
  Write-Host "STORE_SQL_PORT=$dyn"
} else {
  Write-Host 'Registry has no fixed/dynamic port number stored yet (0 / empty is common).' -ForegroundColor Yellow
  Write-Host ""
  Write-Host 'Fallback: detect port from the running SQLEXPRESS process (SQL service must be Running, TCP/IP enabled)...' -ForegroundColor Cyan

  $oldEa = $ErrorActionPreference
  $ErrorActionPreference = "SilentlyContinue"

  $sqlexpressProcs = Get-CimInstance Win32_Process -Filter "Name = 'sqlservr.exe'" |
    Where-Object { $_.ExecutablePath -and ($_.ExecutablePath -like '*SQLEXPRESS*') }

  $ports = @()
  foreach ($proc in $sqlexpressProcs) {
    $listen = Get-NetTCPConnection -OwningProcess $proc.ProcessId -State Listen -ErrorAction SilentlyContinue
    foreach ($l in $listen) {
      if ($l.LocalPort -and $l.LocalPort -gt 0) {
        $ports += [int]$l.LocalPort
      }
    }
  }
  $ports = $ports | Sort-Object -Unique

  $ErrorActionPreference = $oldEa

  if ($ports.Count -eq 1) {
    Write-Host ""
    Write-Host "Found one listening TCP port for SQLEXPRESS. Use this in .env:" -ForegroundColor Green
    Write-Host "STORE_SQL_PORT=$($ports[0])"
  } elseif ($ports.Count -gt 1) {
    Write-Host ""
    Write-Host 'Multiple ports found for SQLEXPRESS sqlservr — pick the SQL engine port (often 49xxx), not shared memory only:' -ForegroundColor Yellow
    $ports | ForEach-Object { Write-Host ('  STORE_SQL_PORT=' + $_ + ' — try this') }
  } else {
    Write-Host ""
    Write-Host 'Could not detect a listening TCP port. Do this once in SQL Server Configuration Manager:' -ForegroundColor Yellow
    Write-Host '  1) Protocols for SQLEXPRESS -> TCP/IP -> Enabled'
    Write-Host '  2) TCP/IP properties -> IP Addresses -> IPAll'
    Write-Host '  3) Clear TCP Dynamic Ports (leave blank). Set TCP Port to e.g. 14330'
    Write-Host '  4) OK -> restart service SQL Server (SQLEXPRESS)'
    Write-Host '  5) Set STORE_SQL_PORT=14330 in .env (same number) and restart npm run dev'
    Write-Host ""
    Write-Host 'If fallback should work but showed nothing, run PowerShell as Administrator and run this script again.'
  }
}
