import React, { useState } from 'react';
import { X, Terminal, Monitor, CheckCircle2, Copy, ExternalLink, AlertTriangle, Play, Sparkles } from 'lucide-react';

interface HowToRunModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToRunModal: React.FC<HowToRunModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'windows' | 'web'>('windows');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-950/50">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">How to Run this Application</h2>
              <p className="text-xs text-slate-400">Step-by-step execution guide for Windows CAM machines and Web Studio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-4 border-b border-slate-800 flex space-x-3">
          <button
            onClick={() => setActiveTab('windows')}
            className={`flex items-center space-x-2 pb-3 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'windows'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>1. Physical/Virtual Windows CAM Machine (Target)</span>
          </button>
          <button
            onClick={() => setActiveTab('web')}
            className={`flex items-center space-x-2 pb-3 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'web'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. Web Simulator & Studio (Current Browser App)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {activeTab === 'windows' ? (
            <div className="space-y-6">
              {/* Highlight Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-500/30">
                <div className="flex items-start space-x-3">
                  <Play className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm text-emerald-200">The "One-Click" Workflow</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      No manual compilation or registry editing is needed. Simply double-click <code className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-300 font-mono">deployer\Install.bat</code>. It elevates to Administrator, compiles the plugin, registers the COM interop, and launches Autodesk PowerMill with the plugin active!
                    </p>
                  </div>
                </div>
              </div>

              {/* Step by step */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step-by-Step Instructions</h4>

                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">STEP 1: Download or Clone the Repository</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Click the <strong>"Export Windows Package"</strong> button in the top right to download the complete ready-to-run ZIP, or clone the repository to your Windows CAM PC.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">STEP 2: Prerequisites on Windows</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li><strong>Autodesk PowerMill</strong> (2018 through 2025) installed in <code className="font-mono bg-slate-900 px-1 py-0.5 rounded text-cyan-300">C:\Program Files\Autodesk\PowerMill*</code></li>
                    <li><strong>Visual Studio 2022 / VS Build Tools</strong> with ".NET Framework 4.8 targeting pack" & Windows SDK</li>
                    <li>Windows 10 / 11 64-bit</li>
                  </ul>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">STEP 3: Run the Deployer</span>
                    <button
                      onClick={() => copyToClipboard('.\\deployer\\Install.bat', 1)}
                      className="text-xs text-slate-400 hover:text-cyan-300 inline-flex items-center space-x-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedIndex === 1 ? 'Copied!' : 'Copy command'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">
                    Right-click <code className="font-mono text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">deployer\Install.bat</code> and select <strong>"Run as administrator"</strong>, or execute via PowerShell:
                  </p>
                  <pre className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-cyan-300 border border-slate-800 overflow-x-auto">
                    powershell -ExecutionPolicy Bypass -File .\deployer\Install.ps1
                  </pre>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">STEP 4: Verify in PowerMill</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Once PowerMill opens:
                  </p>
                  <ol className="text-xs text-slate-300 list-decimal list-inside space-y-1 pl-1">
                    <li>Click <strong>File &gt; Options &gt; Manage Installed Plugins</strong>.</li>
                    <li>Look for <strong>"MyPowerMillPlugin"</strong> — it will show a green status indicator.</li>
                    <li>The docked sidebar pane <strong>"ML CAM Optimizer"</strong> will appear in the right tool palette.</li>
                  </ol>
                </div>

                {/* Step 5 */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">STEP 5: Developing & Swapping ML Models</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    To update your ML model without recompiling the C# plugin, simply drop a newly trained <code className="font-mono text-amber-300 bg-slate-900 px-1 py-0.5 rounded">model.onnx</code> into <code className="font-mono text-slate-200 bg-slate-900 px-1 py-0.5 rounded">plugin\MyPowerMillPlugin\Model\</code> and click "Reload model.onnx" inside the PowerMill pane!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <h4 className="text-sm font-semibold text-white">Running the Web Studio in AI Studio</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This interactive Web Studio is running directly inside your container on <strong>port 3000</strong> using Vite and React. It provides complete simulations of the four architectural layers so you can design, test, and validate before deploying to a physical CNC CAM machine.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <span className="font-bold text-cyan-400 block mb-1">Layer 2: Domain ML Seam</span>
                    <p className="text-slate-400">Test ONNX input vectors, inspect tensor schemas, and preview feed/speed optimizations.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <span className="font-bold text-cyan-400 block mb-1">Layer 3: PowerMill Panes</span>
                    <p className="text-slate-400">Interactive live replica of the docked WPF panes for ML Optimizer, Drilling, and Vericut.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <span className="font-bold text-cyan-400 block mb-1">Layer 4: Deployer Simulator</span>
                    <p className="text-slate-400">Simulate and dry-run the 10-step PowerShell deployment flow with full diagnostic logs.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <span className="font-bold text-cyan-400 block mb-1">Package Exporter</span>
                    <p className="text-slate-400">Download the complete ready-to-run Windows Visual Studio solution & installer scripts as a ZIP.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300">
                <strong>Dev Server Status:</strong> Dev server running on host <code>0.0.0.0:3000</code>. To restart or rebuild at any time, execute <code>npm run dev</code> or <code>npm run build</code>.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
          >
            Got it, Let's Build
          </button>
        </div>
      </div>
    </div>
  );
};
