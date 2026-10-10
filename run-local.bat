@echo off
:: ============================================================================
:: Instant Local Runner
:: Directly builds files and runs the app on your local machine
:: ============================================================================

setlocal
cd /d "%~dp0"
title PowerMill Local Direct Runner

:: Check and request Windows Administrator Permissions automatically
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [PERMISSIONS] Requesting Windows Administrator privileges...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo =======================================================
echo   Direct Local Build ^& Run (Administrator Mode)
echo =======================================================
echo.

:: 1. If PowerMill is installed locally on this machine, deploy the plugin directly:
if exist "C:\Program Files\Autodesk" (
    echo [DETECTED] Autodesk software found on local machine.
    echo Running PowerMill plugin build ^& registration in background...
    start "" /b cmd /c "call %~dp0deployer\Install.bat"
)

:: 2. Build and launch local web interface:
echo [1/2] Verifying npm dependencies...
call npm install --no-audit --no-fund

echo.
echo [2/2] Building project files...
call npm run build

echo.
echo [READY] Opening http://localhost:3000 in your browser...
start http://localhost:3000

echo.
echo [RUNNING] Starting local server...
call npm run dev
