<#
.SYNOPSIS
    PowerMill One-Click Plugin Deployer
.DESCRIPTION
    Automates the complete setup, compilation, COM registration,
    and launch of the custom PowerMill ML Plugin.
#>

[CmdletBinding()]
param(
    [string]$Configuration = "Release",
    [string]$Platform = "x64",
    [string]$CadFilePath = $null,
    [switch]$SkipLaunch
)

$ErrorActionPreference = "Stop"
$PluginGuid = "{64fb7b2a-7526-4aaf-a8c8-ab7593a09d37}"
$PowerMillCategoryGuid = "{311b0135-1826-4a8c-98de-f313289f815e}"

function Write-Step {
    param([string]$Message)
    Write-Host "`n>>> [STEP] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "    [OK] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "    [WARN] $Message" -ForegroundColor Yellow
}

function Write-Fail {
    param([string]$Message)
    Write-Host "`n[FATAL ERROR] $Message" -ForegroundColor Red
    exit 1
}

Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "  AUTODESK POWERMILL ONE-CLICK PLUGIN DEPLOYMENT ENGINE     " -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta

# 1. Admin Rights Check
Write-Step "Checking administrative privileges..."
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Fail "This script requires Administrator privileges for COM registration and registry modification."
}
Write-Success "Elevated Administrator context confirmed."

# 2. Locate Autodesk PowerMill Installation
Write-Step "Locating Autodesk PowerMill installation..."
$rootBase = "C:\Program Files\Autodesk"
$pmillDirs = Get-ChildItem -Path $rootBase -Filter "PowerMill*" -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending

$powerMillExecDir = $null
$powerMillExePath = $null
$powerMillVersion = $null

foreach ($dir in $pmillDirs) {
    $testExec = Join-Path $dir.FullName "sys\exec64\pmill.exe"
    if (Test-Path $testExec) {
        $powerMillExecDir = Join-Path $dir.FullName "sys\exec64"
        $powerMillExePath = $testExec
        $powerMillRoot = $dir.FullName
        $versionInfo = (Get-Item $testExec).VersionInfo
        $powerMillVersion = "$($versionInfo.FileMajorPart).$($versionInfo.FileMinorPart).$($versionInfo.FileBuildPart)"
        break
    }
}

if (-not $powerMillExePath) {
    Write-Fail "No Autodesk PowerMill installation found in '$rootBase'. Please ensure PowerMill is installed."
}
Write-Success "Found PowerMill at: $powerMillExePath (Version: $powerMillVersion)"

# 3. Terminate running PowerMill process to prevent DLL locks
Write-Step "Checking for running PowerMill instances..."
$runningProcesses = Get-Process -Name "pmill" -ErrorAction SilentlyContinue
if ($runningProcesses) {
    Write-Warn "PowerMill is currently running. Terminating process to release locked plugin assemblies..."
    $runningProcesses | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Success "Running PowerMill instance terminated."
} else {
    Write-Success "No active PowerMill process found. Workspace is unlocked."
}

# 4. Resolve Developer Tools (MSBuild, tlbimp, sn, regasm)
Write-Step "Resolving Windows SDK & Visual Studio toolchain..."

# Resolve MSBuild
$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
$msbuildPath = $null
if (Test-Path $vswhere) {
    $vsPath = & $vswhere -latest -products * -requires Microsoft.Component.MSBuild -property installationPath
    if ($vsPath) {
        $msbuildCandidate = Join-Path $vsPath "MSBuild\Current\Bin\MSBuild.exe"
        if (Test-Path $msbuildCandidate) { $msbuildPath = $msbuildCandidate }
    }
}
if (-not $msbuildPath) {
    $candidates = @(
        "C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe",
        "C:\Program Files\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\MSBuild.exe",
        "C:\Program Files\Microsoft Visual Studio\2022\Enterprise\MSBuild\Current\Bin\MSBuild.exe",
        "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin\MSBuild.exe",
        "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\MSBuild.exe"
    )
    foreach ($cand in $candidates) {
        if (Test-Path $cand) { $msbuildPath = $cand; break }
    }
}
if (-not $msbuildPath) {
    Write-Fail "MSBuild.exe could not be found. Please install Visual Studio 2022 or VS Build Tools with .NET 4.8 targeting pack."
}
Write-Success "MSBuild located: $msbuildPath"

# Resolve RegAsm
$regasmPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\regasm.exe"
if (-not (Test-Path $regasmPath)) {
    Write-Fail "regasm.exe (64-bit .NET 4.0) not found at: $regasmPath"
}
Write-Success "RegAsm located: $regasmPath"

# Resolve tlbimp.exe and sn.exe from Windows SDK
$sdkPaths = @(
    "C:\Program Files (x86)\Microsoft SDKs\Windows\v10.0A\bin\NETFX 4.8 Tools\x64",
    "C:\Program Files (x86)\Microsoft SDKs\Windows\v10.0A\bin\NETFX 4.8 Tools",
    "C:\Program Files (x86)\Microsoft SDKs\Windows\v10.0A\bin\NETFX 4.7.2 Tools\x64",
    "C:\Program Files (x86)\Microsoft SDKs\Windows\v7.0A\bin\x64",
    "C:\Program Files (x86)\Microsoft SDKs\Windows\v7.0A\bin"
)

$tlbimpPath = $null
$snPath = $null

foreach ($sdk in $sdkPaths) {
    $tlb = Join-Path $sdk "tlbimp.exe"
    $sn = Join-Path $sdk "sn.exe"
    if ((Test-Path $tlb) -and (-not $tlbimpPath)) { $tlbimpPath = $tlb }
    if ((Test-Path $sn) -and (-not $snPath)) { $snPath = $sn }
}

# 5. Prepare Output Directories & Interop Libraries
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$libDir = Join-Path $repoRoot "plugin\MyPowerMillPlugin\lib"
$pluginProject = Join-Path $repoRoot "plugin\MyPowerMillPlugin\MyPowerMillPlugin.csproj"

if (-not (Test-Path $libDir)) {
    New-Item -ItemType Directory -Path $libDir -Force | Out-Null
}

# Copy PluginFramework.dll
Write-Step "Staging PluginFramework.dll from PowerMill installation..."
$pluginFrameworkSource = Join-Path $powerMillRoot "file\plugins\framework\PluginFramework40\bin\Release\PluginFramework.dll"
if (-not (Test-Path $pluginFrameworkSource)) {
    $pluginFrameworkSource = Join-Path $powerMillRoot "file\plugins\framework\PluginFramework40\bin\PluginFramework.dll"
}
$targetFrameworkDll = Join-Path $libDir "PluginFramework.dll"
if (Test-Path $pluginFrameworkSource) {
    Copy-Item -Path $pluginFrameworkSource -Destination $targetFrameworkDll -Force
    Write-Success "Copied PluginFramework.dll to lib\"
} else {
    Write-Warn "Could not locate PluginFramework.dll in PowerMill distribution. Verifying existing stub in lib\..."
    if (-not (Test-Path $targetFrameworkDll)) {
        Write-Fail "Missing PluginFramework.dll at $pluginFrameworkSource."
    }
}

# Generate PowerMill.dll via tlbimp
Write-Step "Generating strong-named PowerMill COM Interop Assembly..."
$keyPairPath = Join-Path $libDir "key_pair.snk"
if (-not (Test-Path $keyPairPath) -and $snPath) {
    & $snPath -k $keyPairPath
    Write-Success "Created strong-name key: key_pair.snk"
}

$targetPowerMillDll = Join-Path $libDir "PowerMill.dll"
if ($tlbimpPath -and (Test-Path $powerMillExePath)) {
    $argsTlb = @(
        $powerMillExePath,
        "/out:$targetPowerMillDll",
        "/asmversion:$powerMillVersion"
    )
    if (Test-Path $keyPairPath) {
        $argsTlb += "/keyfile:$keyPairPath"
    }
    
    & $tlbimpPath $argsTlb
    if (-not (Test-Path $targetPowerMillDll)) {
        Write-Fail "tlbimp failed to generate PowerMill.dll interop assembly."
    }
    Write-Success "Generated PowerMill.dll matching version $powerMillVersion"
} else {
    if (Test-Path $targetPowerMillDll) {
        Write-Warn "Using existing PowerMill.dll in lib\ folder (tlbimp or SDK not available)."
    } else {
        Write-Fail "Cannot find tlbimp.exe to generate PowerMill.dll from pmill.exe."
    }
}

# 6. Build Plugin with MSBuild
Write-Step "Compiling MyPowerMillPlugin ($Configuration | $Platform)..."
$buildArgs = @(
    $pluginProject,
    "/p:Configuration=$Configuration",
    "/p:Platform=$Platform",
    "/v:minimal",
    "/nologo"
)
& $msbuildPath $buildArgs
if ($LASTEXITCODE -ne 0) {
    Write-Fail "MSBuild failed to compile MyPowerMillPlugin. Please check compile errors above."
}
Write-Success "Compilation succeeded."

$outputDll = Join-Path $repoRoot "plugin\MyPowerMillPlugin\bin\$Platform\$Configuration\MyPowerMillPlugin.dll"
if (-not (Test-Path $outputDll)) {
    # Check without platform folder
    $outputDll = Join-Path $repoRoot "plugin\MyPowerMillPlugin\bin\$Configuration\MyPowerMillPlugin.dll"
}
if (-not (Test-Path $outputDll)) {
    Write-Fail "Built assembly not found at expected path: $outputDll"
}
Write-Success "Verified built binary: $outputDll"

# 7. COM Registration via RegAsm
Write-Step "Registering COM assembly via regasm.exe..."
& $regasmPath $outputDll /register /codebase /tlb
if ($LASTEXITCODE -ne 0) {
    Write-Fail "regasm.exe failed to register $outputDll."
}
Write-Success "COM registration successful."

# 8. Register Category in Windows Registry
Write-Step "Linking PowerMill plugin category in Windows Registry..."
$regPath = "HKCR\CLSID\$PluginGuid\Implemented Categories\$PowerMillCategoryGuid"
$regCmd = "reg.exe ADD `"$regPath`" /reg:64 /f"
cmd.exe /c $regCmd
if ($LASTEXITCODE -ne 0) {
    Write-Fail "Failed to add HKCR category link: $regPath"
}
Write-Success "Registered PowerMill plugin category in HKCR."

# 9. Detect Local CAD Files & Launch PowerMill
if (-not $SkipLaunch) {
    Write-Step "Detecting local CAD/AutoCAD/PowerMill files..."
    $targetCad = $CadFilePath
    if (-not $targetCad -or -not (Test-Path $targetCad)) {
        # Scan repo root and subfolders for CAD files
        $foundCad = Get-ChildItem -Path $repoRoot -Include "*.pmlprj","*.dwg","*.dxf","*.step","*.stp" -Recurse -File -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($foundCad) {
            $targetCad = $foundCad.FullName
            Write-Success "Auto-detected local CAD part: $targetCad"
        }
    }

    Write-Step "Launching Autodesk PowerMill with active plugin..."
    if ($targetCad -and (Test-Path $targetCad)) {
        Write-Success "Directly opening local CAD file: $targetCad"
        Start-Process -FilePath $powerMillExePath -ArgumentList "`"$targetCad`""
    } else {
        Start-Process -FilePath $powerMillExePath
    }
    Write-Success "PowerMill launched successfully! Your plugin is active under Options > Manage Installed Plugins."
} else {
    Write-Success "Plugin deployed. SkipLaunch was specified."
}

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE - ENJOY RAPID CAM ITERATION!          " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
