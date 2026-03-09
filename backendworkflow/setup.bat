@echo off
title AI Marketing Reset Dashboard - First Time Setup
echo.
echo ============================================
echo   AI Marketing Reset Dashboard - Setup
echo ============================================
echo.

:: Check Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Show Node version
echo [OK] Node.js found:
node --version
echo.

:: Navigate to project directory
cd /d "%~dp0"

:: Install dependencies
echo Installing dependencies...
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] npm install failed. Check your internet connection and try again.
    pause
    exit /b 1
)
echo.
echo [OK] Dependencies installed.
echo.

:: Build the project
echo Building the dashboard...
echo.
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed. Check the errors above.
    pause
    exit /b 1
)
echo.
echo [OK] Dashboard built successfully.
echo.

:: Create data directory if it doesn't exist
if not exist "src\data" (
    mkdir "src\data"
    echo [OK] Created data directory.
) else (
    echo [OK] Data directory already exists.
)
echo.

echo ============================================
echo   Setup complete!
echo.
echo   To start the dashboard, double-click:
echo   start-dashboard.bat
echo ============================================
echo.
pause
