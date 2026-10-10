@echo off
:: ============================================================================
:: PowerMill Plugin Uninstaller
:: ============================================================================

setlocal
title PowerMill Plugin Uninstaller

echo ========================================================
echo   PowerMill Plugin Uninstaller
echo ========================================================

net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [REQUEST] Requesting Administrative privileges...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

set PluginGuid={64fb7b2a-7526-4aaf-a8c8-ab7593a09d37}
set PowerMillCategoryGuid={311b0135-1826-4a8c-98de-f313289f815e}
set RegAsm=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\regasm.exe
set TargetDll=%~dp0..\plugin\MyPowerMillPlugin\bin\x64\Release\MyPowerMillPlugin.dll

echo [1/2] Unregistering COM assembly...
if exist "%TargetDll%" (
    "%RegAsm%" "%TargetDll%" /unregister
)

echo [2/2] Removing Registry Category link...
reg.exe DELETE "HKCR\CLSID\%PluginGuid%\Implemented Categories\%PowerMillCategoryGuid%" /reg:64 /f >nul 2>&1
reg.exe DELETE "HKCR\CLSID\%PluginGuid%" /reg:64 /f >nul 2>&1

echo [SUCCESS] Plugin uninstalled from PowerMill!
pause
