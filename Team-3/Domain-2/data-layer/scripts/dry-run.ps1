param([Parameter(Mandatory=$true)][string]$DatabaseUrl)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
psql $DatabaseUrl -v ON_ERROR_STOP=1 -c 'BEGIN;'
try {
  @('001_core_features.sql','002_competition_counter.sql') | ForEach-Object { psql $DatabaseUrl -v ON_ERROR_STOP=1 -f (Join-Path "$root/migrations" $_) }
  psql $DatabaseUrl -v ON_ERROR_STOP=1 -f "$root/sql/integrity_checks.sql"
  psql $DatabaseUrl -v ON_ERROR_STOP=1 -c 'ROLLBACK;'
  Write-Host 'Transactional migration dry run passed; transaction rolled back.'
  Write-Warning '003_analytics.sql contains CREATE INDEX CONCURRENTLY and must be rehearsed on an isolated restored clone, outside a transaction.'
} catch { psql $DatabaseUrl -c 'ROLLBACK;' | Out-Null; throw }
