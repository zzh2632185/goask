@echo off
REM Add GOPATH\bin to PATH for current session
set PATH=%PATH%;C:\Users\Administrator\go\bin

echo Checking Go environment...
go version
if %errorlevel% neq 0 (
    echo ERROR: Go is not installed or not in PATH
    echo Please install Go first: https://golang.org/dl/
    pause
    exit /b 1
)

echo Checking Wails CLI...
wails version
if %errorlevel% neq 0 (
    echo Installing Wails CLI...
    go install github.com/wailsapp/wails/v2/cmd/wails@latest
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Wails CLI
        pause
        exit /b 1
    )
)

echo Installing frontend dependencies...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo Building application...
wails build -platform windows/amd64
if %errorlevel% neq 0 (
    echo ERROR: Failed to build application
    pause
    exit /b 1
)

echo Build completed!
echo Executable location: build\bin\goask-windows-amd64.exe
pause
