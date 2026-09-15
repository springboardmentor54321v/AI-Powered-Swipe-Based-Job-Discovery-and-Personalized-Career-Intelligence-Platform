param(
  [Parameter(Mandatory = $true)][string]$DatabaseUrl,
  [Parameter(Mandatory = $true)][string]$BackupDirectory
)

$ErrorActionPreference = 'Stop'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$target = Join-Path $BackupDirectory "swipex-job-data-$stamp.dump"
New-Item -ItemType Directory -Force -Path $BackupDirectory | Out-Null
pg_dump --dbname=$DatabaseUrl --format=custom --file=$target --table=companies --table=jobs --table=saved_jobs --table=swipes
if ($LASTEXITCODE -ne 0) { throw 'pg_dump failed.' }
Write-Output "Backup created: $target"
