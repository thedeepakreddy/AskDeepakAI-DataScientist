/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AreaChart, Eye, Compass, TrendingUp, AlertTriangle, Lightbulb, Users, BrainCircuit, Sparkles, HelpCircle } from 'lucide-react';
import { Dataset } from '../types';

interface EDAReportProps {
  dataset: Dataset;
  aiAnalysis: {
    overviewSummary?: string;
    recommendedTarget?: string;
    modelType?: string;
    suggestedFeatures?: string[];
    scientistFocus?: string;
    scientistRationale?: string;
    strategicSlicer?: string;
    insights?: string[];
  } | null;
  loadingAI: boolean;
  onTriggerAI: () => void;
}

export default function EDAReport({ dataset, aiAnalysis, loadingAI, onTriggerAI }: EDAReportProps) {
  // Compute basic statistical matrices client-side to enrich EDA report
  const nullRates = dataset.columns.map(col => ({
    name: col.name,
    rate: parseFloat(((col.missingCount / dataset.rowCount) * 100).toFixed(1)),
    type: col.type
  })).sort((a, b) => b.rate - a.rate);

  return (
    <div className="space-y-8" id="eda_module">
      {/* Dynamic AI Generation Banner if analysis is null */}
      {!aiAnalysis && (
        <div className="relative bg-[#0E1325]/80 backdrop-blur-md text-white p-7 sm:p-9 rounded-2xl border border-indigo-500/15 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in overflow-hidden">
          {/* Animated decorative glow orb */}
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute left-0 bottom-0 -translate-x-12 translate-y-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <span className="text-[9px] font-mono font-extrabold text-[#9BB1FF] uppercase tracking-widest bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30">
              COGNITIVE COMPILING ENGINE
            </span>
            <h3 className="text-lg font-extrabold tracking-tight flex items-center gap-2 mt-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" /> Compute Cognitive Exploratory scan
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Synthesize a holistic statistical exploratory report with Gemini models. Isolates predictive features, suggests filter dimensions, analyzes covariates, and targets optimum ML algorithms.
            </p>
          </div>
          <button
            onClick={onTriggerAI}
            disabled={loadingAI}
            className="relative z-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-indigo-650/40 border-0 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed shrink-0"
          >
            {loadingAI ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Compiling matrices...
              </>
            ) : (
              <>
                <BrainCircuit className="w-4.5 h-4.5" />
                Run Gemini EDA
              </>
            )}
          </button>
        </div>
      )}

      {/* 2. MAIN BENTO GRID */}
      {aiAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in duration-300">
          {/* Executive Overview */}
          <div className="bg-slate-900/60 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-slate-800 shadow-2xl md:col-span-2 space-y-4 hover:border-slate-700 transition-colors">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2 pb-2.5 border-b border-slate-800/80">
              <Compass className="w-4.5 h-4.5 text-indigo-400" /> Executive Dataset Profile Summary
            </h3>
            <p className="text-xs text-slate-350 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-850 italic">
              "{aiAnalysis.overviewSummary}"
            </p>

            {/* Generated Insights */}
            <h4 className="font-extrabold text-slate-400 text-[10px] uppercase tracking-widest font-mono mt-5">
              Key Value Discoveries & Patterns
            </h4>
            <div className="space-y-3.5">
              {aiAnalysis.insights?.map((insight, idx) => (
                <div key={idx} className="flex gap-3 items-start text-xs font-sans">
                  <div className="w-5 h-5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold font-mono text-[10px] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="leading-relaxed text-slate-300">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Core Target Recommendation */}
          <div className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white p-6 sm:p-7 rounded-2xl border border-slate-850 shadow-2xl flex flex-col justify-between hover:border-slate-755 transition-colors duration-300">
            <div className="space-y-4">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-400/10 text-indigo-300 font-bold text-[9px] uppercase tracking-wider font-mono border border-indigo-500/10">
                Model Recommendation Engine
              </span>
              <h3 className="text-base font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" /> Advised ML Pathway
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Gemini assessed and evaluated all {dataset.columns.length} columns and advises selecting:
              </p>

              <div className="mt-4 p-4.5 bg-slate-950/60 rounded-xl border border-slate-800 text-center space-y-2">
                <p className="text-[10px] uppercase font-bold text-[#A8C5FF] tracking-widest font-mono">Target Column Field</p>
                <p className="text-lg font-mono font-extrabold text-white mt-1 uppercase tracking-tight">{aiAnalysis.recommendedTarget}</p>
                <div className="mt-2.5 flex justify-center">
                  <span className="px-3 py-1 bg-indigo-650 hover:bg-indigo-600 text-white font-mono font-bold rounded-lg text-[9px] uppercase tracking-wider shadow">
                    {aiAnalysis.modelType}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 mt-6 border-t border-slate-800 pt-4 font-sans leading-relaxed">
              <span className="font-bold text-slate-300 font-mono">Input Features:</span>{' '}
              <span className="font-mono text-[11px] text-indigo-300">{aiAnalysis.suggestedFeatures?.slice(0, 4).join(', ')}...</span>
            </div>
          </div>
        </div>
      )}

      {/* Analyst and Data Scientist Specific Focus Sections */}
      {aiAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-xs">
          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-3 hovering:border-slate-705">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5 border-b border-slate-800/80 pb-2.5">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> 6. Scientist Focus Directive
            </h3>
            <p className="text-slate-400 leading-relaxed">
              These variables demand diagnostics or transformation attention before establishing predictions:
            </p>
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1.5">
              <p className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">Target Field Diagnostics</p>
              <p className="text-sm font-extrabold text-white font-mono mt-0.5 tracking-tight">{aiAnalysis.scientistFocus}</p>
              <p className="text-slate-300 leading-relaxed mt-2 text-[11px]">{aiAnalysis.scientistRationale}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-3">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5 border-b border-slate-800/80 pb-2.5">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-400" /> Slicers & Interactive Visual Guidelines
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Workstation filter sliders and parameters should pivot along this dominant partition:
            </p>
            <div className="p-4 bg-[#10B981]/5 border border-[#10B981]/20 rounded-xl space-y-1.5">
              <p className="text-[10px] font-mono font-bold text-[#10B981] uppercase tracking-widest">Recommended Slicing Column</p>
              <p className="text-sm font-extrabold text-white font-mono mt-0.5 tracking-tight">{aiAnalysis.strategicSlicer}</p>
              <p className="text-slate-300 leading-relaxed mt-2 text-[11px]">
                This attribute is ideal for cohort filtering and data subsetting. Isolate columns across this coordinate to study variance indicators.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. BASIC DESCRIPTIVE STATISTICS CARDS */}
      <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <h3 className="font-extrabold text-white text-sm flex items-center gap-2 pb-2 border-b border-slate-800">
          <AreaChart className="w-4.5 h-4.5 text-indigo-400" /> Missing Field Proportions & Density Metrics
        </h3>
        <p className="text-xs text-slate-400 mt-2 mb-5">
          Workspace missingness scan indicating density distributions across all raw dataset columns.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {nullRates.map((item, idx) => (
            <div key={idx} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-mono font-extrabold text-white">{item.name}</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {item.rate}% Empty <span className="text-slate-550">({(item.type || '').toUpperCase()})</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    item.rate > 20
                      ? 'bg-rose-500'
                      : item.rate > 0
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(1.5, item.rate || 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
