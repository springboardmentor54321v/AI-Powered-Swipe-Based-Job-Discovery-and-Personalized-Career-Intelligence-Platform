$ErrorActionPreference = 'Stop'

$domain5 = Split-Path -Parent $PSScriptRoot
$team3 = Split-Path -Parent $domain5
$repository = Split-Path -Parent $team3
$workspace = Split-Path -Parent $repository
$frontend = Join-Path $team3 'Domain-4'
$composeFile = Join-Path $repository 'docker-compose.full.dev.yml'
$liveTest = Join-Path $domain5 'testing\automated\test_m3_live_contracts.py'
$gatewayUrl = if ($env:SWIPEX_M3_GATEWAY_URL) { $env:SWIPEX_M3_GATEWAY_URL.TrimEnd('/') } else { 'http://localhost:8080' }
$frontendUrl = if ($env:SWIPEX_M3_FRONTEND_URL) { $env:SWIPEX_M3_FRONTEND_URL.TrimEnd('/') } else { 'http://localhost:5173' }
$python = Join-Path $workspace '.venv\Scripts\python.exe'
if (-not (Test-Path $python)) { $python = 'python' }

$savedEnvironment = @{
  SWIPEX_M3_GATEWAY_URL = $env:SWIPEX_M3_GATEWAY_URL
  SWIPEX_M3_FRONTEND_URL = $env:SWIPEX_M3_FRONTEND_URL
  SWIPEX_M3_ACCESS_TOKEN = $env:SWIPEX_M3_ACCESS_TOKEN
  SWIPEX_M3_TEST_JOB_ID = $env:SWIPEX_M3_TEST_JOB_ID
}
$createdTestAccount = $false
$testEmail = $null

function Restore-EnvironmentVariable([string]$Name, [AllowNull()][string]$Value) {
  if ($null -eq $Value) {
    Remove-Item "Env:$Name" -ErrorAction SilentlyContinue
  } else {
    Set-Item "Env:$Name" $Value
  }
}

function Wait-ForHttpOk([string]$Url, [string]$Label, [int]$Attempts = 20, [int]$DelaySeconds = 2) {
  $lastError = 'No response received.'
  for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
    try {
      $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -UseBasicParsing
      if ($response.StatusCode -eq 200) { return }
      $lastError = "HTTP $($response.StatusCode)"
    } catch {
      $lastError = $_.Exception.Message
    }
    if ($attempt -lt $Attempts) { Start-Sleep -Seconds $DelaySeconds }
  }
  throw "$Label did not become ready at $Url after $Attempts attempts. Last result: $lastError"
}

try {
  if (-not (Test-Path $composeFile)) { throw "Compose file not found: $composeFile" }
  if (-not (Test-Path $liveTest)) { throw "M3 integration test not found: $liveTest" }

  & $python -c 'import pytest' *> $null
  if ($LASTEXITCODE -ne 0) {
    $testRequirements = Join-Path $domain5 'requirements-test.txt'
    throw "pytest is missing. Install test dependencies with: python -m pip install -r `"$testRequirements`""
  }

  try {
    Wait-ForHttpOk -Url "$gatewayUrl/health" -Label 'Gateway' -Attempts 20 -DelaySeconds 2
    Wait-ForHttpOk -Url "$frontendUrl/resume" -Label 'Frontend' -Attempts 20 -DelaySeconds 2
  } catch {
    $details = $_.Exception.Message
    if (-not $details) { $details = $_.ToString() }
    throw "M3 integration prerequisites are unavailable. Start the local Docker Compose stack and confirm the configured URLs. $details"
  }

  $env:SWIPEX_M3_GATEWAY_URL = $gatewayUrl
  $env:SWIPEX_M3_FRONTEND_URL = $frontendUrl
  $gatewayUri = [Uri]$gatewayUrl
  $isLocalGateway = $gatewayUri.Host -in @('localhost', '127.0.0.1', '::1')
  if (-not $env:SWIPEX_M3_TEST_JOB_ID) {
    $env:SWIPEX_M3_TEST_JOB_ID = '1'
    Write-Host 'Using SWIPEX_M3_TEST_JOB_ID=1. Override it with a valid local job ID if needed.'
  }

  if (-not $env:SWIPEX_M3_ACCESS_TOKEN) {
    if (-not $isLocalGateway) {
      throw 'Automatic test-account creation is restricted to a local gateway. Set SWIPEX_M3_ACCESS_TOKEN for a non-local test environment.'
    }

    $provisionCode = @'
import uuid
from apps.users.models import User, Role, RoleEnum
from apps.auth_service.jwt_utils import generate_access_token
email = 'qa-m3-' + uuid.uuid4().hex + '@example.invalid'
role = Role.objects.get(name=RoleEnum.JOB_SEEKER)
user = User.objects.create_user(email=email, name='Intern 5 disposable integration test', password=uuid.uuid4().hex + 'Aa1!', role=role)
print('SWIPEX_QA_EMAIL=' + email)
print('SWIPEX_QA_TOKEN=' + generate_access_token(user))
'@
    $provisionOutput = & docker compose -f $composeFile exec -T auth-service python manage.py shell -c $provisionCode 2>&1
    if ($LASTEXITCODE -ne 0) {
      throw "Could not create the temporary local Job Seeker account. Ensure auth-service is running. $($provisionOutput -join "`n")"
    }

    $provisionText = $provisionOutput -join "`n"
    $emailMatch = [regex]::Match($provisionText, 'SWIPEX_QA_EMAIL=(qa-m3-[a-f0-9]{32}@example\.invalid)')
    $tokenMatch = [regex]::Match($provisionText, 'SWIPEX_QA_TOKEN=([A-Za-z0-9_.-]+)')
    if ($emailMatch.Success) {
      $testEmail = $emailMatch.Groups[1].Value
      $createdTestAccount = $true
    }
    if (-not $emailMatch.Success -or -not $tokenMatch.Success) {
      throw "The temporary account was created, but the email/token could not be read. Provision output: $provisionText"
    }

    $env:SWIPEX_M3_ACCESS_TOKEN = $tokenMatch.Groups[1].Value
    Write-Host 'Created a temporary local Job Seeker account for authenticated integration checks.'
  } else {
    Write-Warning 'Using SWIPEX_M3_ACCESS_TOKEN supplied by the caller. The uploaded synthetic resume will remain on that account; use a disposable account.'
  }

  if ($isLocalGateway) {
    $warmupCode = @'
import sys
sys.path.insert(0, '/Domain-3/Milestone3work')
from scoring.semantic_similarity import calculate_semantic_similarity
result = calculate_semantic_similarity('Python Django backend developer', 'Python Django backend engineer')
print('SWIPEX_MODEL_WARMUP=ok; similarity=' + str(result[0]))
'@
    $warmupOutput = & docker compose -f $composeFile exec -T auth-service python manage.py shell -c $warmupCode 2>&1
    if ($LASTEXITCODE -ne 0) {
      throw "ATS model warm-up failed. Check model dependencies, Hugging Face access, and the persistent ats-model-cache volume. $($warmupOutput -join "`n")"
    }
    Write-Host 'ATS semantic model is available in the local auth-service.'
  } else {
    Write-Host 'Skipping local model warm-up because the configured gateway is not local.'
  }

  & $python -m pytest $liveTest -m integration -q
  if ($LASTEXITCODE -ne 0) { throw "M3 live contract checks failed with exit code $LASTEXITCODE." }

  Push-Location $frontend
  try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Frontend production build failed with exit code $LASTEXITCODE." }
  } finally {
    Pop-Location
  }

  Write-Host 'M3 Day 4 integration harness passed: anonymous and authenticated API checks plus frontend build.'
} finally {
  try {
    if ($createdTestAccount -and $testEmail) {
      $cleanupCode = @"
from apps.users.models import User
from apps.resume_service.models import Skill
from apps.resume_service.storage import get_file_path
email = '$testEmail'
user = User.objects.filter(email=email).first()
removed_versions = 0
if user is not None:
    resume = getattr(user, 'resume', None)
    versions = list(resume.versions.all()) if resume is not None else []
    skill_names = {name for version in versions for name in version.resume_skills.values_list('skill__name', flat=True)}
    for version in versions:
        get_file_path(version.storage_key).unlink(missing_ok=True)
    removed_versions = len(versions)
    user.delete()
    for name in skill_names:
        skill = Skill.objects.filter(name=name).first()
        if skill is not None and not skill.resume_skills.exists():
            skill.delete()
print('SWIPEX_QA_CLEANUP=ok; removed_versions=' + str(removed_versions))
"@
      $cleanupOutput = & docker compose -f $composeFile exec -T auth-service python manage.py shell -c $cleanupCode 2>&1
      if ($LASTEXITCODE -ne 0) {
        throw "Failed to clean up the temporary QA account or uploaded resume. Manual cleanup may be needed for $testEmail. $($cleanupOutput -join "`n")"
      }
      Write-Host 'Removed the temporary QA account, its uploaded resume files, and any unreferenced skills.'
    }
  } finally {
    foreach ($name in $savedEnvironment.Keys) {
      Restore-EnvironmentVariable -Name $name -Value $savedEnvironment[$name]
    }
  }
}
