# PowerMill One-Click Plugin System — Architecture Document

## Overview

This repository provides a production-grade four-layer architecture for building, integrating, and deploying Autodesk PowerMill C# plugins with embedded ONNX Machine Learning domain models, accompanied by a zero-configuration one-click installer.

```
┌────────────────────────────────────────────────────────────────────────┐
│  LAYER 4 — One-Click Deployer  (deployer/Install.ps1 & Install.bat)    │
│  Double-click Install.bat → Elevates to Admin → Detects PowerMill      │
│  → Closes pmill.exe (unlock DLL) → Generates strong-named PowerMill.dll│
│  via tlbimp.exe → Copies PluginFramework.dll → Builds Release|x64 via  │
│  MSBuild → Regasm COM registration → Injects HKCR category link       │
│  → Automatically launches PowerMill with plugin active.                │
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 3 — PowerMill Plugin Host  (plugin/MyPowerMillPlugin/)          │
│  .NET Framework 4.8 C# class library.                                 │
│  [ComVisible(true)], [Guid("64fb7b2a-7526-4aaf-a8c8-ab7593a09d37")]    │
│  Extends PluginFrameworkWithPanes, implements IPowerMILLPluginLicensable│
│  Registers custom WPF tabbed pane in register_panes().                │
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 2 — Domain Model Seam  (plugin/MyPowerMillPlugin/Model/)        │
│  IDomainModel abstraction + OnnxDomainModel implementation.            │
│  Extracts feature tensors (hole geometry, tool geometry, material ISO) │
│  Runs in-process ONNX Runtime (CPU/DirectML) against model.onnx.       │
│  Yields real-time CAM strategy, feed/speed, & peck cycle decisions.   │
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 1 — Autodesk PowerMill (Host Application)                       │
│  Supplies pmill.exe (type library), PluginFramework.dll, COM dispatch  │
│  automation server, and CAM toolpath execution engine.                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Layer Breakdown

### Layer 1: PowerMill Runtime & COM Automation Engine
- **Host Process**: `pmill.exe` located at `C:\Program Files\Autodesk\PowerMill <Year>\sys\exec64\pmill.exe`.
- **Type Library**: PowerMill exports its COM automation interface directly from `pmill.exe`.
- **SDK Assemblies**:
  - `PowerMill.dll`: Interop assembly generated using `tlbimp.exe` with a strong name key.
  - `PluginFramework.dll`: Located in `<PowerMill_Install>\file\plugins\framework\PluginFramework40\bin\Release\PluginFramework.dll`.

### Layer 2: Domain Model Seam (ML Inference Engine)
The ML layer decouples CAD/CAM feature extraction from model weights:
- **Interface**: `IDomainModel`
  - `ModelInferenceResult Predict(CAMFeatureVector features)`
  - `bool IsLoaded { get; }`
  - `void Reload(string modelPath)`
- **Implementation**: `OnnxDomainModel` using `Microsoft.ML.OnnxRuntime`.
- **Input Tensor**:
  - `[BatchSize, 8]`: `[Diameter_mm, Depth_mm, DiameterToDepthRatio, StepCount, MaterialHardness_HB, CutterDiameter_mm, FluteCount, Overhang_mm]`
- **Outputs**:
  - Classification: Hole category (`ThroughHole`, `BlindHole`, `Counterbore`, `Tapped`, `ComplexStepped`)
  - Strategy recommendation: Peck drilling, helical milling, or high-speed reaming
  - Optimal Surface Speed (Vc m/min) and Feed per tooth (fz mm/tooth)
  - Tool breakage / chatter risk score (0.0 to 1.0)
- **Zero-Recompile Model Swapping**: Updating `model.onnx` immediately updates PowerMill plugin behavior without recompiling the C# project.

### Layer 3: Plugin Host & UI Architecture
- **Target Framework**: .NET Framework 4.8, Platform `x64`.
- **GUID**: `64fb7b2a-7526-4aaf-a8c8-ab7593a09d37`
- **COM Category**: `311b0135-1826-4a8c-98de-f313289f815e` (PowerMill Plugins Category)
- **Panes UI**: Native WPF control hosted inside PowerMill's docked sidebar pane via `PluginFrameworkWithPanes`.
- **Automation Pipeline**: Interacts with PowerMill via `PowerMILL.Application` COM commands (e.g., `DoCommand("CREATE TOOLPATH ...")`).

### Layer 4: One-Click Deployer
The deployer automates the entire developer feedback loop. Re-running `Install.bat` allows zero-friction code iteration.

#### Execution Sequence:
1. **Admin Privileges Verification**: Checks for Windows Administrator token (required for HKCR registry write and COM registration).
2. **Path Discovery**: Scans `C:\Program Files\Autodesk\PowerMill *` to automatically find the latest installed version.
3. **Lock Release**: Checks if `pmill.exe` is running; if so, terminates or prompts to close it cleanly.
4. **Toolchain Verification**: Locates `MSBuild.exe`, `tlbimp.exe`, `sn.exe`, and `regasm.exe` via Visual Studio `vswhere.exe` or standard SDK paths.
5. **Interop Generation**: Runs `tlbimp.exe pmill.exe /keyfile:key_pair.snk /out:lib\PowerMill.dll /asmversion:<DetectedVersion>`.
6. **Assembly Staging**: Copies `PluginFramework.dll` from PowerMill's plugin framework directory into `lib\`.
7. **Compilation**: Invokes `MSBuild.exe MyPowerMillPlugin.sln /p:Configuration=Release /p:Platform=x64 /v:minimal`.
8. **COM Registration**: Runs `regasm.exe bin\x64\Release\MyPowerMillPlugin.dll /register /codebase`.
9. **Registry Linkage**: Writes registry key `HKCR\CLSID\{64fb7b2a-7526-4aaf-a8c8-ab7593a09d37}\Implemented Categories\{311b0135-1826-4a8c-98de-f313289f815e}`.
10. **Application Launch**: Launches PowerMill. The plugin is instantly listed under "Options > Manage Installed Plugins" with active green status.

---

## File Structure

```
├── ARCHITECTURE.md                  # Complete architectural specification
├── deployer/
│   ├── Install.bat                  # One-click Windows runner (UAC elevation wrapper)
│   ├── Install.ps1                  # Full deployment engine with error handling
│   └── Uninstall.bat                # Clean removal script
├── plugin/
│   ├── MyPowerMillPlugin/
│   │   ├── Model/
│   │   │   ├── IDomainModel.cs           # Seam interface
│   │   │   ├── OnnxDomainModel.cs        # ONNX Runtime loader & evaluator
│   │   │   ├── CAMFeatureVector.cs       # Input feature schema
│   │   │   ├── ModelInferenceResult.cs   # Output decision schema
│   │   │   └── model.onnx                # Domain model weights
│   │   ├── UI/
│   │   │   ├── PluginPaneWPF.xaml        # Docked WPF user control
│   │   │   └── PluginPaneWPF.xaml.cs     # WPF code-behind
│   │   ├── PluginMain.cs                 # COM entry point [Guid("64fb7b2a-...")]
│   │   ├── PowerMillBridge.cs            # PowerMILL.Application helper
│   │   ├── MyPowerMillPlugin.csproj      # .NET 4.8 x64 project
│   │   └── packages.config               # Microsoft.ML.OnnxRuntime reference
│   └── MyPowerMillPlugin.sln             # Visual Studio Solution
```
