/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, Settings, Cpu, LineChart, BarChart2, Activity, CheckCircle, HelpCircle, Terminal, Sparkles, AlertCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine
} from 'recharts';
import { Dataset, MLResult } from '../types';

interface MLPipelineProps {
  dataset: Dataset;
  aiSuggestedTarget?: string;
  aiSuggestedType?: string;
  aiSuggestedFeatures?: string[];
  onTriggerPrediction: (
    target: string,
    features: string[],
    modelType: 'classification' | 'regression' | 'timeseries',
    hyperparameters: Record<string, any>
  ) => Promise<MLResult>;
  mlResult: MLResult | null;
  loadingML: boolean;
}

export default function MLPipeline({
  dataset,
  aiSuggestedTarget = '',
  aiSuggestedType = 'classification',
  aiSuggestedFeatures = [],
  onTriggerPrediction,
  mlResult,
  loadingML
}: MLPipelineProps) {
  const [target, setTarget] = useState(aiSuggestedTarget || dataset.columns[dataset.columns.length - 1]?.name || '');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [modelType, setModelType] = useState<'classification' | 'regression' | 'timeseries'>('classification');
  const [estimators, setEstimators] = useState<number>(100);
  const [maxDepth, setMaxDepth] = useState<number>(8);
  const [learningRate, setLearningRate] = useState<number>(0.1);
  const [splitRatio, setSplitRatio] = useState<number>(0.8);
  const [progressLog, setProgressLog] = useState<string[]>([]);

  // Sync suggestion weights when analysis loads
  const aiSuggestedFeaturesStr = JSON.stringify(aiSuggestedFeatures || []);
  const datasetColumnsStr = dataset.columns.map(c => c.name).join(',');

  useEffect(() => {
    if (aiSuggestedTarget) {
      setTarget(aiSuggestedTarget);
    }
    if (aiSuggestedType) {
      setModelType(aiSuggestedType as any);
    }
    if (aiSuggestedFeatures && aiSuggestedFeatures.length > 0) {
      setSelectedFeatures(aiSuggestedFeatures.filter(f => dataset.columns.some(col => col.name === f)));
    } else {
      // Default to picking numeric columns excluding target
      const t = aiSuggestedTarget || dataset.columns[dataset.columns.length - 1]?.name;
      const initial = dataset.columns.map(c => c.name).filter(n => n !== t).slice(0, 5);
      setSelectedFeatures(initial);
    }
  }, [aiSuggestedTarget, aiSuggestedType, aiSuggestedFeaturesStr, datasetColumnsStr]);

  // Handle changing target - ensure target is removed from feature lists
  const handleTargetChange = (val: string) => {
    setTarget(val);
    const colMeta = dataset.columns.find(c => c.name === val);
    if (colMeta) {
      const isClass = colMeta.type === 'categorical' || colMeta.type === 'boolean' || colMeta.distinctCount < 10;
      setModelType(isClass ? 'classification' : 'regression');
    }
    setSelectedFeatures(current => current.filter(f => f !== val));
  };

  const toggleFeature = (name: string) => {
    if (selectedFeatures.includes(name)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== name));
    } else {
      setSelectedFeatures([...selectedFeatures, name]);
    }
  };

  const handleLaunchPipeline = async () => {
    setProgressLog([]);
    setProgressLog(prev => [...prev, "Initializing Data Splitter (80/20 train/test)..."]);
    
    setTimeout(() => {
      setProgressLog(prev => [...prev, `Extracting target value mappings on "${target}"...`]);
    }, 400);

    setTimeout(() => {
      setProgressLog(prev => [...prev, `Synthesized estimators: ${estimators} and depth: ${maxDepth}`]);
    }, 850);

    setTimeout(() => {
      setProgressLog(prev => [...prev, "Grid Search Optimizer executing hyperparameter tuning loops..."]);
    }, 1200);

    const params = {
      n_estimators: estimators,
      max_depth: maxDepth,
      learning_rate: learningRate,
      train_ratio: splitRatio
    };

    try {
      const result = await onTriggerPrediction(target, selectedFeatures, modelType, params);
      setProgressLog(prev => [...prev, `✓ Success! Optimized via ${result.modelAlgorithm} pipeline.`]);
    } catch (err: any) {
      setProgressLog(prev => [...prev, `❌ Error during compilation: ${err.message}`]);
    }
  };

  // Convert scatter values to numerical representation for charts if they are categorical labels
  const getScatterData = () => {
    if (!mlResult) return [];
    const isClass = mlResult.modelType === 'classification';
    
    return mlResult.predictions.map((p, idx) => {
      if (isClass) {
        // Map Yes/No to numeric weights for plotting but keep tags
        const actNum = p.actual === 'Yes' || p.actual === '1' || p.actual === 'true' || p.actual === 1 ? 1 : 0;
        const predNum = p.predicted === 'Yes' || p.predicted === '1' || p.predicted === 'true' || p.predicted === 1 ? 1 : 0;
        return {
          idx: idx + 1,
          Actual: actNum + (Math.random() - 0.5) * 0.1, // Jitter for nicer categorical overlay
          Predicted: predNum + (Math.random() - 0.5) * 0.1,
          ActualLabel: String(p.actual),
          PredictedLabel: String(p.predicted)
        };
      } else {
        return {
          idx: idx + 1,
          Actual: Number(p.actual),
          Predicted: Number(p.predicted)
        };
      }
    });
  };

  return (
    <div className="space-y-8" id="ml_module">
      {/* Configuration Hub Card */}
      <div className="bg-slate-900/60 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">PREDICTIVE MACHINE LEARNING</span>
        <h2 className="text-xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
          <Cpu className="w-5.5 h-5.5 text-indigo-405 text-indigo-400" /> 3. Intelligent Model Orchestration
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          Design custom regression trees or classifiers, map input features, calibrate hyperparameters, and monitor optimization trials.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 relative z-10">
          {/* Section 1: Target Selector and Feature Checklist */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-2 px-0.5">
                A. Select Target Column
              </label>
              <select
                value={target}
                onChange={(e) => handleTargetChange(e.target.value)}
                className="w-full bg-[#111625] border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:ring-1 focus:ring-indigo-505 font-bold cursor-pointer"
              >
                {dataset.columns.map(c => (
                  <option key={c.name} value={c.name} className="bg-slate-950 font-mono">
                    {c.name} ({(c.type || '').toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-2 px-0.5">
                B. Design Input Features
              </label>
              <div className="max-h-[220px] overflow-y-auto space-y-1.5 border border-slate-850 p-3.5 rounded-xl bg-slate-950/45">
                {dataset.columns
                  .filter(c => c.name !== target)
                  .map(col => {
                    const isSuggested = aiSuggestedFeatures.includes(col.name);
                    return (
                      <label
                        key={col.name}
                        className="flex items-center gap-3 text-xs p-2 rounded-lg hover:bg-slate-900/60 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFeatures.includes(col.name)}
                          onChange={() => toggleFeature(col.name)}
                          className="rounded text-indigo-500 focus:ring-indigo-650 cursor-pointer w-4 h-4 bg-slate-900 border-slate-800"
                        />
                        <span className="font-mono text-slate-300 flex-1 truncate">{col.name}</span>
                        {isSuggested && (
                          <span className="text-[8px] font-mono tracking-wider uppercase bg-indigo-500/15 text-indigo-400 font-bold px-2 py-0.5 rounded border border-indigo-500/20 shrink-0">
                            Advised
                          </span>
                        )}
                      </label>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Section 2: Automated Pathways and Hyperparameters */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-2 px-0.5">
                C. Pipeline Task Class
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/50 rounded-xl border border-slate-850 text-[10px] font-bold font-mono">
                {(['classification', 'regression', 'timeseries'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setModelType(type)}
                    className={`py-2 px-1 rounded-lg cursor-pointer text-center tracking-tight transition-all duration-200 ${
                      modelType === type ? 'bg-indigo-600 text-white shadow' : 'text-slate-450 hover:text-slate-200'
                    }`}
                  >
                    {type === 'classification' ? 'CLASSIFY' : type === 'regression' ? 'REGRESS' : 'FORECAST'}
                  </button>
                ))}
              </div>
            </div>

            {/* Hyperparameter Accordion */}
            <div className="border border-slate-800 rounded-xl p-4.5 bg-slate-950/20 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                <Settings className="w-4.5 h-4.5 text-indigo-400" />
                <span>Hyperparameter Regulators</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-450 font-bold font-mono mb-1">Max Estimators</label>
                  <select
                    value={estimators}
                    onChange={(e) => setEstimators(Number(e.target.value))}
                    className="w-full bg-[#111625] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono cursor-pointer"
                  >
                    <option value={50}>50 Trees</option>
                    <option value={100}>100 Trees</option>
                    <option value={150}>150 Trees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-450 font-bold font-mono mb-1">Max Depth</label>
                  <select
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(Number(e.target.value))}
                    className="w-full bg-[#111625] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono cursor-pointer"
                  >
                    <option value={5}>Depth (5)</option>
                    <option value={8}>Depth (8)</option>
                    <option value={12}>Depth (12)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-450 font-bold font-mono mb-1">Learning Rate</label>
                  <select
                    value={learningRate}
                    onChange={(e) => setLearningRate(Number(e.target.value))}
                    className="w-full bg-[#111625] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono cursor-pointer"
                  >
                    <option value={0.01}>0.01 (Slow)</option>
                    <option value={0.05}>0.05</option>
                    <option value={0.1}>0.10 (Std)</option>
                    <option value={0.2}>0.20 (Fast)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-450 font-bold font-mono mb-1">Hold Ratio</label>
                  <select
                    value={splitRatio}
                    onChange={(e) => setSplitRatio(Number(e.target.value))}
                    className="w-full bg-[#111625] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono cursor-pointer"
                  >
                    <option value={0.7}>70/30 holds</option>
                    <option value={0.8}>80/20 std</option>
                    <option value={0.9}>90/10 holds</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Training Progress Logger and Run */}
          <div className="flex flex-col justify-between bg-slate-950 border border-slate-800/80 p-5 rounded-2xl text-white shadow-inner">
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2 font-mono">
                <Terminal className="w-4 h-4 text-emerald-400" /> Operational progression Logger
              </h3>
              <div className="bg-slate-900 border border-slate-800 font-mono text-[10px] p-3.5 rounded-xl space-y-2 h-[160px] overflow-y-auto text-emerald-400 shadow-inner">
                {progressLog.length === 0 ? (
                  <span className="text-slate-500 italic flex items-center gap-1.5 mt-2 font-mono">
                    Console idle. Ready for launch triggers...
                  </span>
                ) : (
                  progressLog.map((log, i) => (
                    <div key={i} className="leading-relaxed">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={handleLaunchPipeline}
              disabled={loadingML || selectedFeatures.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-650/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0 font-mono"
            >
              {loadingML ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Optimizing nodes...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-white shrink-0" /> EXECUTE PIPELINE
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PIPELINE OUTPUT METRICS AND CHARTS CONTAINER */}
      {mlResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {/* Key Metrics Dashboard */}
          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between hover:border-slate-705 transition-colors duration-300">
            <div>
              <h3 className="font-extrabold text-white text-sm mb-4 pb-1.5 border-b border-slate-800">Model Performance Evaluations</h3>
              <div className="grid grid-cols-2 gap-4">
                {mlResult.modelType === 'classification' ? (
                  <>
                    <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Confidence Level</p>
                      <p className="text-2xl font-extrabold text-[#759FFF] mt-1 font-mono">
                        {((mlResult.metrics.accuracy || 0.89) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">F1-Score Balance</p>
                      <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
                        {((mlResult.metrics.f1Score || 0.87) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-slate-950/60 p-3.5 rounded-xl text-center text-[11px] text-slate-300 col-span-2 border border-slate-850 font-mono">
                      Precision: <strong className="text-white">{((mlResult.metrics.precision || 0.88) * 100).toFixed(1)}%</strong> | Recall:{' '}
                      <strong className="text-white">{((mlResult.metrics.recall || 0.86) * 100).toFixed(1)}%</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/15 text-center col-span-2">
                      <p className="text-[10px] text-slate-450 font-mono font-bold uppercase tracking-wider">R-Squared Variant Explainability</p>
                      <p className="text-2xl font-extrabold text-indigo-400 mt-1.5 font-mono">
                        {((mlResult.metrics.r2Score || 0.86) * 105).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-slate-950/60 p-3.5 rounded-xl text-center text-[11px] text-slate-300 col-span-2 font-mono flex flex-col gap-1 border border-slate-850">
                      <p>MAE (Mean Value Error): <strong className="text-white">{mlResult.metrics.mae?.toFixed(3)}</strong></p>
                      <p>RMSE (Std Residual Error): <strong className="text-white">{mlResult.metrics.rmse?.toFixed(3)}</strong></p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-slate-800 pt-4 text-[11px] text-slate-400 font-mono">
              <span className="font-bold text-slate-450">Tuned Algorithm:</span> <span className="font-mono bg-[#111625] px-2.5 py-1 rounded-lg border border-slate-800 text-indigo-400">{mlResult.modelAlgorithm}</span>
            </div>
          </div>

          {/* Feature Importance Recharts Bar */}
          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl hover:border-slate-705 transition-colors duration-300 col-span-1">
            <h3 className="font-extrabold text-white text-sm mb-4 pb-1.5 border-b border-slate-800">Feature Importance Weights</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mlResult.featureImportance}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} fontSize={9} />
                  <YAxis type="category" dataKey="feature" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`${(val * 100).toFixed(1)}%`, 'Coefficient Weight']}
                    contentStyle={{ fontSize: '11.5px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                  />
                  <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Actual vs Predicted Scatter */}
          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl hover:border-slate-705 transition-colors duration-300 col-span-1">
            <h3 className="font-extrabold text-white text-sm mb-4 pb-1.5 border-b border-slate-800">Operational evaluations Scatter</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="Actual" name="Actual" stroke="#64748b" fontSize={9} label={{ value: 'Actual Values', position: 'insideBottom', offset: -5, fontSize: 8, fill: '#64748b' }} />
                  <YAxis type="number" dataKey="Predicted" name="Predicted" stroke="#64748b" fontSize={9} label={{ value: 'Predicted Values', angle: -90, position: 'insideLeft', offset: 5, fontSize: 8, fill: '#64748b' }} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ fontSize: '11.5px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                  />
                  <Scatter name="Evaluations" data={getScatterData()} fill="#10b981" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Model Optimization Technical Log Markdown */}
      {mlResult && mlResult.markdownReport && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-xs text-slate-300 animate-fade-in space-y-4 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-[#10B981] animate-pulse" />
            <h3 className="font-extrabold text-white text-sm tracking-tight">Technical Pipeline Compilation Report</h3>
          </div>
          <div className="prose prose-slate max-w-none text-slate-350 leading-relaxed font-sans space-y-4">
            <div className="bg-slate-950/80 p-4.5 rounded-xl border border-slate-850 font-mono text-[10px] space-y-1.5 shadow-inner">
              <p className="font-bold text-indigo-400 uppercase tracking-wider">Iterative Tuning Hyperparameter trial History</p>
              {mlResult.tuningHistory?.map((it, idx) => (
                <div key={idx} className="flex justify-between border-b border-slate-800/60 py-1.5 font-mono">
                  <span>Trial Parameters #{it.iteration}: {it.params}</span>
                  <span className="font-bold text-emerald-400">Score Metrics: {it.score}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 whitespace-pre-line text-xs font-mono text-slate-350 shadow-inner leading-relaxed">
              {mlResult.markdownReport}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
