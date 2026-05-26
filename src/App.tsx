/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Layers,
  Compass,
  Cpu,
  Sliders,
  Newspaper,
  Brain,
  HelpCircle
} from 'lucide-react';
import { Dataset, MLResult } from './types';
import DataUploader from './components/DataUploader';
import DataCleaning from './components/DataCleaning';
import EDAReport from './components/EDAReport';
import MLPipeline from './components/MLPipeline';
import StakeholderDashboard from './components/StakeholderDashboard';
import ReportsHub from './components/ReportsHub';

export default function App() {
  const [originalDataset, setOriginalDataset] = useState<Dataset | null>(null);
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);
  const [activeTab, setActiveTab] = useState<'ingest' | 'clean' | 'eda' | 'ml' | 'dashboard' | 'reports'>('ingest');

  // AI & ML States
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [mlResult, setMlResult] = useState<MLResult | null>(null);
  const [loadingML, setLoadingML] = useState<boolean>(false);
  const [errorLine, setErrorLine] = useState<string | null>(null);

  const handleDatasetLoaded = (dataset: Dataset) => {
    setOriginalDataset(dataset);
    setActiveDataset(JSON.parse(JSON.stringify(dataset))); // Deep copy
    setAiAnalysis(null);
    setMlResult(null);
    setErrorLine(null);
    setActiveTab('clean'); // Auto shift to cleaning tab once uploaded!
  };

  const handleUpdateDataset = (updated: Dataset) => {
    setActiveDataset(updated);
    // Reset AI analysis since data changed
    setAiAnalysis(null);
    setMlResult(null);
  };

  const handleResetOriginal = () => {
    if (originalDataset) {
      setActiveDataset(JSON.parse(JSON.stringify(originalDataset)));
      setAiAnalysis(null);
      setMlResult(null);
    }
  };

  // 1. RUN GEMINI AUTOMATED EXPLORATORY SCAN
  const triggerAIScan = async () => {
    if (!activeDataset) return;
    setLoadingAI(true);
    setErrorLine(null);
    try {
      // Send key variables metadata only to minimize token load
      const payloadCols = activeDataset.columns.map(c => ({
        name: c.name,
        type: c.type,
        missingCount: c.missingCount,
        distinctCount: c.distinctCount,
        statistics: c.statistics
      }));

      const res = await fetch('/api/analyze-dataset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: activeDataset.filename,
          rowCount: activeDataset.rowCount,
          columns: payloadCols
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Backend analysis failed');
      }

      const parsed = await res.json();
      setAiAnalysis(parsed);
    } catch (err: any) {
      console.error(err);
      setErrorLine('AI exploratory analysis failed: ' + (err.message || 'Check model keys.'));
    } finally {
      setLoadingAI(false);
    }
  };

  // 2. RUN MACHINE LEARNING PIPELINE
  const triggerPrediction = async (
    targetCol: string,
    features: string[],
    modelClass: 'classification' | 'regression' | 'timeseries',
    hyperparameters: Record<string, any>
  ) => {
    if (!activeDataset) throw new Error('No dataset active');
    setLoadingML(true);
    setErrorLine(null);
    try {
      // Package payload with headers stats and a 30-row raw sample to let Gemini analyze distribution correlations
      const datasetColumns = activeDataset.columns.map(c => ({ name: c.name, type: c.type }));
      const datasetRowsSample = activeDataset.rows.slice(0, 30);

      const res = await fetch('/api/run-ml-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: targetCol,
          features,
          modelType: modelClass,
          hyperparameters,
          datasetColumns,
          datasetRowsSample
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'ML pipeline processing failed');
      }

      const result = await res.json();
      setMlResult(result);
      return result;
    } catch (err: any) {
      console.error(err);
      setErrorLine('ML training execution failed: ' + (err.message || 'Check terminal server.'));
      throw err;
    } finally {
      setLoadingML(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="workstation_app">
      {/* Dynamic Header */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white">
            <Brain className="w-4.5 h-4.5" />
          </div>
          <span className="font-bold text-slate-800 text-base tracking-tight">
            AskDeepakAI <span className="font-normal text-slate-400">| Data Analysis Workstation</span>
          </span>
        </div>

        {activeDataset && (
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full font-semibold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span className="text-slate-600 font-mono text-[11px]">{activeDataset.filename}</span>
              <span className="text-slate-400">({activeDataset.rowCount} rows)</span>
            </div>
          </div>
        )}
      </header>

      {/* Persistent global error alert */}
      {errorLine && (
        <div className="bg-rose-50 border-b border-rose-100 text-rose-800 p-3 px-6 text-xs font-semibold flex items-center gap-2 shrink-0">
          <span>⚠️ {errorLine}</span>
        </div>
      )}

      {/* Tabbed workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation panel */}
        <aside className="w-full md:w-56 bg-slate-900 flex flex-col shrink-0">
          <nav className="flex-1 py-6 px-4 space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3 px-2">Pipeline Stages</div>
            
            <button
              onClick={() => setActiveTab('ingest')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors ${
                activeTab === 'ingest'
                  ? 'text-white bg-indigo-600/20 border-l-4 border-indigo-500 rounded-r'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-mono opacity-60 w-4">01</span>
              <span className="text-xs font-medium">Data Ingest</span>
            </button>

            <button
              onClick={() => setActiveTab('clean')}
              disabled={!activeDataset}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors ${
                !activeDataset
                  ? 'opacity-35 cursor-not-allowed text-slate-600'
                  : activeTab === 'clean'
                  ? 'text-white bg-indigo-600/20 border-l-4 border-indigo-500 rounded-r'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-mono opacity-60 w-4">02</span>
              <span className="text-xs font-medium">Cleaning Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('eda')}
              disabled={!activeDataset}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors ${
                !activeDataset
                  ? 'opacity-35 cursor-not-allowed text-slate-600'
                  : activeTab === 'eda'
                  ? 'text-white bg-indigo-600/20 border-l-4 border-indigo-500 rounded-r'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-mono opacity-60 w-4">03</span>
              <span className="text-xs font-medium">Exploratory EDA</span>
            </button>

            <button
              onClick={() => setActiveTab('ml')}
              disabled={!activeDataset}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors ${
                !activeDataset
                  ? 'opacity-35 cursor-not-allowed text-slate-600'
                  : activeTab === 'ml'
                  ? 'text-white bg-indigo-600/20 border-l-4 border-indigo-500 rounded-r'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-mono opacity-60 w-4">04</span>
              <span className="text-xs font-medium">ML Modeling</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              disabled={!activeDataset}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors ${
                !activeDataset
                  ? 'opacity-35 cursor-not-allowed text-slate-600'
                  : activeTab === 'dashboard'
                  ? 'text-white bg-indigo-600/20 border-l-4 border-indigo-500 rounded-r'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-mono opacity-60 w-4">05</span>
              <span className="text-xs font-medium">Dashboard UI</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              disabled={!activeDataset}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors ${
                !activeDataset
                  ? 'opacity-35 cursor-not-allowed text-slate-600'
                  : activeTab === 'reports'
                  ? 'text-white bg-indigo-600/20 border-l-4 border-indigo-500 rounded-r'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-mono opacity-60 w-4">06</span>
              <span className="text-xs font-medium">Strategic Insights</span>
            </button>
          </nav>

          {/* User Guide styled beautifully like standard AI Analyst Advisory */}
          <div className="p-4 border-t border-slate-850">
            <div className="bg-indigo-900/40 p-3.5 rounded-lg border border-indigo-700/50">
              <p className="text-[10px] text-indigo-300 font-bold uppercase mb-1 flex items-center gap-1">
                <Brain className="w-3 h-3 text-indigo-400" /> Analyst Advisory
              </p>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                Focus on <span className="text-yellow-400 font-bold underline">'{aiAnalysis?.recommendedTarget || 'Target Column'}'</span>. Churn probability weights computed.
              </p>
            </div>
            <div className="mt-3 text-[9px] text-slate-500 text-center font-mono">
              AskDeepakAI Workstation • Ready
            </div>
          </div>
        </aside>

        {/* Workspace Display Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-6xl mx-auto w-full">
          {activeTab === 'ingest' && (
            <DataUploader onDatasetLoaded={handleDatasetLoaded} currentDataset={activeDataset} />
          )}

          {activeTab === 'clean' && activeDataset && (
            <DataCleaning
              dataset={activeDataset}
              onUpdateDataset={handleUpdateDataset}
              onResetOriginal={handleResetOriginal}
            />
          )}

          {activeTab === 'eda' && activeDataset && (
            <EDAReport
              dataset={activeDataset}
              aiAnalysis={aiAnalysis}
              loadingAI={loadingAI}
              onTriggerAI={triggerAIScan}
            />
          )}

          {activeTab === 'ml' && activeDataset && (
            <MLPipeline
              dataset={activeDataset}
              aiSuggestedTarget={aiAnalysis?.recommendedTarget}
              aiSuggestedType={aiAnalysis?.modelType}
              aiSuggestedFeatures={aiAnalysis?.suggestedFeatures}
              onTriggerPrediction={triggerPrediction}
              mlResult={mlResult}
              loadingML={loadingML}
            />
          )}

          {activeTab === 'dashboard' && activeDataset && (
            <StakeholderDashboard
              dataset={activeDataset}
              strategicSlicer={aiAnalysis?.strategicSlicer}
            />
          )}

          {activeTab === 'reports' && activeDataset && (
            <ReportsHub
              filename={activeDataset.filename}
              mlResult={mlResult}
              aiAnalysis={aiAnalysis}
            />
          )}

          {/* General Ingestion Empty-State Case */}
          {!activeDataset && activeTab !== 'ingest' && (
            <div className="text-center bg-white border border-slate-200 p-12 rounded-2xl max-w-md mx-auto mt-12 animate-fade-in shadow-sm">
              <FileSpreadsheet className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">Ingest Dataset First</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Before you can clean covariates, compile exploratory reports, or configure predictive machine learning models, please upload a dataset or select a sample in Step 1.
              </p>
              <button
                onClick={() => setActiveTab('ingest')}
                className="mt-4 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs py-2 px-4 rounded-lg transition-colors border-0 cursor-pointer shadow-sm"
              >
                Go to Ingest Studio
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Footer Status Bar matching the design precisely */}
      <footer className="h-8 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 text-slate-500">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-400">System: STREAMLIT_PRO_INST</span>
          <span className="text-[10px] font-bold text-slate-400">Last Sync: Live Stream Active</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-wide">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          STAKEHOLDER REPORT READY
        </div>
      </footer>
    </div>
  );
}

