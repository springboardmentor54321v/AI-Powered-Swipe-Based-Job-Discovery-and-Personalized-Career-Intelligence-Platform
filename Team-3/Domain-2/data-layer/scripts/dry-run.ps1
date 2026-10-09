param(
  [Parameter(Mandatory=$true)][string]$DatabaseUrl,
  [Parameter(Mandatory=$true)][switch]$IsolatedRestoredCopy
)

$ErrorActionPreference = 'Stop'
if (-not $IsolatedRestoredCopy) {
  throw 'Refusing to run migrations without -IsolatedRestoredCopy. Use a disposable restored database, never production.'
}

$root = Split-Path -Parent $PSScriptRoot
$migrationFiles = @(
  '001_core_features.sql',
  '002_competition_counter.sql',
  '003_analytics.sql'
)

foreach ($file in $migrationFiles) {
  & psql $DatabaseUrl -v ON_ERROR_STOP=1 -f (Join-Path "$root/migrations" $file)
  if ($LASTEXITCODE -ne 0) { throw "Migration rehearsal failed at $file" }
}

& psql $DatabaseUrl -v ON_ERROR_STOP=1 -f (Join-Path "$root/sql/integrity_checks.sql")
if ($LASTEXITCODE -ne 0) { throw 'Post-migration integrity checks failed' }
Write-Host 'Migrations and integrity checks passed on the isolated restored copy.'
