# ============================================================
# scripts/dev.ps1 - OpenPanda Local Dev Launcher
#
# Usage:
#   .\scripts\dev.ps1              Start backend only
#   .\scripts\dev.ps1 -Frontend    Start frontend only
#   .\scripts\dev.ps1 -All         Start backend + frontend
#   .\scripts\dev.ps1 -DbOnly      Start PostgreSQL + Redis only
# ============================================================
param(
    [switch]$Frontend,
    [switch]$All,
    [switch]$DbOnly
)

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OpenPanda Local Dev Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ============================================================
# 1. Load .env.local environment variables
# ============================================================
$envFile = Join-Path $projectRoot ".env.local"
if (Test-Path $envFile) {
    Write-Host ""
    Write-Host "[env] Loading .env.local ..." -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and (-not $line.StartsWith('#'))) {
            $parts = $line -split '=', 2
            if ($parts.Count -eq 2) {
                $key = $parts[0].Trim()
                $value = $parts[1].Trim()
                if ($key) {
                    [Environment]::SetEnvironmentVariable($key, $value, 'Process')
                }
            }
        }
    }
    Write-Host "[env] Loaded" -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "[env] .env.local not found, using defaults" -ForegroundColor Yellow
    Write-Host "[env] Copy .env.local and fill in your values" -ForegroundColor Yellow
}

# ============================================================
# 2. Start Docker services (PostgreSQL + Redis)
# ============================================================
Write-Host ""
Write-Host "[docker] Checking PostgreSQL and Redis ..." -ForegroundColor Green

$pgRunning = docker ps --filter "name=openpanda-db" --format "{{.Names}}" 2>$null
$redisRunning = docker ps --filter "name=openpanda-redis" --format "{{.Names}}" 2>$null

# Detect docker compose command (new Docker uses "docker compose", old uses "docker-compose")
$dcCmd = $null
if (Get-Command "docker" -ErrorAction SilentlyContinue) {
    docker compose version 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $dcCmd = @("docker", "compose")
    }
}
if (-not $dcCmd) {
    $dcCmd = @("docker-compose")
}

if ((-not $pgRunning) -or (-not $redisRunning)) {
    Write-Host "[docker] Starting services ..." -ForegroundColor Yellow
    & $dcCmd[0] $dcCmd[1] up -d postgres redis 2>&1 | Out-Null

    Write-Host "[docker] Waiting for PostgreSQL to accept connections ..." -ForegroundColor Yellow
    $ready = $false
    for ($i = 0; $i -lt 60; $i++) {
        # Check if container is running and pg_isready
        $status = docker exec openpanda-db pg_isready -U postgres 2>$null
        if ($LASTEXITCODE -eq 0) {
            # pg_isready says ready - but give it an extra second for port binding
            Start-Sleep -Seconds 2
            # Double-check by actually trying to connect
            $testConn = docker exec openpanda-db psql -U postgres -c "SELECT 1" 2>$null
            if ($LASTEXITCODE -eq 0) {
                $ready = $true
                break
            }
        }
        Start-Sleep -Seconds 1
    }
    if ($ready) {
        Write-Host "[docker] PostgreSQL and Redis started" -ForegroundColor Green
    }
    else {
        Write-Host "[docker] WARNING: PostgreSQL may not be fully ready yet" -ForegroundColor Yellow
    }
}
else {
    Write-Host "[docker] PostgreSQL and Redis already running" -ForegroundColor Green
}

if ($DbOnly) {
    Write-Host ""
    Write-Host "[done] Database ready." -ForegroundColor Cyan
    Write-Host "  Start backend manually: cd Backend; go run main.go" -ForegroundColor White
    return
}

# ============================================================
# 3. Build and start backend
# ============================================================
if ($All -or (-not $Frontend)) {
    Write-Host ""
    Write-Host "[build] Compiling backend ..." -ForegroundColor Green
    Push-Location "$projectRoot\Backend"
    try {
        $buildResult = go build -ldflags="-w -s" -o server.exe main.go 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[error] Backend build failed:" -ForegroundColor Red
            Write-Host $buildResult
            Pop-Location
            exit 1
        }
        Write-Host "[build] OK" -ForegroundColor Green

        $serverPort = [Environment]::GetEnvironmentVariable('SERVER_PORT', 'Process')
        if (-not $serverPort) { $serverPort = '8080' }

        if ($All) {
            Write-Host ""
            Write-Host "[start] Backend http://localhost:${serverPort} (background)" -ForegroundColor Green
            Start-Process -FilePath ".\server.exe" -WorkingDirectory (Get-Location) -NoNewWindow
            Write-Host "[start] Backend process started" -ForegroundColor Yellow
        }
        else {
            Write-Host ""
            Write-Host "[start] Backend http://localhost:${serverPort}" -ForegroundColor Green
            & .\server.exe
        }
    }
    finally {
        Pop-Location
    }
}

# ============================================================
# 4. Start frontend
# ============================================================
if ($All -or $Frontend) {
    Write-Host ""
    Write-Host "[start] Frontend http://localhost:3000 ..." -ForegroundColor Green
    Push-Location "$projectRoot\Frontend"
    try {
        npm run dev
    }
    finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "[done] Dev environment ready!" -ForegroundColor Cyan
