$ErrorActionPreference = 'Stop'

$domain5 = Split-Path -Parent $PSScriptRoot
$team3 = Split-Path -Parent $domain5
$repository = Split-Path -Parent $team3
$workspace = Split-Path -Parent $repository
$frontend = Join-Path $team3 'Domain-4'
$python = Join-Path $workspace '.venv\Scripts\python.exe'
if (-not (Test-Path $python)) { $python = 'python' }

& $python -m pytest (Join-Path $domain5 'testing\automated') -m 'not integration'
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (Test-Path (Join-Path $frontend 'package.json')) {
  Push-Location $frontend
  try {
    npm run build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  } finally {
    Pop-Location
  }
}

Write-Host 'M2 static quality gate passed. Run live M2 tests separately after services are available.'
