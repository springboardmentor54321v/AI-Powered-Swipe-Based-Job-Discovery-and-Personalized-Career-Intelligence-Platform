param(
  [Parameter(Mandatory = $true)][string]$DatabaseUrl,
  [Parameter(Mandatory = $true)][string]$BackupFile
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $BackupFile)) { throw "Backup file not found: $BackupFile" }
pg_restore --dbname=$DatabaseUrl --clean --if-exists --exit-on-error --table=companies --table=jobs --table=saved_jobs --table=swipes $BackupFile
if ($LASTEXITCODE -ne 0) { throw 'pg_restore failed.' }
Write-Output 'Job/data tables restored successfully.'
