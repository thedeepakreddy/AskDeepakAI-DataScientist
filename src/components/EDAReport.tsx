/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Play, HelpCircle, HardDrive, Cpu, Terminal, Sparkles, FolderPlus, ArrowRight, BrainCircuit } from 'lucide-react';
import { Dataset } from '../types';
import { parseCSV, loadSampleDataset } from '../utils/csvParser';

interface DataUploaderProps {
  onDatasetLoaded: (dataset: Dataset) => void;
  currentDataset: Dataset | null;
}

export default function DataUploader({ onDatasetLoaded, currentDataset }: DataUploaderProps) {
  const [errorLine, setErrorLine] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setErrorLine(null);
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setErrorLine('Only standard CSV or delimited TXT files are supported directly in the browser. Try loading a sample dataset below!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text, file.name);
        onDatasetLoaded(parsed);
      } catch (err: any) {
        setErrorLine(err.message || 'Error occurred while parsing the CSV file. Verify columns and formatting.');
      }
    };
    reader.onerror = () => {
      setErrorLine('File read failed. Try again or check details.');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const loadSample = (key: 'churn' | 'saas' | 'hardware') => {
    setErrorLine(null);
    try {
      const parsed = loadSampleDataset(key);
      onDatasetLoaded(parsed);
    } catch (err: any) {
      setErrorLine('Failed to load sample dataset: ' + err.message);
    }
  };

  return (
    <div className="space-y-8" id="uploader_module">
      {/* Dynamic Glass Container */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 tracking-widest font-mono uppercase">WORKSPACE INGESTION</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight mt-1">1. Drop Your Raw Dataset Below</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Upload custom customer sheets or invoke AskDeepakAI's specialized pre-packaged commercial simulation templates.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            <span className="bg-[#131B2E]/90 text-indigo-400 text-[10px] font-mono font-bold px-3 py-1 rounded-full border border-indigo-500/30 uppercase tracking-wide flex items-center gap-1.5 shadow-md">
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              ML Pipeline Stage: ACTIVE
            </span>
            <span className="bg-[#121B2A]/90 text-emerald-400 text-[10px] font-mono font-bold px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wide flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              VITE_SANDBOX: ACTIVE
            </span>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 relative group overflow-hidden ${
            isDragging
              ? 'border-indigo-400 bg-indigo-500/10 shadow-lg shadow-indigo-500/5'
              : 'border-slate-800 bg-slate-950/40 hover:border-indigo-500/80 hover:bg-slate-900/40 hover:shadow-xl'
          }`}
          id="file_drop_zone"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.txt"
            className="hidden"
          />

          <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
            <Upload className="w-6 h-6 text-indigo-400" />
          </div>
          <p className="text-sm font-bold text-slate-200">Drag & drop your character delimited file here</p>
          <p className="text-xs text-slate-500 mt-1">or click to securely explore storage directories</p>
          
          <div className="mt-4 max-w-sm mx-auto bg-slate-950/80 hover:bg-slate-950 text-slate-400 py-2 px-4 rounded-xl border border-slate-800/80 font-mono text-[10px] flex items-center justify-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Format support: Multi-column UTF8 .csv or .txt templates</span>
          </div>
        </div>

        {errorLine && (
          <div className="mt-5 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-xs flex items-start gap-3 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-white">Parser Failure Encountered</p>
              <p className="mt-1 leading-relaxed text-slate-300">{errorLine}</p>
            </div>
          </div>
        )}
      </div>

      {/* Industrial Template Cards */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-extrabold text-indigo-400 tracking-wider uppercase font-mono px-1">
          Select From Enterprise Simulation Corporas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <button
            onClick={() => loadSample('churn')}
            className={`text-left p-5 rounded-2xl border transition-all text-xs flex justify-between items-start group hover:-translate-y-1 hover:shadow-2xl duration-300 cursor-pointer ${
              currentDataset?.filename.includes('churn')
                ? 'border-indigo-500/80 bg-indigo-950/20 shadow-lg shadow-indigo-550/10'
                : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3 flex-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold text-[9px] uppercase tracking-wider font-mono border border-blue-500/20">
                Telecom Churn
              </span>
              <div>
                <p className="font-bold text-slate-200 text-sm group-hover:text-white transition-colors">Customer Churn Metric</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Analyze subscribers churn triggers, payment contracts, tenure lengths, average charges, and demographics.
                </p>
              </div>
            </div>
            <span className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 text-indigo-400 shrink-0 mt-1 shadow-sm">
              <Play className="w-3.5 h-3.5 fill-current" />
            </span>
          </button>

          <button
            onClick={() => loadSample('saas')}
            className={`text-left p-5 rounded-2xl border transition-all text-xs flex justify-between items-start group hover:-translate-y-1 hover:shadow-2xl duration-300 cursor-pointer ${
              currentDataset?.filename.includes('saas')
                ? 'border-indigo-500/80 bg-indigo-950/20 shadow-lg shadow-indigo-550/10'
                : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3 flex-1">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold text-[9px] uppercase tracking-wider font-mono border border-purple-500/20">
                SaaS ARR Model
              </span>
              <div>
                <p className="font-bold text-slate-200 text-sm group-hover:text-white transition-colors">Enterprise Fin-Tech Series</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Evaluate recurring accounts metrics sizes, customer success feedback, SLA support tickets, and renewal odds.
                </p>
              </div>
            </div>
            <span className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 text-indigo-400 shrink-0 mt-1 shadow-sm">
              <Play className="w-3.5 h-3.5 fill-current" />
            </span>
          </button>

          <button
            onClick={() => loadSample('hardware')}
            className={`text-left p-5 rounded-2xl border transition-all text-xs flex justify-between items-start group hover:-translate-y-1 hover:shadow-2xl duration-300 cursor-pointer ${
              currentDataset?.filename.includes('hardware')
                ? 'border-indigo-500/80 bg-indigo-950/20 shadow-lg shadow-indigo-550/10'
                : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3 flex-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[9px] uppercase tracking-wider font-mono border border-emerald-500/20">
                IoT Telemetry
              </span>
              <div>
                <p className="font-bold text-slate-200 text-sm group-hover:text-white transition-colors">Heavy Machinery Diagnostics</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Observe thermal variables threshold points, vibration magnitudes, continuous uptime metrics, and success status.
                </p>
              </div>
            </div>
            <span className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 text-indigo-400 shrink-0 mt-1 shadow-sm">
              <Play className="w-3.5 h-3.5 fill-current" />
            </span>
          </button>
        </div>
      </div>

      {/* Dataset Overview Schema */}
      {currentDataset && (
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 shadow-xl animate-fade-in relative">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-800">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-white text-base">Ingested Workspace Profile Model</h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-slate-950/60 border border-slate-800/80 rounded-2xl mb-6 text-xs">
            <div>
              <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider font-mono">Row Cardinality</p>
              <p className="text-2xl font-extrabold text-white mt-1.5 font-mono">{currentDataset.rowCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider font-mono">Input Features Dimension</p>
              <p className="text-2xl font-extrabold text-indigo-400 mt-1.5 font-mono">{currentDataset.columns.length} Columns</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider font-mono">Float/Int Scalars</p>
              <p className="text-2xl font-extrabold text-amber-500 mt-1.5 font-mono">
                {currentDataset.columns.filter(c => c.type === 'numeric').length}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium uppercase text-[10px] tracking-wider font-mono">Categorical Variables</p>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1.5 font-mono">
                {currentDataset.columns.filter(c => c.type === 'categorical' || c.type === 'boolean').length}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/30">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono">
                  <th className="p-3.5 text-[10px] uppercase tracking-wider font-bold">Field Attribute</th>
                  <th className="p-3.5 text-[10px] uppercase tracking-wider font-bold">DataType Mapping</th>
                  <th className="p-3.5 text-[10px] uppercase tracking-wider font-bold">In-class Cardinality</th>
                  <th className="p-3.5 text-[10px] uppercase tracking-wider font-bold">Null Rate Density</th>
                  <th className="p-3.5 text-[10px] uppercase tracking-wider font-bold">Sub-Cohort Statistics Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {currentDataset.columns.map((col) => {
                  const missingRate = ((col.missingCount / currentDataset.rowCount) * 100).toFixed(1);
                  return (
                    <tr key={col.name} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-3.5 font-extrabold text-slate-200 font-mono tracking-tight">{col.name}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider font-mono border ${
                            col.type === 'numeric'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                              : col.type === 'datetime'
                              ? 'bg-purple-500/15 text-purple-400 border-purple-500/25'
                              : col.type === 'boolean'
                              ? 'bg-sky-500/15 text-sky-450 border-sky-500/25'
                              : 'bg-slate-500/15 text-slate-300 border-slate-500/25'
                          }`}
                        >
                          {(col.type || '').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono font-medium">{col.distinctCount.toLocaleString()} classes</td>
                      <td className="p-3.5">
                        <span className={`font-mono text-xs ${col.missingCount > 0 ? 'text-rose-450 font-extrabold' : 'text-slate-500 font-medium'}`}>
                          {col.missingCount.toLocaleString()} ({missingRate}%)
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 italic font-mono text-[11px] max-w-sm truncate">
                        {col.type === 'numeric' ? (
                          <span className="text-slate-300">
                            Mean: <strong className="text-slate-200">{col.statistics.mean}</strong> | Limits: <span className="text-slate-400">[{col.statistics.min}, {col.statistics.max}]</span>
                          </span>
                        ) : (
                          <span className="text-slate-300">
                            Top Profile: <strong className="text-slate-200">{col.statistics.mostCommon?.[0]?.value || 'N/A'}</strong>{' '}
                            <span className="text-slate-450/80">({col.statistics.mostCommon?.[0]?.count} counts)</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
