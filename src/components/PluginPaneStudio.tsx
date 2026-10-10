import React, { useState } from 'react';
import { Wrench, Play, CheckCircle2, FileText, Cpu, Database, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { runModelInference } from '../utils/mlInference';

export const PluginPaneStudio: React.FC = () => {
  const [activePaneTab, setActivePaneTab] = useState<'ml-optimizer' | 'drilling' | 'vericut' | 'setupsheet'>('ml-optimizer');

  // ML Optimizer State
  const [holeDia, setHoleDia] = useState<number>(12);
  const [holeDepth, setHoleDepth] = useState<number>(35);
  const [material, setMaterial] = useState<'ISO-P' | 'ISO-M' | 'ISO-K' | 'ISO-N' | 'ISO-S' | 'ISO-H'>('ISO-P');
  const [overhang, setOverhang] = useState<number>(45);
  const [mlInferenceDone, setMlInferenceDone] = useState<boolean>(true);
  const [powerMillStatusLog, setPowerMillStatusLog] = useState<string>('PowerMill COM Automation Server connected.');

  // Drilling Automation State
  const [featureSets, setFeatureSets] = useState<string[]>([
    'HoleSet_M8_Mounting (12 holes)',
    'HoleSet_PinLocation (4 holes)',
    'HoleSet_OilChannels (6 holes)',
    'HoleSet_EjectorPins (16 holes)',
  ]);
  const [selectedFeatureSets, setSelectedFeatureSets] = useState<string[]>(['HoleSet_M8_Mounting (12 holes)']);
  const [machineCell, setMachineCell] = useState<string>('5-Axis Hermle C42');
  const [actionType, setActionType] = useState<string>('Both');

  // Vericut Exporter State
  const [ncPrograms, setNcPrograms] = useState<string[]>(['1001_ROUGHING.tap', '1002_FINISH_HOLES.tap', '1003_CHAMFERS.tap']);
  const [selectedNc, setSelectedNc] = useState<string>('1002_FINISH_HOLES.tap');
  const [vericutTemplate, setVericutTemplate] = useState<string>('MoriSeiki_NM5000.VcProject');
  const [exportStock, setExportStock] = useState<boolean>(true);
  const [exportClamps, setExportClamps] = useState<boolean>(true);

  // Run ML inference
  const mlResult = runModelInference(
    {
      holeDiameterMm: holeDia,
      holeDepthMm: holeDepth,
      stepCount: 1,
      materialHardnessBrinell: 230,
      materialGroup: material,
      cutterDiameterMm: holeDia,
      fluteCount: 2,
      toolOverhangMm: overhang,
      hasThroughExit: false,
    },
    'model.onnx'
  );

  const handleApplyToPowerMill = () => {
    setPowerMillStatusLog(
      `[PowerMill COM] DoCommand("${mlResult.recommendedStrategy}") executed successfully. Toolpath parameters updated: RPM=${mlResult.recommendedSpindleRpm}, Feed=${mlResult.recommendedFeedMmPerMin}mm/min.`
    );
  };

  const handleDrillingGenerate = () => {
    setPowerMillStatusLog(
      `[Drilling Automation] Recognized ${selectedFeatureSets.length} FeatureSets on ${machineCell}. Renamed holes and generated toolpaths using ImportToolpath.mac.`
    );
  };

  const handleVericutExport = () => {
    setPowerMillStatusLog(
      `[Vericut Export] Exported setup: Template="${vericutTemplate}", Program="${selectedNc}", Stock=${exportStock}, Clamps=${exportClamps} to VERICUT simulation.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-semibold mb-2">
              <Wrench className="w-3.5 h-3.5" />
              <span>Layer 3: PowerMill Plugin Host & Panes Studio</span>
            </div>
            <h2 className="text-xl font-bold text-white">Interactive PowerMill Docked Palettes</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Simulate the exact WPF UserControls hosted inside Autodesk PowerMill's side dock. Switch between the new ML Optimizer Pane and the official API example plugins (Drilling Automation, Vericut Exporter, Setup Sheet).
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-mono text-[11px]">COM Server: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Main Studio Frame (Simulated PowerMill UI) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulated PowerMill 3D Viewport / Status */}
        <div className="lg:col-span-7 space-y-4">
          {/* Simulated 3D CAM Viewport */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden h-[420px] flex flex-col justify-between shadow-2xl">
            {/* Viewport Top Bar */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
                  Autodesk PowerMill 2024 Viewport
                </span>
                <span className="text-[11px] text-cyan-400 font-mono bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                  Project: Hydraulic_Manifold_Block.pmlprj
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">WCS: G54 [X:0 Y:0 Z:0]</span>
            </div>

            {/* Visual CAD Representation */}
            <div className="flex items-center justify-center relative my-auto">
              {/* Mold / Manifold Block Graphic */}
              <div className="w-64 h-48 rounded-xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border-2 border-slate-700/80 shadow-2xl relative flex items-center justify-center">
                {/* Milling Toolpath Vectors */}
                <div className="absolute inset-4 border border-dashed border-cyan-500/40 rounded-lg pointer-events-none" />
                <div className="absolute inset-8 border border-dashed border-amber-500/30 rounded pointer-events-none" />

                {/* Simulated Holes */}
                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((h) => (
                    <div
                      key={h}
                      className="w-7 h-7 rounded-full bg-slate-950 border-2 border-cyan-400 shadow-inner flex items-center justify-center group relative cursor-pointer hover:border-emerald-400 hover:scale-110 transition"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 group-hover:bg-emerald-400" />
                      <span className="absolute -top-5 text-[9px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-slate-900 px-1 rounded border border-slate-800">
                        Ø{holeDia}mm x {holeDepth}mm
                      </span>
                    </div>
                  ))}
                </div>

                {/* Spindle head simulation */}
                <div className="absolute -top-6 right-8 flex flex-col items-center animate-bounce">
                  <div className="w-4 h-8 bg-slate-400 rounded-t" />
                  <div className="w-1.5 h-6 bg-amber-400 rounded-b shadow-lg shadow-amber-400/50" />
                  <span className="text-[9px] font-mono text-amber-300 mt-0.5">Tool 1</span>
                </div>
              </div>
            </div>

            {/* Viewport Bottom Bar / Coordinates */}
            <div className="flex items-center justify-between text-xs text-slate-400 z-10 border-t border-slate-800/80 pt-3">
              <div className="flex items-center space-x-3 text-[11px] font-mono">
                <span>Tool: Ø{holeDia}mm Drill</span>
                <span>Active Workplane: 1</span>
                <span>Tolerance: 0.01mm</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono font-semibold">Ready for NC Output</span>
            </div>
          </div>

          {/* PowerMill Command / Status Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              PowerMill Automation Server Event Log
            </span>
            <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-cyan-300 border border-slate-800 overflow-x-auto">
              {powerMillStatusLog}
            </div>
          </div>
        </div>

        {/* Right Column: Docked WPF Pane Container */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          {/* Pane Window Titlebar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              PowerMill Docked Palettes
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              ElementHost.Child
            </span>
          </div>

          {/* Plugin Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActivePaneTab('ml-optimizer')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition ${
                activePaneTab === 'ml-optimizer'
                  ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-500/30 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ML Optimizer
            </button>
            <button
              onClick={() => setActivePaneTab('drilling')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition ${
                activePaneTab === 'drilling'
                  ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-500/30 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Drilling Auto
            </button>
            <button
              onClick={() => setActivePaneTab('vericut')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition ${
                activePaneTab === 'vericut'
                  ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-500/30 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vericut NC
            </button>
          </div>

          {/* Tab 1: ML Optimizer Pane */}
          {activePaneTab === 'ml-optimizer' && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">ML CAM Optimizer (WPF)</span>
                  <span className="text-[10px] font-mono text-emerald-400">model.onnx Loaded</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Runs ONNX feature evaluation in-process and writes decisions directly into PowerMill strategy macros.
                </p>
              </div>

              {/* Parameter Inputs */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Diameter (mm)</label>
                    <input
                      type="number"
                      value={holeDia}
                      onChange={(e) => setHoleDia(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Depth (mm)</label>
                    <input
                      type="number"
                      value={holeDepth}
                      onChange={(e) => setHoleDepth(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Material</label>
                    <select
                      value={material}
                      onChange={(e) => setMaterial(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="ISO-P">ISO-P (Steel)</option>
                      <option value="ISO-M">ISO-M (Stainless)</option>
                      <option value="ISO-K">ISO-K (Cast Iron)</option>
                      <option value="ISO-N">ISO-N (Alloy Alu)</option>
                      <option value="ISO-S">ISO-S (Titanium)</option>
                      <option value="ISO-H">ISO-H (Hardened)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Overhang (mm)</label>
                    <input
                      type="number"
                      value={overhang}
                      onChange={(e) => setOverhang(parseFloat(e.target.value) || 20)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Results Preview */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Strategy:</span>
                  <span className="font-bold text-white">{mlResult.recommendedStrategy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Optimal RPM:</span>
                  <span className="font-bold text-emerald-400">{mlResult.recommendedSpindleRpm} RPM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Feed Rate:</span>
                  <span className="font-bold text-emerald-400">{mlResult.recommendedFeedMmPerMin} mm/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Peck Increment:</span>
                  <span className="font-bold text-cyan-300">{mlResult.recommendedPeckDepthMm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tool Breakage Risk:</span>
                  <span className="font-bold text-amber-300">{(mlResult.toolBreakageRiskScore * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleApplyToPowerMill}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition active:scale-98"
              >
                Apply Parameters to PowerMill Toolpath
              </button>
            </div>
          )}

          {/* Tab 2: Drilling Automation Pane */}
          {activePaneTab === 'drilling' && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-cyan-400">Hole Recognition & Tagging</span>
                <p className="text-[11px] text-slate-400">
                  Automatic recognition of hole shapes from feature sets and macro-based toolpath generation.
                </p>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Machine Cell</label>
                <select
                  value={machineCell}
                  onChange={(e) => setMachineCell(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                >
                  <option value="5-Axis Hermle C42">5-Axis Hermle C42</option>
                  <option value="3-Axis Haas VF4-SS">3-Axis Haas VF4-SS</option>
                  <option value="Matsuura MAM72-35V">Matsuura MAM72-35V</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Available Hole FeatureSets</label>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 space-y-1 max-h-32 overflow-y-auto">
                  {featureSets.map((f, i) => (
                    <label key={i} className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer p-1 hover:bg-slate-900 rounded">
                      <input
                        type="checkbox"
                        checked={selectedFeatureSets.includes(f)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedFeatureSets([...selectedFeatureSets, f]);
                          else setSelectedFeatureSets(selectedFeatureSets.filter((x) => x !== f));
                        }}
                        className="rounded border-slate-700 text-cyan-500"
                      />
                      <span>{f}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 text-xs text-slate-300">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    checked={actionType === 'Tag Only'}
                    onChange={() => setActionType('Tag Only')}
                  />
                  <span>Tag Only</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    checked={actionType === 'Toolpaths Only'}
                    onChange={() => setActionType('Toolpaths Only')}
                  />
                  <span>Toolpaths Only</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    checked={actionType === 'Both'}
                    onChange={() => setActionType('Both')}
                  />
                  <span>Both</span>
                </label>
              </div>

              <button
                onClick={handleDrillingGenerate}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition active:scale-98"
              >
                Generate Drilling Automation
              </button>
            </div>
          )}

          {/* Tab 3: Vericut Exporter Pane */}
          {activePaneTab === 'vericut' && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-cyan-400">PowerMill to VERICUT Exporter</span>
                <p className="text-[11px] text-slate-400">
                  Exports stock models, clamps, tooling libraries, and NC programs directly into CGTech VERICUT.
                </p>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Select NC Program</label>
                <select
                  value={selectedNc}
                  onChange={(e) => setSelectedNc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                >
                  {ncPrograms.map((p, idx) => (
                    <option key={idx} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">VERICUT Machine Template (.VcProject)</label>
                <input
                  type="text"
                  value={vericutTemplate}
                  onChange={(e) => setVericutTemplate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportStock}
                    onChange={(e) => setExportStock(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-500"
                  />
                  <span>Export Stock Bounding Model (STL)</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportClamps}
                    onChange={(e) => setExportClamps(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-500"
                  />
                  <span>Export Fixture & Clamps (Solids)</span>
                </label>
              </div>

              <button
                onClick={handleVericutExport}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition active:scale-98"
              >
                Launch VERICUT Simulation Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
