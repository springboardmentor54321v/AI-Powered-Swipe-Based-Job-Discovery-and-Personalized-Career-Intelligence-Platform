param([Parameter(Mandatory=$true)][string]$DatabaseUrl, [Parameter(Mandatory=$true)][string]$Destination)
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path $Destination | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
pg_dump --format=custom --no-owner --file (Join-Path $Destination "recruitment-$stamp.dump") $DatabaseUrl
Write-Host "Backup created. Validate with: pg_restore --list <file>"
