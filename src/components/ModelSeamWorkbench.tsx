import React, { useState, useMemo } from 'react';
import { Cpu, Play, RefreshCw, Zap, AlertTriangle, ShieldCheck, Clock, Gauge, Database, Check, Sliders, ChevronRight } from 'lucide-react';
import { CAMFeatureVector, ModelInferenceResult } from '../types';
import { runModelInference } from '../utils/mlInference';

export const ModelSeamWorkbench: React.FC = () => {
  const [modelChoice, setModelChoice] = useState<string>('model.onnx (Production Default)');
  const [features, setFeatures] = useState<CAMFeatureVector>({
    holeDiameterMm: 12.0,
    holeDepthMm: 36.0,
    stepCount: 1,
    materialHardnessBrinell: 240,
    materialGroup: 'ISO-P',
    cutterDiameterMm: 12.0,
    fluteCount: 2,
    toolOverhangMm: 45.0,
    hasThroughExit: false,
  });

  const [copiedMacro, setCopiedMacro] = useState(false);

  // Run live inference
  const result: ModelInferenceResult = useMemo(() => {
    return runModelInference(features, modelChoice);
  }, [features, modelChoice]);

  // Normalized tensor vector preview
  const tensorVector = useMemo(() => {
    const d = features.holeDiameterMm / 50.0;
    const l = features.holeDepthMm / 150.0;
    const ratio = (features.holeDepthMm / Math.max(features.holeDiameterMm, 1.0)) / 10.0;
    const steps = features.stepCount / 5.0;
    const hb = features.materialHardnessBrinell / 600.0;
    const toolD = features.cutterDiameterMm / 50.0;
    const z = features.fluteCount / 6.0;
    const lOverhang = features.toolOverhangMm / 150.0;
    return [d, l, ratio, steps, hb, toolD, z, lOverhang].map((v) => Number(v.toFixed(3)));
  }, [features]);

  const presetProfiles = [
    {
      name: 'Mold & Die P20 Deep Ejector Hole',
      features: {
        holeDiameterMm: 8.0,
        holeDepthMm: 65.0,
        stepCount: 1,
        materialHardnessBrinell: 310,
        materialGroup: 'ISO-P' as const,
        cutterDiameterMm: 8.0,
        fluteCount: 2,
        toolOverhangMm: 80.0,
        hasThroughExit: true,
      },
    },
    {
      name: 'Aerospace Titanium Ti-6Al-4V Flange Bore',
      features: {
        holeDiameterMm: 14.0,
        holeDepthMm: 28.0,
        stepCount: 2,
        materialHardnessBrinell: 360,
        materialGroup: 'ISO-S' as const,
        cutterDiameterMm: 14.0,
        fluteCount: 3,
        toolOverhangMm: 40.0,
        hasThroughExit: false,
      },
    },
    {
      name: 'High-Speed Automotive 6061-T6 Oil Port',
      features: {
        holeDiameterMm: 10.0,
        holeDepthMm: 22.0,
        stepCount: 1,
        materialHardnessBrinell: 95,
        materialGroup: 'ISO-N' as const,
        cutterDiameterMm: 10.0,
        fluteCount: 2,
        toolOverhangMm: 35.0,
        hasThroughExit: true,
      },
    },
  ];

  const handleCopyMacro = () => {
    navigator.clipboard.writeText(result.powerMillMacroCommand);
    setCopiedMacro(true);
    setTimeout(() => setCopiedMacro(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-400 text-xs font-semibold mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Layer 2 Seam Interface: IDomainModel</span>
            </div>
            <h2 className="text-xl font-bold text-white">ONNX CAM Optimization Seam</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Simulate and test how the plugin feeds CAD feature vectors to <code className="text-cyan-300 font-mono">model.onnx</code> without compiling the C# project. Live calculations for speeds, feeds, pecking, and breakage risk.
            </p>
          </div>

          {/* Model Selector */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center space-x-2">
            <Database className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="text-xs">
              <label className="text-[10px] text-slate-400 block font-semibold uppercase">Active Model Weights</label>
              <select
                value={modelChoice}
                onChange={(e) => setModelChoice(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="model.onnx (Production Default)" className="bg-slate-900">model.onnx (Production Default)</option>
                <option value="deep_hole_peck_v3.onnx (Specialized)" className="bg-slate-900">deep_hole_peck_v3.onnx (Specialized)</option>
                <option value="inconel_aerospace_v1.onnx (High-Torque)" className="bg-slate-900">inconel_aerospace_v1.onnx (High-Torque)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Profiles */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 whitespace-nowrap font-medium">Quick CAM Presets:</span>
        {presetProfiles.map((p, idx) => (
          <button
            key={idx}
            onClick={() => setFeatures(p.features)}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition whitespace-nowrap flex items-center space-x-1"
          >
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Feature Vector Inputs */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Input Feature Vector (CAMFeatureVector)</h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              Shape: [1, 8]
            </span>
          </div>

          {/* Geometry Inputs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Geometry & Topology</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Hole Diameter (mm)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  step="0.5"
                  value={features.holeDiameterMm}
                  onChange={(e) => setFeatures({ ...features, holeDiameterMm: parseFloat(e.target.value) || 1 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Hole Depth (mm)</label>
                <input
                  type="number"
                  min="2"
                  max="250"
                  step="1"
                  value={features.holeDepthMm}
                  onChange={(e) => setFeatures({ ...features, holeDepthMm: parseFloat(e.target.value) || 2 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Step Count</label>
                <select
                  value={features.stepCount}
                  onChange={(e) => setFeatures({ ...features, stepCount: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value={1}>1 (Straight Cylinder)</option>
                  <option value={2}>2 (Step / Counterbore)</option>
                  <option value={3}>3 (Multi-Stepped)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Through Hole Exit</label>
                <button
                  type="button"
                  onClick={() => setFeatures({ ...features, hasThroughExit: !features.hasThroughExit })}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold border transition ${
                    features.hasThroughExit
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-700 text-slate-400'
                  }`}
                >
                  {features.hasThroughExit ? 'Yes (Through Hole)' : 'No (Blind Hole)'}
                </button>
              </div>
            </div>
          </div>

          {/* Material & Tooling */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Workpiece Material & Cutter</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">ISO Material Group</label>
                <select
                  value={features.materialGroup}
                  onChange={(e) => setFeatures({ ...features, materialGroup: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="ISO-P">ISO-P (Steel / Tool Steel)</option>
                  <option value="ISO-M">ISO-M (Stainless Steel)</option>
                  <option value="ISO-K">ISO-K (Cast Iron)</option>
                  <option value="ISO-N">ISO-N (Aluminum / Non-Ferrous)</option>
                  <option value="ISO-S">ISO-S (Titanium / Inconel)</option>
                  <option value="ISO-H">ISO-H (Hardened 45-60 HRC)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Hardness (Brinell HB)</label>
                <input
                  type="number"
                  min="80"
                  max="600"
                  step="10"
                  value={features.materialHardnessBrinell}
                  onChange={(e) => setFeatures({ ...features, materialHardnessBrinell: parseInt(e.target.value) || 200 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tool Overhang (mm)</label>
                <input
                  type="number"
                  min="20"
                  max="160"
                  step="5"
                  value={features.toolOverhangMm}
                  onChange={(e) => setFeatures({ ...features, toolOverhangMm: parseFloat(e.target.value) || 30 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Flute Count (z)</label>
                <select
                  value={features.fluteCount}
                  onChange={(e) => setFeatures({ ...features, fluteCount: parseInt(e.target.value) || 2 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value={2}>2 Flutes (Standard Drill)</option>
                  <option value={3}>3 Flutes (High Penetration)</option>
                  <option value={4}>4 Flutes (Step Core Drill)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tensor vector visualization */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-400 font-mono block">Normalized Float32 Input Tensor:</span>
            <div className="font-mono text-xs text-cyan-300 break-all p-2 rounded bg-slate-900 border border-slate-800/80">
              [{tensorVector.join(', ')}]
            </div>
          </div>
        </div>

        {/* Right Column: Model Decision Output */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Decision Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Inference Decisions (ModelInferenceResult)</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Confidence:</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {(result.confidenceScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Output Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium block">Strategy</span>
                <span className="text-sm font-bold text-cyan-300 truncate block mt-0.5">
                  {result.recommendedStrategy}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium block">Spindle RPM</span>
                <span className="text-sm font-bold text-emerald-400 block mt-0.5">
                  {result.recommendedSpindleRpm.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">RPM</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium block">Feed Rate</span>
                <span className="text-sm font-bold text-emerald-400 block mt-0.5">
                  {result.recommendedFeedMmPerMin.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">mm/min</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium block">Peck Depth</span>
                <span className="text-sm font-bold text-indigo-300 block mt-0.5">
                  {result.recommendedPeckDepthMm} <span className="text-[10px] text-slate-500 font-normal">mm</span>
                </span>
              </div>
            </div>

            {/* Detailed Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[11px]">Surface Speed (Vc)</span>
                <span className="font-bold text-slate-200">{result.recommendedSurfaceSpeedVc} m/min</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[11px]">Feed per Tooth (fz)</span>
                <span className="font-bold text-slate-200">{result.recommendedFeedPerToothFz} mm/z</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[11px]">Cycle Time</span>
                <span className="font-bold text-slate-200">{result.estimatedCycleTimeSeconds}s (-{result.cycleTimeSavedPercentage}%)</span>
              </div>
            </div>

            {/* Risk Meters */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tool Breakage Risk Score</span>
                  </span>
                  <span className={`font-bold ${result.toolBreakageRiskScore > 0.4 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {(result.toolBreakageRiskScore * 100).toFixed(0)}% ({result.toolBreakageRiskScore < 0.25 ? 'Low Risk' : result.toolBreakageRiskScore < 0.5 ? 'Moderate' : 'High Risk'})
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      result.toolBreakageRiskScore > 0.5
                        ? 'bg-rose-500'
                        : result.toolBreakageRiskScore > 0.25
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, result.toolBreakageRiskScore * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Chatter / Harmonic Vibration Probability</span>
                  <span className="font-bold text-cyan-400">
                    {(result.chatterProbability * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, result.chatterProbability * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* PowerMill COM Macro Generator */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <span>Generated PowerMill DoCommand() Macro</span>
                </span>
                <button
                  onClick={handleCopyMacro}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition"
                >
                  {copiedMacro ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{copiedMacro ? 'Copied to Clipboard!' : 'Copy Macro'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
                {result.powerMillMacroCommand}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
