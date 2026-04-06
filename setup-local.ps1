# ---------------------------------------------------------------
# ChatDapp Local Setup Script
# Starts Hardhat node, deploys contracts (auto-writes .env files),
# starts relayer and frontend.
# Run with:  npm run setup  OR  powershell -File setup-local.ps1
# ---------------------------------------------------------------

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       ChatDapp -- Fully Offline Local Setup            " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# -- Step 1: Install dependencies if node_modules is missing ------
Write-Host "[1/5] Checking dependencies..." -ForegroundColor Yellow

if (!(Test-Path "contract\node_modules")) {
    Write-Host "     Installing contract dependencies..."
    Push-Location "contract"
    npm install --silent
    Pop-Location
}

if (!(Test-Path "myRelayer\node_modules")) {
    Write-Host "     Installing relayer dependencies..."
    Push-Location "myRelayer"
    npm install --silent
    Pop-Location
}

if (!(Test-Path "frontend\node_modules")) {
    Write-Host "     Installing frontend dependencies..."
    Push-Location "frontend"
    npm install --silent
    Pop-Location
}

Write-Host "     Done - All dependencies ready." -ForegroundColor Green
Write-Host ""

# -- Step 2: Start Hardhat node in background ---------------------
Write-Host "[2/5] Starting Hardhat node..." -ForegroundColor Yellow
$hardhatProcess = Start-Process -FilePath "npx.cmd" -ArgumentList "hardhat node" -WorkingDirectory "contract" -WindowStyle Minimized -PassThru
Write-Host "     Done - Hardhat node running (PID: $($hardhatProcess.Id))" -ForegroundColor Green
Write-Host ""

# Wait for the node to be ready
Start-Sleep -Seconds 5

# -- Step 3: Deploy contracts and auto-write .env files -----------
Write-Host "[3/5] Deploying contracts and writing .env files..." -ForegroundColor Yellow
Push-Location "contract"
npx hardhat run scripts/deploy.js --network localhost
Pop-Location
Write-Host "     Done - Contracts deployed, .env files auto-configured." -ForegroundColor Green
Write-Host ""

# -- Step 4: Start relayer in background --------------------------
Write-Host "[4/5] Starting relayer server..." -ForegroundColor Yellow
$relayerProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "start" -WorkingDirectory "myRelayer" -WindowStyle Minimized -PassThru
Write-Host "     Done - Relayer running on http://localhost:5000 (PID: $($relayerProcess.Id))" -ForegroundColor Green
Write-Host ""

# Wait for relayer to spin up
Start-Sleep -Seconds 2

# -- Step 5: Start frontend ---------------------------------------
Write-Host "[5/5] Starting frontend dev server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  All services running!                                 " -ForegroundColor Green
Write-Host "  Frontend:  http://localhost:5173                      " -ForegroundColor Green
Write-Host "  Relayer:   http://localhost:5000                      " -ForegroundColor Green
Write-Host "  Hardhat:   http://127.0.0.1:8545                     " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

Push-Location "frontend"
npm run dev
Pop-Location
