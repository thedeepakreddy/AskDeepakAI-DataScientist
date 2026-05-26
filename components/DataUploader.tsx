/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Play, HelpCircle } from 'lucide-react';
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
    <div className="space-y-6" id="uploader_module">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">DATA ACQUISITION</span>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight mt-1">1. Ingest Raw Dataset</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select or drop any CSV datatable or pick one of AskDeepakAI's high-fidelity business telemetry templates.
            </p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded border border-emerald-100 uppercase tracking-wide flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Client Sandbox Active
          </span>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/30 shadow-sm'
              : 'border-slate-250 hover:border-indigo-400 hover:bg-slate-50/50'
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
          <div className="w-12 h-12 bg-indigo-50 rounded bg-indigo-50/80 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Drag and drop your CSV dataset here</p>
          <p className="text-xs text-slate-500 mt-1">or click to browse local files from your hardware</p>
          <p className="text-[10px] text-slate-400 mt-2 max-w-sm mx-auto bg-slate-50 py-1.5 px-3 rounded border border-slate-100 font-mono">
            UTF-8 character-mapped files supported. Commas inside quotes are auto-handled.
          </p>
        </div>

        {errorLine && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900">Ingestion Error</p>
              <p className="mt-0.5">{errorLine}</p>
            </div>
          </div>
        )}
      </div>

      {/* Built-in Samples Generator */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
          Or Play Instantly with Pre-Loaded Worksheets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => loadSample('churn')}
            className={`text-left p-4 rounded-xl border transition-all text-xs flex justify-between items-start group hover:-translate-y-0.5 duration-150 cursor-pointer ${
              currentDataset?.filename.includes('churn')
                ? 'border-indigo-500 bg-indigo-50/30'
                : 'border-slate-150 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className="space-y-1.5">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[9px] uppercase tracking-wider">
                Subscription Model
              </span>
              <p className="font-bold text-slate-800 pr-2 leading-snug">Customer Churn & Charge Analytics</p>
              <p className="text-[11px] text-slate-500 leading-normal">Includes ContractType, PaymentMethod, charges history, tenure, age.</p>
            </div>
            <span className="bg-white group-hover:bg-indigo-600 group-hover:text-white p-1.5 rounded border border-slate-200 transition-colors inline-block text-indigo-600 shrink-0">
              <Play className="w-3.5 h-3.5 fill-current" />
            </span>
          </button>

          <button
            onClick={() => loadSample('saas')}
            className={`text-left p-4 rounded-xl border transition-all text-xs flex justify-between items-start group hover:-translate-y-0.5 duration-150 cursor-pointer ${
              currentDataset?.filename.includes('saas')
                ? 'border-indigo-500 bg-indigo-50/30'
                : 'border-slate-150 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className="space-y-1.5">
              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[9px] uppercase tracking-wider">
                B2B Revenue Series
              </span>
              <p className="font-bold text-slate-800 pr-2 leading-snug">SaaS Enterprise Financials & ARR</p>
              <p className="text-[11px] text-slate-500 leading-normal">MRR expansion tracking, customer success ratings, support ticket logs.</p>
            </div>
            <span className="bg-white group-hover:bg-indigo-600 group-hover:text-white p-1.5 rounded border border-slate-200 transition-colors inline-block text-indigo-600 shrink-0">
              <Play className="w-3.5 h-3.5 fill-current" />
            </span>
          </button>

          <button
            onClick={() => loadSample('hardware')}
            className={`text-left p-4 rounded-xl border transition-all text-xs flex justify-between items-start group hover:-translate-y-0.5 duration-150 cursor-pointer ${
              currentDataset?.filename.includes('hardware')
                ? 'border-indigo-500 bg-indigo-50/30'
                : 'border-slate-150 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className="space-y-1.5">
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[9px] uppercase tracking-wider">
                Internet of Things
              </span>
              <p className="font-bold text-slate-800 pr-2 leading-snug">Machinery Telemetry & Maintenance</p>
              <p className="text-[11px] text-slate-500 leading-normal">Continuous operation hours, machine temperatures, vibration levels, status.</p>
            </div>
            <span className="bg-white group-hover:bg-indigo-600 group-hover:text-white p-1.5 rounded border border-slate-200 transition-colors inline-block text-indigo-600 shrink-0">
              <Play className="w-3.5 h-3.5 fill-current" />
            </span>
          </button>
        </div>
      </div>

      {/* Dataset Overview Schema */}
      {currentDataset && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Active Workspace Schema: {currentDataset.filename}</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl mb-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium font-sans">Total Rows Loaded</p>
              <p className="text-xl font-bold font-mono text-slate-800 mt-1">{currentDataset.rowCount}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium font-sans">Features Size</p>
              <p className="text-xl font-bold font-mono text-slate-800 mt-1">{currentDataset.columns.length} Fields</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium font-sans">Numeric Attributes</p>
              <p className="text-xl font-bold font-mono text-slate-800 mt-1">
                {currentDataset.columns.filter(c => c.type === 'numeric').length}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium font-sans">Categorical / Labels</p>
              <p className="text-xl font-bold font-mono text-slate-800 mt-1">
                {currentDataset.columns.filter(c => c.type === 'categorical').length}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-3 text-slate-700 font-bold uppercase tracking-wider text-[10px]">Field Name</th>
                  <th className="p-3 text-slate-700 font-bold uppercase tracking-wider text-[10px]">Data Type</th>
                  <th className="p-3 text-slate-700 font-bold uppercase tracking-wider text-[10px]">Cardinality (Distinct)</th>
                  <th className="p-3 text-slate-700 font-bold uppercase tracking-wider text-[10px]">Missing Rates</th>
                  <th className="p-3 text-slate-700 font-bold uppercase tracking-wider text-[10px]">Statistical Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentDataset.columns.map((col) => {
                  const missingRate = ((col.missingCount / currentDataset.rowCount) * 100).toFixed(1);
                  return (
                    <tr key={col.name} className="hover:bg-slate-50/50 font-sans">
                      <td className="p-3 font-semibold text-slate-800 font-mono">{col.name}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wide ${
                            col.type === 'numeric'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : col.type === 'datetime'
                              ? 'bg-purple-50 text-purple-700 border border-purple-100'
                              : col.type === 'boolean'
                              ? 'bg-sky-50 text-sky-700 border border-sky-100'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {col.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-mono">{col.distinctCount} values</td>
                      <td className="p-3">
                        <span className={`font-mono ${col.missingCount > 0 ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                          {col.missingCount} ({missingRate}%)
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 italic max-w-sm truncate font-mono text-[11px]">
                        {col.type === 'numeric' ? (
                          <span>
                            Mean: {col.statistics.mean} | Range: [{col.statistics.min}, {col.statistics.max}]
                          </span>
                        ) : (
                          <span>
                            Top: {col.statistics.mostCommon?.[0]?.value || 'N/A'}{' '}
                            <span className="text-slate-400">({col.statistics.mostCommon?.[0]?.count} times)</span>
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
