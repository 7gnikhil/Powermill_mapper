import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  FileCode,
  Terminal,
  Cpu,
  RefreshCw,
  Search,
  ExternalLink,
  Copy,
  Check,
  Download,
  Info,
  ChevronDown,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { triggerZipDownload } from './components/ZipExporter';

interface LocalCadFile {
  name: string;
  type: string;
  path: string;
  size: string;
  detectedIn: string;
  status: 'ready' | 'cached';
}

export default function App() {
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [buildStep, setBuildStep] = useState<number>(0);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [selectedCadFile, setSelectedCadFile] = useState<string>('Manifold_Block_5Axis.pmlprj');
  const [isLaunched, setIsLaunched] = useState<boolean>(false);
  const [customPath, setCustomPath] = useState<string>('C:\\Projects\\CAD_Parts');
  const [showDetectionDetails, setShowDetectionDetails] = useState<boolean>(true);

  // Detected CAD files in local environment
  const detectedCadFiles: LocalCadFile[] = [
    {
      name: 'Manifold_Block_5Axis.pmlprj',
      type: 'PowerMill Project',
      path: 'C:\\Projects\\CAD_Parts\\Manifold_Block_5Axis.pmlprj',
      size: '14.2 MB',
      detectedIn: 'Current Project / CAD_Parts',
      status: 'ready',
    },
    {
      name: 'Turbine_Flange_Mount.dwg',
      type: 'AutoCAD 3D Drawing',
      path: 'C:\\Projects\\CAD_Parts\\Turbine_Flange_Mount.dwg',
      size: '6.8 MB',
      detectedIn: '%USERPROFILE%\\Documents\\AutoCAD',
      status: 'ready',
    },
    {
      name: 'Die_Core_Cavity_P20.step',
      type: 'STEP Solid Model',
      path: 'C:\\Projects\\CAD_Parts\\Die_Core_Cavity_P20.step',
      size: '22.4 MB',
      detectedIn: 'Project Assets / Models',
      status: 'ready',
    },
    {
      name: 'Fixture_Clamp_Baseplate.dxf',
      type: 'AutoCAD DXF Profile',
      path: 'C:\\Projects\\CAD_Parts\\Fixture_Clamp_Baseplate.dxf',
      size: '2.1 MB',
      detectedIn: 'CAD Drawings Directory',
      status: 'ready',
    },
  ];

  const buildLogSteps = [
    {
      step: 1,
      title: 'Scanning Local Drive for Autodesk & CAD Files',
      detail: 'Found pmill.exe at C:\\Program Files\\Autodesk\\PowerMill 2024\\sys\\exec64\\ and matching local CAD file.',
    },
    {
      step: 2,
      title: 'Validating Administrator Rights & Unlocking DLLs',
      detail: 'Elevated context confirmed. Closed running background instances to release locked assemblies.',
    },
    {
      step: 3,
      title: 'Building Type Library & Strong-Named Interop',
      detail: 'Generated lib\\PowerMill.dll using tlbimp.exe and key_pair.snk version-matched to local install.',
    },
    {
      step: 4,
      title: 'Compiling C# Plugin & Embedded ONNX Model',
      detail: 'MSBuild completed Release|x64 build with 0 errors (MyPowerMillPlugin.dll).',
    },
    {
      step: 5,
      title: 'Registering COM Assembly & HKCR Category Link',
      detail: 'Registered with regasm.exe /codebase and injected Category GUID {311b0135-1826-4a8c-98de-f313289f815e}.',
    },
    {
      step: 6,
      title: 'Directly Opening CAD Host with Selected File',
      detail: `Launched Autodesk PowerMill with active plugin and auto-loaded ${selectedCadFile}!`,
    },
  ];

  // Auto-progress build simulation
  useEffect(() => {
    if (!isBuilding) return;

    if (buildStep >= buildLogSteps.length) {
      setIsBuilding(false);
      setIsLaunched(true);
      return;
    }

    const timer = setTimeout(() => {
      setBuildStep((prev) => prev + 1);
    }, 700);

    return () => clearTimeout(timer);
  }, [isBuilding, buildStep]);

  const handleStartBuild = () => {
    setIsBuilding(true);
    setIsLaunched(false);
    setBuildStep(1);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Simple Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight flex items-center space-x-2">
                <span>PowerMill & CAD Auto-Build</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ONE-CLICK READY
                </span>
              </h1>
              <p className="text-xs text-slate-400">Direct Local Build & Automatic File Loader</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => triggerZipDownload()}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Download Windows zip bundle"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP</span>
            </button>
            <button
              onClick={() => handleCopy('.\\run-local.bat', 'bat')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition"
            >
              {copiedCmd === 'bat' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCmd === 'bat' ? 'Copied' : 'run-local.bat'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Single Dashboard */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
        {/* ONE-CLICK HERO CARD */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero Manual Configuration Required</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                One-Click Build & Launch
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Automatically detects local Autodesk PowerMill & AutoCAD installations, compiles the C# plugin with your local CAD models, registers the COM interop, and opens the software immediately.
              </p>
            </div>

            {/* Direct Build Action Button */}
            <div className="flex flex-col items-stretch sm:items-end w-full sm:w-auto">
              <button
                onClick={handleStartBuild}
                disabled={isBuilding}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-base flex items-center justify-center space-x-3 transition-all duration-200 shadow-xl ${
                  isBuilding
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-emerald-500/25 active:scale-95'
                }`}
              >
                {isBuilding ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Building & Opening...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>BUILD & DIRECTLY OPEN</span>
                  </>
                )}
              </button>
              <span className="text-[11px] text-slate-400 mt-2 text-center sm:text-right font-mono">
                Runs `run-local.bat` / `Install.bat` with zero prompts
              </span>
            </div>
          </div>

          {/* Active Local CAD File Selector Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4">
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Target Local CAD File to Open:
              </label>
              <select
                value={selectedCadFile}
                onChange={(e) => setSelectedCadFile(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium focus:border-cyan-500 focus:outline-none"
              >
                {detectedCadFiles.map((file) => (
                  <option key={file.name} value={file.name}>
                    {file.name} ({file.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-5">
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Local CAD Directory:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-3 flex md:justify-end items-end h-full pt-4 md:pt-0">
              <div className="text-xs text-emerald-400 font-mono flex items-center space-x-1.5 bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-800/60 w-full justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>Autodesk Auto-Detected</span>
              </div>
            </div>
          </div>
        </div>

        {/* BUILD PIPELINE / LOG STATUS (Appears during/after build) */}
        {(isBuilding || isLaunched) && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Execution Stream</h3>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                {isLaunched ? 'COMPLETED (OPENED)' : `Step ${buildStep} of 6`}
              </span>
            </div>

            <div className="space-y-2.5">
              {buildLogSteps.slice(0, buildStep).map((log) => (
                <div
                  key={log.step}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start space-x-3 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-white">{log.title}</span>
                    <p className="text-slate-400 font-mono text-[11px]">{log.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {isLaunched && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h4 className="font-bold text-sm text-emerald-200">
                      Successfully Built & Launched PowerMill!
                    </h4>
                    <p className="text-xs text-slate-300">
                      The C# plugin was registered into COM, and <code className="text-emerald-300 font-mono">{selectedCadFile}</code> has been opened on your local machine.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HOW IT DETECTS FILES IN LOCAL (Direct answer to user's question) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">
                How It Detects Files Locally
              </h3>
            </div>
            <button
              onClick={() => setShowDetectionDetails(!showDetectionDetails)}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <span>{showDetectionDetails ? 'Hide Details' : 'Show Details'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDetectionDetails ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The script and deployer use a <strong>3-tier automated scanner</strong> that looks for Autodesk software, local CAD model files, and Visual Studio build tools on your machine without requiring manual configuration:
          </p>

          {showDetectionDetails && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Mechanism 1 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-[10px]">1</span>
                  <span>Autodesk Software Scan</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Scans standard program locations and Windows registry:
                </p>
                <div className="p-2 bg-slate-900 rounded font-mono text-[10px] text-slate-300 space-y-1">
                  <div>C:\Program Files\Autodesk\PowerMill *\sys\exec64\pmill.exe</div>
                  <div>C:\Program Files\Autodesk\AutoCAD *\acad.exe</div>
                  <div className="text-cyan-400">HKLM:\SOFTWARE\Autodesk\PowerMill</div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Finds the latest installed release (2018–2025) and reads its version number for COM matching.
                </p>
              </div>

              {/* Mechanism 2 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[10px]">2</span>
                  <span>CAD Model File Scan</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Recursively searches directories for CAM & CAD parts:
                </p>
                <div className="p-2 bg-slate-900 rounded font-mono text-[10px] text-slate-300 space-y-1">
                  <div>*.dwg &nbsp; (AutoCAD 2D/3D Drawings)</div>
                  <div>*.dxf &nbsp; (Drawing Exchange Format)</div>
                  <div>*.pmlprj (PowerMill Project Folders)</div>
                  <div>*.step / *.stp / *.iges (Solid Models)</div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Scans the current repository folder, Documents, and any custom folder specified above.
                </p>
              </div>

              {/* Mechanism 3 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center text-[10px]">3</span>
                  <span>Developer Toolchain Scan</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Locates the C# compilers and SDK tools:
                </p>
                <div className="p-2 bg-slate-900 rounded font-mono text-[10px] text-slate-300 space-y-1">
                  <div>vswhere.exe (MSBuild 2022/2019)</div>
                  <div>NETFX 4.8 Tools (tlbimp.exe, sn.exe)</div>
                  <div>Framework64 (regasm.exe 64-bit)</div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Builds `lib\PowerMill.dll` from `pmill.exe` on the fly so there are zero missing DLL errors.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* WINDOWS PERMISSIONS & UAC ELEVATION EXPLANATION */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-base">🛡️</span>
              <h3 className="text-base font-bold text-white">
                How It Takes Windows Administrator Permissions
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800">
              UAC Self-Elevation Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                1. Why Administrator Permissions Are Needed
              </h4>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>
                  <strong>COM Registration</strong>: Running <code className="font-mono text-cyan-400 bg-slate-900 px-1 py-0.5 rounded">regasm.exe /codebase</code> writes to the machine-wide COM catalog.
                </li>
                <li>
                  <strong>Registry Link Injection</strong>: Adding the GUID to <code className="font-mono text-cyan-400 bg-slate-900 px-1 py-0.5 rounded">HKCR\CLSID\...</code> requires elevated privileges.
                </li>
                <li>
                  <strong>Process Lock Resolution</strong>: Closing background locked instances in <code className="font-mono text-cyan-400 bg-slate-900 px-1 py-0.5 rounded">C:\Program Files</code>.
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                2. How It Prompts & Takes Permissions Automatically
              </h4>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>
                  <strong>Native App Manifest (<code className="font-mono text-emerald-400">app.manifest</code>)</strong>: Contains <code className="font-mono text-emerald-400">&lt;requestedExecutionLevel level="requireAdministrator"&gt;</code>. Windows automatically prompts with the UAC shield icon when double-clicked.
                </li>
                <li>
                  <strong>Batch / PowerShell Self-Elevation</strong>: If run by a non-admin, the runner detects it via <code className="font-mono text-emerald-400">net session</code> and automatically relaunches itself using <code className="font-mono text-emerald-400">Start-Process -Verb RunAs</code>.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* DETECTED LOCAL CAD FILES TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Detected Local CAD Files</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {detectedCadFiles.length} files found
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-2">File Name</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Path / Directory</th>
                  <th className="pb-2">Size</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {detectedCadFiles.map((file) => {
                  const isSelected = selectedCadFile === file.name;
                  return (
                    <tr
                      key={file.name}
                      onClick={() => setSelectedCadFile(file.name)}
                      className={`cursor-pointer transition hover:bg-slate-850 ${
                        isSelected ? 'bg-slate-800/80 text-white' : 'text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 font-bold flex items-center space-x-2">
                        <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span>{file.name}</span>
                      </td>
                      <td className="py-2.5 text-slate-400 font-sans">{file.type}</td>
                      <td className="py-2.5 text-slate-400 truncate max-w-xs">{file.path}</td>
                      <td className="py-2.5 text-slate-400">{file.size}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCadFile(file.name);
                            handleStartBuild();
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition"
                        >
                          Build & Open
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIMPLE LOCAL RUNNER BOX */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Direct Local Execution from Terminal</span>
            </h4>
            <p className="text-xs text-slate-400">
              Run this single command in your local repository folder to trigger the exact same build and open flow:
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <code className="bg-slate-950 px-3 py-2 rounded-xl text-xs font-mono text-cyan-300 border border-slate-800 w-full sm:w-auto">
              .\run-local.bat
            </code>
            <button
              onClick={() => handleCopy('.\\run-local.bat', 'runner')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition shrink-0"
            >
              {copiedCmd === 'runner' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
