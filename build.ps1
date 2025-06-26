Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GoAsk PowerShell Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking Go environment..." -ForegroundColor Yellow
try {
    $goVersion = go version
    Write-Host "[OK] $goVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Go is not available" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Getting Go paths..." -ForegroundColor Yellow
$goPath = go env GOPATH
$goRoot = go env GOROOT
Write-Host "GOPATH: $goPath" -ForegroundColor Cyan
Write-Host "GOROOT: $goRoot" -ForegroundColor Cyan

Write-Host ""
Write-Host "Adding Go bin to PATH..." -ForegroundColor Yellow
$env:PATH = "$goPath\bin;$goRoot\bin;$env:PATH"
Write-Host "[OK] PATH updated for this session" -ForegroundColor Green

Write-Host ""
Write-Host "Installing Wails CLI..." -ForegroundColor Yellow
try {
    go install github.com/wailsapp/wails/v2/cmd/wails@latest
    Write-Host "[OK] Wails CLI installed" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to install Wails CLI" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Checking Wails CLI..." -ForegroundColor Yellow
try {
    $wailsVersion = wails version
    Write-Host "[OK] $wailsVersion" -ForegroundColor Green
    $wailsCmd = "wails"
} catch {
    Write-Host "[INFO] Trying direct path..." -ForegroundColor Yellow
    $wailsPath = "$goPath\bin\wails.exe"
    if (Test-Path $wailsPath) {
        $wailsVersion = & $wailsPath version
        Write-Host "[OK] $wailsVersion" -ForegroundColor Green
        $wailsCmd = $wailsPath
    } else {
        Write-Host "[ERROR] Wails not found at $wailsPath" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
try {
    npm install
    Write-Host "[OK] Frontend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location ..
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "Building application..." -ForegroundColor Yellow
try {
    & $wailsCmd build -platform windows/amd64
    Write-Host "[OK] Build completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Build failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Build completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Executable location: build\bin\goask-windows-amd64.exe" -ForegroundColor Cyan

if (Test-Path "build\bin\goask-windows-amd64.exe") {
    $fileInfo = Get-Item "build\bin\goask-windows-amd64.exe"
    Write-Host "File size: $($fileInfo.Length) bytes" -ForegroundColor Cyan
    Write-Host "Created: $($fileInfo.CreationTime)" -ForegroundColor Cyan
} else {
    Write-Host "[WARNING] Executable not found!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "To permanently add Wails to PATH, add this directory:" -ForegroundColor Yellow
Write-Host "$goPath\bin" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
