import React, { useState } from 'react';
import { Layers, Terminal, Cpu, Monitor, ArrowDown, ArrowUp, CheckCircle, FileCode, Play, ShieldCheck, Box, RefreshCw } from 'lucide-react';

interface LayerArchitectureViewProps {
  onSelectLayer: (layerKey: string) => void;
}

export const LayerArchitectureView: React.FC<LayerArchitectureViewProps> = ({ onSelectLayer }) => {
  const [selectedLayer, setSelectedLayer] = useState<number>(4);

  const layers = [
    {
      id: 4,
      name: 'LAYER 4 — One-Click Deployer',
      subtitle: 'deployer/Install.ps1 & Install.bat',
      role: 'Zero-Configuration Automation',
      description:
        'A battle-hardened Windows PowerShell engine wrapped in an auto-elevating UAC batch script. Executes the complete toolchain: admin verification, pmill.exe discovery, DLL unlock, tlbimp COM generation, MSBuild x64 compilation, regasm registration, HKCR category injection, and PowerMill launch.',
      files: ['deployer/Install.bat', 'deployer/Install.ps1', 'deployer/Uninstall.bat'],
      badge: 'PowerShell / Batch',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      actionKey: 'deployer',
      details: [
        'UAC Elevation: Requests Windows Administrator token automatically.',
        'Process Killer: Cleanly terminates pmill.exe to unlock assemblies.',
        'Interop Builder: Runs tlbimp.exe with strong-name key pair.',
        'Registry Ingestion: Links {64fb7b2a-7526-4aaf-a8c8-ab7593a09d37} to PowerMill Category {311b0135-1826-4a8c-98de-f313289f815e}.',
      ],
    },
    {
      id: 3,
      name: 'LAYER 3 — PowerMill Plugin Host',
      subtitle: 'plugin/MyPowerMillPlugin/ (C# .NET 4.8)',
      role: 'COM Interop & WPF Docked Panes',
      description:
        'Production C# assembly implementing Autodesk PowerMILL.IPowerMILLPluginLicensable and inheriting from Autodesk.PluginFramework.Panes.PluginFrameworkWithPanes. Hosts responsive XAML WPF panes inside PowerMill’s native tool dock and drives PowerMill via DoCommand().',
      files: ['plugin/MyPowerMillPlugin/PluginMain.cs', 'plugin/MyPowerMillPlugin/UI/PluginPaneWPF.xaml', 'plugin/MyPowerMillPlugin/UI/PluginPaneWPF.xaml.cs'],
      badge: 'C# .NET 4.8 / WPF',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      actionKey: 'panes-studio',
      details: [
        'ComVisible(true) with static GUID registered in Windows HKCR.',
        'WPF ElementHost embedding for native PowerMill dock palettes.',
        'PowerMill API DoCommand() macro dispatch pipeline.',
        'Event-driven communication with Domain Model seam.',
      ],
    },
    {
      id: 2,
      name: 'LAYER 2 — Domain Model Seam',
      subtitle: 'plugin/MyPowerMillPlugin/Model/ (IDomainModel)',
      role: 'Decoupled Machine Learning Inference',
      description:
        'Strict seam interface (IDomainModel) wrapping Microsoft.ML.OnnxRuntime. Takes CAD/CAM feature vectors (hole diameter, depth, step count, material ISO group, overhang) and computes optimal feeds, speeds, peck depths, and breakage risks. Swapping model.onnx requires zero C# recompilation.',
      files: ['plugin/MyPowerMillPlugin/Model/IDomainModel.cs', 'plugin/MyPowerMillPlugin/Model/OnnxDomainModel.cs', 'plugin/MyPowerMillPlugin/Model/CAMFeatureVector.cs'],
      badge: 'ONNX Runtime / DirectML',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      actionKey: 'ml-seam',
      details: [
        'Tensor Shape [1, 8] normalized feature vectors.',
        'Real-time inference (<5ms latency per hole feature set).',
        'Fallback analytical CAM surrogate when weights are offline.',
        'In-place model reloading without restarting PowerMill.',
      ],
    },
    {
      id: 1,
      name: 'LAYER 1 — Autodesk PowerMill',
      subtitle: 'Host CAM Application (pmill.exe)',
      role: 'CAD/CAM Kernel & Toolpath Engine',
      description:
        'The host CNC CAM programming software. Provides the COM automation type library inside pmill.exe, provides PluginFramework.dll, executes NC toolpaths, simulates material removal, and drives multi-axis CNC machines.',
      files: ['C:\\Program Files\\Autodesk\\PowerMill *\\sys\\exec64\\pmill.exe', 'PluginFramework.dll', 'PowerMill.dll'],
      badge: 'CAM Host / COM Kernel',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      actionKey: 'panes-studio',
      details: [
        'COM automation server registered in Windows Registry.',
        'Feature recognition (Hole FeatureSets, multi-step bores).',
        'Canned drilling cycles & 5-axis toolpath computation.',
        'NC program post-processing and machine simulation.',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-400 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Production Architecture Specification</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Autodesk PowerMill 4-Layer Plugin System
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Clean separation of concerns: deployer automation, C# plugin host, ONNX domain machine learning seam, and PowerMill's native CAM kernel.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onSelectLayer('deployer')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run Deployer Simulation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive 4-Layer Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stack Cards */}
        <div className="lg:col-span-7 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Interactive Architecture Stack (Click any layer)
          </h2>

          {layers.map((layer, index) => {
            const isSelected = selectedLayer === layer.id;
            return (
              <div key={layer.id} className="relative">
                <div
                  onClick={() => setSelectedLayer(layer.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/40 translate-x-1'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${layer.badgeColor}`}>
                          {layer.badge}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{layer.subtitle}</span>
                      </div>
                      <h3 className="text-base font-bold text-white">{layer.name}</h3>
                      <p className="text-xs text-cyan-300 font-medium">{layer.role}</p>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                        L{layer.id}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                    {layer.description}
                  </p>
                </div>

                {index < layers.length - 1 && (
                  <div className="flex justify-center my-1">
                    <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-mono">
                      <ArrowDown className="w-3 h-3 text-cyan-500 animate-pulse" />
                      <span>interop & invocation</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Inspector */}
        <div className="lg:col-span-5">
          {(() => {
            const active = layers.find((l) => l.id === selectedLayer) || layers[0];
            return (
              <div className="sticky top-24 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 uppercase font-bold">Layer {active.id} Deep Dive</span>
                    <h3 className="text-base font-bold text-white">{active.name.split('—')[1]?.trim() || active.name}</h3>
                  </div>
                  <button
                    onClick={() => onSelectLayer(active.actionKey)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition flex items-center space-x-1"
                  >
                    <span>Open Tool</span>
                    <span>→</span>
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-1">Architecture Responsibility</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{active.description}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Key Technical Mechanisms</h4>
                  <div className="space-y-2">
                    {active.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Source Assets & Paths</h4>
                  <div className="space-y-1.5">
                    {active.files.map((file, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-800 flex items-center space-x-2"
                      >
                        <FileCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Target Environment:</span>
                  <span className="text-white font-medium">Windows x64 (.NET 4.8 / COM)</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
