@echo off
:: ============================================================================
:: One-Click Local Build & Run for PowerMill Plugin System
:: Automatically builds all components and runs the application locally
:: ============================================================================

setlocal EnableDelayedExpansion
title PowerMill Local Build and Run

echo ==================================================================
echo   PowerMill Plugin System - Local One-Click Build ^& Run
echo ==================================================================
echo.

:: Check if user wants PowerMill Native Windows Plugin OR Local Web Studio
echo Select what you want to build and run locally:
echo   [1] PowerMill Windows Plugin (Build C# .NET + COM Register + Launch PowerMill)
echo   [2] Local Web Studio (npm install + build + run on http://localhost:3000)
echo   [3] Build Both
echo.
set /p CHOICE="Enter choice [1, 2, or 3] (Default: 1): "

if "%CHOICE%"=="" set CHOICE=1

if "%CHOICE%"=="2" goto RunWebStudio
if "%CHOICE%"=="3" goto RunBoth

:RunPowerMillPlugin
echo.
echo >>> [BUILD] Launching PowerMill One-Click Deployer...
cd /d "%~dp0deployer"
call "%~dp0deployer\Install.bat"
goto End

:RunWebStudio
echo.
echo >>> [BUILD] Installing Node dependencies and building Web Studio...
cd /d "%~dp0"
call npm install
call npm run build
echo.
echo >>> [RUN] Launching local Web Studio on port 3000...
start http://localhost:3000
call npm run dev
goto End

:RunBoth
echo.
echo >>> [BUILD 1/2] Building and deploying PowerMill Native Plugin...
cd /d "%~dp0deployer"
call "%~dp0deployer\Install.bat"

echo.
echo >>> [BUILD 2/2] Building and launching Local Web Studio...
cd /d "%~dp0"
call npm install
call npm run build
start http://localhost:3000
call npm run dev

:End
pause
