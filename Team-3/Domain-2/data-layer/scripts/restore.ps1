param([Parameter(Mandatory=$true)][string]$DatabaseUrl, [Parameter(Mandatory=$true)][string]$BackupFile)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $BackupFile)) { throw 'Backup file not found.' }
Write-Warning 'This command restores into the explicitly supplied database. Confirm it is a non-production target.'
$confirm = Read-Host 'Type RESTORE to continue'
if ($confirm -ne 'RESTORE') { throw 'Restore cancelled.' }
pg_restore --clean --if-exists --no-owner --dbname $DatabaseUrl $BackupFile
