$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$python = Join-Path $root '.venv\Scripts\python.exe'

if (-not (Test-Path $python)) { throw 'Python virtual environment not found at .venv.' }

& $python -m pytest (Join-Path $root 'testing\automated') -m 'not integration'
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$frontend = Join-Path $root 'frontend-practice'
if (Test-Path (Join-Path $frontend 'package.json')) {
  Push-Location $frontend
  try {
    npm run lint
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    npm run build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  } finally { Pop-Location }
}
