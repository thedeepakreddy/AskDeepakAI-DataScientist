/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AreaChart, Eye, Compass, TrendingUp, AlertTriangle, Lightbulb, Users, BrainCircuit } from 'lucide-react';
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
    <div className="space-y-6" id="eda_module">
      {/* Dynamic AI Generation Banner if analysis is null */}
      {!aiAnalysis && (
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-7 rounded-xl border border-indigo-950 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in">
          <div>
            <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest bg-indigo-900/50 px-2 py-0.5 rounded border border-indigo-700/50">COGNITIVE COMPILING ENGINE</span>
            <h3 className="text-base font-bold leading-relaxed flex items-center gap-2 mt-2">
              <BrainCircuit className="w-5 h-5 text-indigo-400" /> Generate Intelligence-Driven EDA Report
            </h3>
            <p className="text-xs text-indigo-200 mt-1 max-w-xl leading-relaxed">
              Compile an extensive business exploratory analysis report with Gemini. It automatically isolates target values, suggests slicers, and predicts optimal machine learning pipelines.
            </p>
          </div>
          <button
            onClick={onTriggerAI}
            disabled={loadingAI}
            className="bg-white hover:bg-slate-50 text-indigo-950 font-bold text-xs py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 transition-all duration-150 shadow border-0 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed shrink-0"
          >
            {loadingAI ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-indigo-950 border-t-transparent rounded-full animate-spin" />
                Compiling insights...
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4 text-indigo-600" />
                Run Gemini EDA
              </>
            )}
          </button>
        </div>
      )}

      {/* 2. MAIN BENTO GRID */}
      {aiAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in animate-duration-150">
          {/* Executive Overview */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
            <h3 className="font-bold text-slate-850 text-sm flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-100">
              <Compass className="w-4.5 h-4.5 text-indigo-600" /> Executive Dataset Profile
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 italic">
              "{aiAnalysis.overviewSummary}"
            </p>

            {/* Generated Insights */}
            <h4 className="font-bold text-slate-800 text-xs mt-5 mb-3 uppercase tracking-wider">
              Key Value Discoveries & Patterns
            </h4>
            <div className="space-y-3">
              {aiAnalysis.insights?.map((insight, idx) => (
                <div key={idx} className="flex gap-3 items-start text-xs text-slate-600 font-sans">
                  <div className="w-5 h-5 bg-indigo-50 border border-indigo-100/50 text-indigo-600 font-bold text-[10px] rounded flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="leading-relaxed text-slate-600">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Core Target Recommendation */}
          <div className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white p-6 rounded-xl border border-slate-900 shadow-sm flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[9px] uppercase tracking-wider">
                Model Recommendation Engine
              </span>
              <h3 className="text-base font-bold text-white tracking-tight mt-3 flex items-center gap-1.5">
                <BrainCircuit className="w-5 h-5 text-indigo-400" /> Selected ML Pathway
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Gemini evaluated all {dataset.columns.length} columns and advises targeting:
              </p>

              <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Target Field</p>
                <p className="text-base font-mono font-bold text-white mt-1 uppercase tracking-tight">{aiAnalysis.recommendedTarget}</p>
                <div className="mt-2.5 flex justify-center gap-1">
                  <span className="px-2 py-0.5 bg-indigo-600 text-white font-bold rounded text-[9px] uppercase tracking-wider">
                    {aiAnalysis.modelType}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 mt-5 border-t border-white/10 pt-3 font-sans">
              <span className="font-bold text-slate-300">Advised features:</span>{' '}
              <span className="font-mono text-[11px] text-slate-200">{aiAnalysis.suggestedFeatures?.slice(0, 4).join(', ')}...</span>
            </div>
          </div>
        </div>
      )}

      {/* Analyst and Data Scientist Specific Focus Sections */}
      {aiAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in text-xs">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-805 text-sm flex items-center gap-1.5 mb-2.5">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500" /> 6. Scientist Focus Directive
            </h3>
            <p className="text-slate-500 mb-3 leading-relaxed">
              We identified specific columns requiring immediate manual diagnostics by Data Scientists / Business Analysts:
            </p>
            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg">
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Column Focus Area</p>
              <p className="text-sm font-bold text-amber-900 font-mono mt-0.5">{aiAnalysis.scientistFocus}</p>
              <p className="text-slate-700 leading-relaxed mt-2 text-[11px]">{aiAnalysis.scientistRationale}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-805 text-sm flex items-center gap-1.5 mb-2.5">
              <TrendingUp className="w-4.5 h-4.5 text-indigo-600" /> Slicers & Interactive Visual Guidelines
            </h3>
            <p className="text-slate-500 mb-3 leading-relaxed">
              To understand stakeholders patterns, dashboards must dynamically adjust along this dominant dimension:
            </p>
            <div className="p-4 bg-indigo-50/30 border border-indigo-150 rounded-lg">
              <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">Configured Filter Slicer</p>
              <p className="text-sm font-bold text-indigo-950 font-mono mt-0.5">{aiAnalysis.strategicSlicer}</p>
              <p className="text-slate-700 leading-relaxed mt-2 text-[11px]">
                This categorical metric isolates stakeholders, allowing filters, range values and slicers on the visual dashboard to cleanly isolate variations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. BASIC DESCRIPTIVE STATISTICS CARDS */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-3">
          <AreaChart className="w-4.5 h-4.5 text-indigo-600" /> Missing Field Proportions & Data Generalizations
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Visual profile showing missing values concentration across all fields in the dataset.
        </p>

        <div className="space-y-3.5">
          {nullRates.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600">
                <span className="font-mono font-bold text-slate-800">{item.name}</span>
                <span className="text-[11px] font-mono text-slate-500">
                  {item.rate}% Missing <span className="text-slate-400 font-sans">({item.type.toUpperCase()})</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.rate > 20
                      ? 'bg-rose-500'
                      : item.rate > 0
                      ? 'bg-amber-500'
                      : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.max(1, item.rate || 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
