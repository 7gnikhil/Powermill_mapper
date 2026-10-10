@echo off
:: ============================================================================
:: PowerMill One-Click Plugin Installer Wrapper
:: Ensures Administrator privileges and launches PowerShell installer
:: ============================================================================

setlocal EnableDelayedExpansion
title PowerMill One-Click Plugin Deployer

echo ========================================================
echo   PowerMill One-Click Plugin Deployment System
echo ========================================================
echo.

:: Check for Administrative privileges
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [REQUEST] Requesting Administrative privileges...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

:: Run PowerShell deployment engine
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install.ps1"

if %errorLevel% NEQ 0 (
    echo.
    echo [ERROR] Deployment failed with exit code %errorLevel%.
    pause
    exit /b %errorLevel%
)

echo.
echo [SUCCESS] Plugin deployed and PowerMill launched!
echo You can close this window now.
timeout /t 5
