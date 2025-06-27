@echo off
setlocal enabledelayedexpansion

REM Get GOPATH and set PATH
for /f "tokens=*" %%i in ('go env GOPATH') do set GOPATH=%%i
set PATH=%PATH%;%GOPATH%\bin

echo Checking Go environment...
go version
if %errorlevel% neq 0 (
    echo ERROR: Go is not installed or not in PATH
    pause
    exit /b 1
)

echo Checking Wails CLI...
where wails >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Wails CLI...
    go install github.com/wailsapp/wails/v2/cmd/wails@latest
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Wails CLI
        pause
        exit /b 1
    )
)

echo Building application...
wails build -platform windows/amd64
if %errorlevel% neq 0 (
    echo ERROR: Failed to build application
    pause
    exit /b 1
)

echo Build completed!
echo Executable location: build\bin\goask.exe
pause
