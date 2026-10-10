import React, { useState, useEffect } from 'react';
import { Terminal, Play, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Copy, Check, FileText } from 'lucide-react';
import { DeployerStep } from '../types';

export const DeployerSimulator: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const initialSteps: DeployerStep[] = [
    {
      id: 1,
      title: 'Administrator Privileges Check',
      description: 'Verifies script execution under elevated Windows Administrator token.',
      command: '[Security.Principal.WindowsIdentity]::GetCurrent().IsInRole("Administrator")',
      status: 'pending',
      log: [
        '>>> [STEP] Checking administrative privileges...',
        '    [OK] Elevated Administrator context confirmed.',
      ],
    },
    {
      id: 2,
      title: 'Locate Autodesk PowerMill Install',
      description: 'Auto-detects pmill.exe in C:\\Program Files\\Autodesk\\PowerMill *\\sys\\exec64\\.',
      command: 'Get-ChildItem -Path "C:\\Program Files\\Autodesk" -Filter "PowerMill*" -Directory',
      status: 'pending',
      log: [
        '>>> [STEP] Locating Autodesk PowerMill installation...',
        '    [OK] Found PowerMill at: C:\\Program Files\\Autodesk\\PowerMill 2024\\sys\\exec64\\pmill.exe',
        '    [OK] Version identified: 2024.1.2.64',
      ],
    },
    {
      id: 3,
      title: 'Process Lock Resolution',
      description: 'Terminates active pmill.exe instances to prevent assembly file locks.',
      command: 'Get-Process -Name "pmill" | Stop-Process -Force',
      status: 'pending',
      log: [
        '>>> [STEP] Checking for running PowerMill instances...',
        '    [OK] Workspace unlocked; no conflicting processes found.',
      ],
    },
    {
      id: 4,
      title: 'Developer Toolchain Discovery',
      description: 'Locates MSBuild.exe, tlbimp.exe, sn.exe, and regasm.exe via vswhere and Windows SDK.',
      command: '& "vswhere.exe" -latest -requires Microsoft.Component.MSBuild',
      status: 'pending',
      log: [
        '>>> [STEP] Resolving Windows SDK & Visual Studio toolchain...',
        '    [OK] MSBuild located: C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\MSBuild\\Current\\Bin\\MSBuild.exe',
        '    [OK] RegAsm located: C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\regasm.exe',
        '    [OK] tlbimp.exe & sn.exe found in Windows SDK NETFX 4.8 Tools.',
      ],
    },
    {
      id: 5,
      title: 'Generate Interop PowerMill.dll',
      description: 'Creates strong-named COM interop assembly matched to installed PowerMill version.',
      command: 'tlbimp.exe pmill.exe /out:lib\\PowerMill.dll /asmversion:2024.1.2.64 /keyfile:lib\\key_pair.snk',
      status: 'pending',
      log: [
        '>>> [STEP] Generating strong-named PowerMill COM Interop Assembly...',
        '    [OK] Generated strong-name key: key_pair.snk',
        '    [OK] tlbimp produced lib\\PowerMill.dll matching version 2024.1.2.64',
      ],
    },
    {
      id: 6,
      title: 'Stage PluginFramework.dll',
      description: 'Copies official Autodesk PluginFramework.dll from PowerMill distribution into lib\\.',
      command: 'Copy-Item "<PowerMill>\\file\\plugins\\framework\\PluginFramework40\\bin\\Release\\PluginFramework.dll" "lib\\"',
      status: 'pending',
      log: [
        '>>> [STEP] Staging PluginFramework.dll from PowerMill installation...',
        '    [OK] Copied PluginFramework.dll to lib\\',
      ],
    },
    {
      id: 7,
      title: 'Compile Plugin (MSBuild x64)',
      description: 'Builds MyPowerMillPlugin.sln with Configuration=Release and Platform=x64.',
      command: 'MSBuild.exe MyPowerMillPlugin.csproj /p:Configuration=Release /p:Platform=x64 /v:minimal',
      status: 'pending',
      log: [
        '>>> [STEP] Compiling MyPowerMillPlugin (Release | x64)...',
        '    MyPowerMillPlugin -> bin\\x64\\Release\\MyPowerMillPlugin.dll',
        '    [OK] Compilation succeeded with 0 errors.',
      ],
    },
    {
      id: 8,
      title: 'COM Registration (regasm.exe)',
      description: 'Registers the .NET assembly in COM with codebase attribute.',
      command: 'regasm.exe bin\\x64\\Release\\MyPowerMillPlugin.dll /register /codebase /tlb',
      status: 'pending',
      log: [
        '>>> [STEP] Registering COM assembly via regasm.exe...',
        '    [OK] Types registered successfully in COM catalog.',
      ],
    },
    {
      id: 9,
      title: 'Inject HKCR Category Link',
      description: 'Adds GUID {64fb7b2a-7526-4aaf-a8c8-ab7593a09d37} into PowerMill Category {311b0135-1826-4a8c-98de-f313289f815e}.',
      command: 'reg.exe ADD "HKCR\\CLSID\\{64fb7b2a-...}\\Implemented Categories\\{311b0135-...}" /reg:64 /f',
      status: 'pending',
      log: [
        '>>> [STEP] Linking PowerMill plugin category in Windows Registry...',
        '    [OK] The operation completed successfully (HKCR\\CLSID linked).',
      ],
    },
    {
      id: 10,
      title: 'Launch Autodesk PowerMill',
      description: 'Starts pmill.exe with the plugin immediately accessible in Plugin Manager.',
      command: 'Start-Process -FilePath "C:\\Program Files\\Autodesk\\PowerMill 2024\\sys\\exec64\\pmill.exe"',
      status: 'pending',
      log: [
        '>>> [STEP] Launching Autodesk PowerMill with active plugin...',
        '    [OK] PowerMill launched successfully! Status: Active & Enabled.',
        '============================================================',
        '  DEPLOYMENT COMPLETE - ENJOY RAPID CAM ITERATION!          ',
        '============================================================',
      ],
    },
  ];

  const [steps, setSteps] = useState<DeployerStep[]>(initialSteps);

  const runSimulation = () => {
    setIsRunning(true);
    setCurrentStepIndex(0);
    setSteps(initialSteps.map((s) => ({ ...s, status: 'pending' })));
  };

  useEffect(() => {
    if (!isRunning || currentStepIndex < 0) return;

    if (currentStepIndex >= steps.length) {
      setIsRunning(false);
      return;
    }

    // Set current step to running
    setSteps((prev) =>
      prev.map((step, idx) =>
        idx === currentStepIndex ? { ...step, status: 'running' } : step
      )
    );

    const timer = setTimeout(() => {
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === currentStepIndex ? { ...step, status: 'success' } : step
        )
      );
      setCurrentStepIndex((prev) => prev + 1);
    }, 600);

    return () => clearTimeout(timer);
  }, [isRunning, currentStepIndex]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-semibold mb-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>Layer 4 Deployer: deployer/Install.ps1</span>
            </div>
            <h2 className="text-xl font-bold text-white">One-Click Deployer Simulation Engine</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Double-clicking <code className="text-emerald-300 font-mono">Install.bat</code> triggers this automated sequence. It handles elevation, PowerMill path resolution, COM interop generation, compilation, regasm registration, and launches PowerMill with zero manual steps.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-lg ${
                isRunning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
              }`}
            >
              {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? 'Deploying Pipeline...' : 'Run Deployer Simulation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Stepper & Console Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 10 Steps */}
        <div className="lg:col-span-6 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Automated Deployment Pipeline (10 Steps)
          </h3>

          <div className="space-y-2">
            {steps.map((step, idx) => {
              const isCurrent = currentStepIndex === idx && isRunning;
              return (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-xl border transition-all duration-200 ${
                    step.status === 'success'
                      ? 'bg-slate-900/90 border-emerald-500/40'
                      : isCurrent
                      ? 'bg-slate-850 border-cyan-400 shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {step.status === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isCurrent ? (
                          <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                            {step.id}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">Step {step.id}: {step.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{step.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(step.command, `step-${step.id}`)}
                      className="text-slate-500 hover:text-cyan-400 transition p-1"
                      title="Copy PowerShell command"
                    >
                      {copiedCmd === `step-${step.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="mt-2 text-[10px] font-mono text-cyan-400/90 bg-slate-950 p-1.5 rounded border border-slate-800/80 truncate">
                    {step.command}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live PowerShell Console Output */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live PowerShell Terminal Output (Host: Windows 64-bit)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              $ErrorActionPreference = "Stop"
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs h-[640px] overflow-y-auto space-y-2 shadow-2xl relative">
            <div className="text-slate-500 pb-2 border-b border-slate-800 text-[11px]">
              PowerShell 7.4 / Windows PowerShell 5.1 — Admin Console
            </div>

            <div className="text-indigo-400 font-bold">
              ============================================================<br />
              &nbsp;&nbsp;AUTODESK POWERMILL ONE-CLICK PLUGIN DEPLOYMENT ENGINE<br />
              ============================================================
            </div>

            {steps
              .filter((s) => s.status === 'success' || (s.status === 'running'))
              .map((s) => (
                <div key={s.id} className="space-y-1 animate-in fade-in duration-100">
                  {s.log.map((line, lIdx) => (
                    <div
                      key={lIdx}
                      className={
                        line.includes('[OK]')
                          ? 'text-emerald-400'
                          : line.includes('[STEP]')
                          ? 'text-cyan-400 font-bold'
                          : line.includes('DEPLOYMENT COMPLETE')
                          ? 'text-emerald-300 font-bold'
                          : 'text-slate-400'
                      }
                    >
                      {line}
                    </div>
                  ))}
                </div>
              ))}

            {currentStepIndex >= steps.length && (
              <div className="pt-4 text-emerald-400 font-bold">
                PS C:\&gt; _
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
