/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  Layers,
  Compass,
  Cpu,
  Sliders,
  Newspaper,
  Brain,
  HelpCircle,
  Database,
  Terminal,
  ChevronRight,
  TrendingUp,
  Workflow,
  Sparkles,
  RefreshCw,
  Zap,
  CheckCircle,
  FolderOpen,
  Github,
  Linkedin,
  Mail,
  User
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
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);

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
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300" id="workstation_app">
      {/* Top Brushed Workspace Header */}
      <header className="h-16 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/60 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
          {/* Custom Styled AskDeepakAI Logo Pill Stack */}
          <div className="flex flex-col justify-between w-9 h-6 select-none shrink-0" id="brand_logo">
            {/* Top Bar */}
            <div className="h-[26%] w-full flex rounded-full overflow-hidden shadow-sm">
              <div className="w-[18%] h-full bg-[#1b5bd2]"></div>
              <div className="w-[82%] h-full bg-[#3bc8c8]"></div>
            </div>
            {/* Middle Bar */}
            <div className="h-[26%] w-full flex rounded-full overflow-hidden shadow-sm">
              <div className="w-[18%] h-full bg-[#3bc8c8]"></div>
              <div className="w-[82%] h-full bg-[#ef7222]"></div>
            </div>
            {/* Bottom Bar */}
            <div className="h-[26%] w-[52%] flex rounded-full overflow-hidden shadow-sm">
              <div className="w-[32%] h-full bg-[#dfa435]"></div>
              <div className="w-[68%] h-full bg-[#b22038]"></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white text-lg tracking-tight leading-none">
                <span className="font-light text-slate-300">Ask</span>
                <span className="font-extrabold text-white">Deepak</span>
                <span className="font-black text-teal-400">AI</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 tracking-wider">
                PRO-ANALYST v4.2
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Interactive Data Science & Automated Modeling Station</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeDataset && (
            <div className="hidden sm:flex items-center gap-2 bg-[#121B2A]/90 border border-slate-700/50 px-3.5 py-1.5 rounded-full shadow-inner text-xs">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-md shadow-emerald-400/50"></span>
              <span className="text-emerald-300 font-mono text-[11px] font-semibold">{activeDataset.filename}</span>
              <span className="text-slate-500 font-mono">|</span>
              <span className="text-slate-350 font-medium font-mono text-[11px]">{activeDataset.rowCount.toLocaleString()} units</span>
            </div>
          )}

          <button
            onClick={() => setIsAboutModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#3bc8c8]/30 bg-[#3bc8c8]/5 hover:bg-[#3bc8c8]/15 hover:border-[#3bc8c8]/50 text-[#3bc8c8] hover:text-[#57e2e2] transition-all duration-300 text-xs font-semibold select-none cursor-pointer shadow-md"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">About the Creator</span>
            <span className="xs:hidden">Creator</span>
          </button>
        </div>
      </header>

      {/* Persistent global error alert */}
      {errorLine && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-300 p-3 px-6 text-xs font-semibold flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-500/20 text-rose-400">⚠️</span>
            <span>{errorLine}</span>
          </div>
          <button 
            onClick={() => setErrorLine(null)}
            className="text-xs text-rose-400/70 hover:text-rose-300 transition-colors uppercase font-bold tracking-wider cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Tabbed Layout Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Mobile Tab-Track / Swiper (Shows only on mobile/tablet/smartwatch, hidden on md+) */}
        <div className="md:hidden bg-[#0A0D16] border-b border-slate-800/40 overflow-x-auto scrollbar-none sticky top-16 z-20 shrink-0">
          <div className="flex items-center px-4 py-3 gap-2 flex-nowrap whitespace-nowrap">
            {[
              { id: 'ingest', step: '01', label: 'Ingest', icon: FolderOpen },
              { id: 'clean', step: '02', label: 'Clean', icon: Layers, status: activeDataset ? 'unlocked' : 'locked' },
              { id: 'eda', step: '03', label: 'EDA Scan', icon: Compass, status: activeDataset ? 'unlocked' : 'locked' },
              { id: 'ml', step: '04', label: 'Modeling', icon: Cpu, status: activeDataset ? 'unlocked' : 'locked' },
              { id: 'dashboard', step: '05', label: 'Portal', icon: Sliders, status: activeDataset ? 'unlocked' : 'locked' },
              { id: 'reports', step: '06', label: 'Briefs', icon: Newspaper, status: activeDataset ? 'unlocked' : 'locked' },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              const isLocked = tab.id !== 'ingest' && !activeDataset;
              const IconComponent = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => !isLocked && setActiveTab(tab.id as any)}
                  disabled={isLocked}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-300 border cursor-pointer select-none shrink-0 ${
                    isLocked
                      ? 'opacity-25 bg-transparent border-slate-850 text-slate-500 cursor-not-allowed'
                      : isSelected
                      ? 'bg-indigo-600/10 text-indigo-405 text-indigo-400 border-indigo-500/40'
                      : 'bg-[#111624]/30 text-slate-300 border-slate-800/60 hover:text-white'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Futuristic Cyber Sidebar (Desktop & Laptop & TV View) */}
        <aside className="hidden md:flex w-full md:w-64 bg-[#0A0D16] border-r border-slate-800/85 flex-col justify-between shrink-0">
          <div className="flex-1 py-6 px-4 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#506690] font-bold px-3">Pipeline Stages</span>
              <p className="text-[11px] text-slate-500 px-3">Iterative modeling workflow</p>
            </div>
            
            <nav className="space-y-1.5">
              {[
                { id: 'ingest', step: '01', label: 'Data Ingestion', icon: FolderOpen, status: 'Ready' },
                { id: 'clean', step: '02', label: 'Cleaning Studio', icon: Layers, status: activeDataset ? 'Unlocked' : 'Locked' },
                { id: 'eda', step: '03', label: 'Exploratory Data Analysis', icon: Compass, status: activeDataset ? 'Active' : 'Locked' },
                { id: 'ml', step: '04', label: 'ML Modeling', icon: Cpu, status: activeDataset ? 'Active' : 'Locked' },
                { id: 'dashboard', step: '05', label: 'Interactive HUD', icon: Sliders, status: activeDataset ? 'Active' : 'Locked' },
                { id: 'reports', step: '06', label: 'Strategic Insights', icon: Newspaper, status: activeDataset ? 'Active' : 'Locked' },
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                const isLocked = tab.id !== 'ingest' && !activeDataset;
                const IconComponent = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => !isLocked && setActiveTab(tab.id as any)}
                    disabled={isLocked}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-300 relative group cursor-pointer ${
                      isLocked
                        ? 'opacity-30 cursor-not-allowed'
                        : isSelected
                        ? 'bg-gradient-to-r from-indigo-600/20 to-indigo-500/5 text-white border-l-2 border-indigo-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#111624]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-indigo-400 font-bold' : 'text-slate-600'} w-4`}>
                        {tab.step}
                      </span>
                      <IconComponent className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-355'} transition-colors`} />
                      <span className="text-xs">{tab.label}</span>
                    </div>
                    
                    {/* Status marker */}
                    <div className="flex items-center">
                      {isSelected ? (
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping absolute right-3" />
                      ) : null}
                      <span className="text-[9px] font-mono text-slate-500 scale-90 opacity-0 group-hover:opacity-100 transition-opacity">
                        {tab.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Guide styled beautifully like standard AI Analyst Advisory */}
          <div className="p-4 border-t border-slate-800/80 bg-[#090B12]/80">
            <div className="bg-[#12192A]/70 p-3.5 rounded-xl border border-indigo-500/10 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="w-3 h-3 text-indigo-400" /> Analyst Advisory
                </p>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Target recommendations: <span className="text-amber-400 font-semibold">'{aiAnalysis?.recommendedTarget || 'Unspecified'}'</span>. Churn weights mapped sequentially.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
              <span>Docker Node: active</span>
              <span className="text-slate-600">•</span>
              <span>Cluster: verified</span>
            </div>
          </div>
        </aside>

        {/* Workspace Display Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
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
                  dataset={activeDataset}
                  mlResult={mlResult}
                  aiAnalysis={aiAnalysis}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* General Ingestion Empty-State Case */}
          {!activeDataset && activeTab !== 'ingest' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-[#0C111C]/65 border border-slate-800/80 p-12 rounded-2xl max-w-lg mx-auto mt-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-[#10b981]" />
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                <Database className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="font-extrabold text-white text-base tracking-tight">Dataset Connection Incomplete</h3>
              <p className="text-xs text-slate-450 mt-2 max-w-sm mx-auto leading-relaxed">
                Before you can inspect rows, cleanse covariates, isolate exploratory patterns, or configure predictive machine learning models, please ingest a worksheet Template.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setActiveTab('ingest')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all duration-300 cursor-pointer shadow-lg shadow-indigo-650/20 border-0 flex items-center gap-2"
                >
                  <FolderOpen className="w-4 h-4" /> Go to Ingest Studio
                </button>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Footer Status Bar matching the design precisely */}
      <footer className="h-12 sm:h-10 bg-[#07090E]/90 border-t border-slate-800 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 py-2 sm:py-0 shrink-0 text-slate-400 text-[11px] font-mono select-none z-30">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-indigo-550 inline-block"></span>
            ENV: <strong className="text-slate-400">STREAMLIT_DEV_INST</strong>
          </span>
          <span className="text-slate-705">|</span>
          <span className="text-slate-500">
            METRICS COMPILIER: <strong className="text-slate-400">active</strong>
          </span>
        </div>
        <div className="text-slate-400 text-[10px] text-center tracking-normal font-sans">
          This app is designed, developed and maintained by{" "}
          <button
            type="button"
            onClick={() => setIsAboutModalOpen(true)}
            className="text-indigo-400 font-semibold font-mono hover:text-[#57e2e2] hover:underline bg-transparent border-0 p-0 cursor-pointer transition-colors inline"
          >
            Deepak Reddy
          </button>
        </div>
        <div className="flex items-center gap-2 text-indigo-400 uppercase tracking-wider font-bold text-[10px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          STAKEHOLDER READY
        </div>
      </footer>

      {/* About the Creator Modal Dialog */}
      <AnimatePresence>
        {isAboutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAboutModalOpen(false)}
              className="absolute inset-0 bg-[#06080c]/85 backdrop-blur-md"
            />

            {/* Modal Body Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-[#0B1220] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative z-10 shadow-2xl overflow-hidden"
            >
              {/* Modern Decorative Glow Layer */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-[#3bc8c8]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-44 h-44 bg-[#1b5bd2]/10 rounded-full blur-3xl pointer-events-none" />
              
              {/* Header Details */}
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                  {/* Creator Monogram Badge */}
                  <div className="w-14 h-14 bg-gradient-to-br from-[#1b5bd2] via-[#2cb2b2] to-[#3bc8c8] rounded-2xl flex items-center justify-center shadow-lg shadow-[#1b5bd2]/15 border border-slate-700/35">
                    <span className="text-white font-extrabold text-xl tracking-tight">DR</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base sm:text-lg tracking-tight">Gorisi Deepak Reddy</h3>
                    <p className="text-[10px] uppercase tracking-wider font-mono font-bold text-[#3bc8c8] mt-0.5">
                      Data Analyst & Analytics Engineer
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Budapest, Hungary
                    </p>
                  </div>
                </div>

                {/* Close Button Icon */}
                <button
                  onClick={() => setIsAboutModalOpen(false)}
                  className="p-1 px-2.5 rounded-lg border border-slate-800 bg-[#0f1524] text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-bold"
                  aria-label="Close Profile"
                >
                  ✕
                </button>
              </div>

              {/* Bio Content Div */}
              <div className="mt-6 text-xs text-slate-300 leading-relaxed font-normal bg-[#080d19] p-5 rounded-2xl border border-slate-800/40 relative z-10">
                <span className="text-[9px] uppercase font-bold text-slate-500 font-mono tracking-widest block mb-1.5">
                  Professional Bio
                </span>
                <p>
                  I am <strong className="text-white font-semibold">Gorisi Deepak Reddy</strong>, a Data Analyst and Analytics Engineer based in Budapest. Holding an MSc in IT for Business Data Analytics, I specialize in building end-to-end data pipelines that bridge the gap between technical data insights and business strategy.
                </p>
                <p className="mt-2.5">
                  My core technical expertise spans Python, SQL, predictive machine learning, and advanced data visualization. I engineered <strong className="text-[#3bc8c8] font-semibold">AskDeepakAI</strong> to automate the rigorous data science workflow, instantly transforming raw data into clean pipelines, ML analyses, and actionable business reports. I am currently open to Data Analyst or BI roles where I can continue deploying ROI-driven analytical solutions.
                </p>
              </div>

              {/* Redirection Links Buttons Block */}
              <div className="mt-6 space-y-2.5 relative z-10">
                <span className="text-[9px] uppercase font-bold text-slate-500 font-mono tracking-widest block mb-1">
                  Connect & Collaborate
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-1 sm:px-0">
                  <a
                    href="https://github.com/thedeepakreddy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-800 bg-[#0f1524] hover:bg-[#151c30] text-slate-200 hover:text-white text-xs font-semibold hover:border-slate-700 transition-all duration-300 select-none cursor-pointer font-mono"
                  >
                    <Github className="w-3.5 h-3.5 text-slate-400" />
                    <span>GitHub</span>
                  </a>
                  
                  <a
                    href="https://www.linkedin.com/in/deepak-reddy-038582223"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-800 bg-[#0f1524] hover:bg-[#151c30] text-slate-200 hover:text-white text-xs font-semibold hover:border-slate-700 transition-all duration-300 select-none cursor-pointer font-mono"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                    <span>LinkedIn</span>
                  </a>

                  <a
                    href="mailto:thedeepakreddy1@gmail.com"
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#3bc8c8]/20 bg-[#3bc8c8]/5 hover:bg-[#3bc8c8]/10 text-[#3bc8c8] hover:text-[#57e2e2] text-xs font-semibold border-solid transition-all duration-300 select-none cursor-pointer font-mono"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Write Mail</span>
                  </a>
                </div>
              </div>

              {/* Action Close Frame Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsAboutModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#141b2e] hover:bg-[#1a233c] text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
