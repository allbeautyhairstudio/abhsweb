@echo off
title AI Marketing Reset Dashboard
echo.
echo ============================================
echo   AI Marketing Reset Dashboard
echo ============================================
echo.

:: Navigate to project directory
cd /d "%~dp0"

:: Check if node_modules exists
if not exist "node_modules" (
    echo [!] Dependencies not installed. Running setup first...
    echo.
    call setup.bat
    if %errorlevel% neq 0 exit /b 1
)

:: Create data directory if needed
if not exist "src\data" mkdir "src\data"

:: Start the dev server on port 3000
echo Starting dashboard on http://localhost:3000 ...
echo.
echo Press Ctrl+C to stop the server.
echo.

:: Open browser after a short delay (gives server time to start)
start "" cmd /c "timeout /t 3 /nobreak >nul && start msedge http://localhost:3000"

:: Run dev server (this blocks until Ctrl+C)
call npx next dev --port 3000
