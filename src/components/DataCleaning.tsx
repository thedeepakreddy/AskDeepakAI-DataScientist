/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trash2, RefreshCw, Layers, CheckCircle, Flame, Plus, AlertCircle, Sparkles, Database, FileText, Settings2 } from 'lucide-react';
import { Dataset, CleaningOperation } from '../types';

interface DataCleaningProps {
  dataset: Dataset;
  onUpdateDataset: (updated: Dataset) => void;
  onResetOriginal: () => void;
}

export default function DataCleaning({ dataset, onUpdateDataset, onResetOriginal }: DataCleaningProps) {
  const [selectedCol, setSelectedCol] = useState(dataset.columns[0]?.name || '');
  const [imputeStrategy, setImputeStrategy] = useState<'mean' | 'median' | 'zero' | 'mode'>('mean');
  const [operations, setOperations] = useState<CleaningOperation[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // 1. DROP COLUMN
  const handleDropColumn = (colName: string) => {
    const updatedColumns = dataset.columns.filter(c => c.name !== colName);
    const updatedRows = dataset.rows.map(row => {
      const copy = { ...row };
      delete copy[colName];
      return copy;
    });

    const newOp: CleaningOperation = {
      id: crypto.randomUUID(),
      type: 'drop_column',
      column: colName,
      params: {}
    };

    setOperations([...operations, newOp]);
    onUpdateDataset({
      ...dataset,
      columns: updatedColumns,
      rows: updatedRows,
      rowCount: updatedRows.length
    });
    triggerSuccess(`Column "${colName}" dropped successfully from active structures.`);
  };

  // 2. FILL MISSING VALUE
  const handleImputation = () => {
    if (!selectedCol) return;
    const colMetadata = dataset.columns.find(c => c.name === selectedCol);
    if (!colMetadata) return;

    let fillValue: any = 0;
    
    if (colMetadata.type === 'numeric') {
      if (imputeStrategy === 'mean') {
        fillValue = colMetadata.statistics.mean || 0;
      } else if (imputeStrategy === 'median') {
        fillValue = colMetadata.statistics.median || 0;
      } else {
        fillValue = 0;
      }
    } else {
      fillValue = colMetadata.statistics.mostCommon?.[0]?.value || 'Unknown';
    }

    const updatedRows = dataset.rows.map(row => {
      const val = row[selectedCol];
      if (val === null || val === undefined || val === '') {
        return { ...row, [selectedCol]: fillValue };
      }
      return row;
    });

    // Update statistics
    const updatedColumns = dataset.columns.map(col => {
      if (col.name === selectedCol) {
        return {
          ...col,
          missingCount: 0
        };
      }
      return col;
    });

    const newOp: CleaningOperation = {
      id: crypto.randomUUID(),
      type: 'fill_missing',
      column: selectedCol,
      params: { strategy: imputeStrategy, valueUsed: fillValue }
    };

    setOperations([...operations, newOp]);
    onUpdateDataset({
      ...dataset,
      columns: updatedColumns,
      rows: updatedRows
    });
    triggerSuccess(`Filled missing values in "${selectedCol}" using strategy "${imputeStrategy}" (${fillValue}).`);
  };

  const resetAll = () => {
    setOperations([]);
    onResetOriginal();
    triggerSuccess('Dataset completely restored to original raw state.');
  };

  return (
    <div className="space-y-8" id="cleaning_module">
      {/* Dynamic Glass Container */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Background Elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800 z-10 relative">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 tracking-widest font-mono uppercase">DATA PREPARATION</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight mt-1">2. Cleanse & Prepare Dataset</h2>
            <p className="text-xs text-slate-450 mt-1 max-w-xl font-sans">
              Fill empty values with smart averages, remove unused columns, and review spreadsheet rows in real-time.
            </p>
          </div>
          <button
            onClick={resetAll}
            className="text-xs font-mono font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/25 px-4  py-2 rounded-xl cursor-pointer transition-all duration-300 border border-rose-500/20 shadow-md flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Raw State
          </button>
        </div>

        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 rounded-xl text-xs flex items-center gap-2.5 animate-bounce font-medium shadow-md">
            <CheckCircle className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Missing Value Fill Card */}
          <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-slate-700 transition-all duration-300 shadow-xl">
            <h3 className="font-extrabold text-[#748BAA] text-sm flex items-center gap-2 tracking-tight">
              <Settings2 className="w-4.5 h-4.5 text-indigo-400" /> Smart Missing Data Filler
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-450 font-bold mb-1.5 px-0.5">
                  Choose Impute Column
                </label>
                <select
                  value={selectedCol}
                  onChange={(e) => setSelectedCol(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-505 font-mono cursor-pointer"
                >
                  {dataset.columns.map(c => (
                    <option key={c.name} value={c.name} className="bg-slate-950 text-slate-200">
                      {c.name} ({(c.type || '').toUpperCase()}) - {c.missingCount} Missing cells
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-mono text-slate-450 font-bold mb-1.5 px-0.5">
                  Imputation Strategy
                </label>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {[
                    { key: 'mean', title: 'Mean Average', desc: 'Numeric fields only' },
                    { key: 'median', title: 'Median Value', desc: 'Middle-indexed item' },
                    { key: 'zero', title: "Constant '0'", desc: 'Reset empty to zero' },
                    { key: 'mode', title: 'Frequent Label', desc: 'Categorical modes' },
                  ].map((strategy) => (
                    <button
                      key={strategy.key}
                      type="button"
                      onClick={() => setImputeStrategy(strategy.key as any)}
                      className={`p-3 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                        imputeStrategy === strategy.key
                          ? 'border-indigo-550 bg-indigo-500/10 text-white shadow-md'
                          : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <p className="font-bold">{strategy.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-normal font-mono">{strategy.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleImputation}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-650/20 transition-all duration-300 mt-4 cursor-pointer border-0"
              >
                <Plus className="w-4 h-4" /> Apply Impute Correction
              </button>
            </div>
          </div>

          {/* Feature Selector & Drop Redundancies Card */}
          <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-slate-700 transition-all duration-300 shadow-xl">
            <h3 className="font-extrabold text-[#748BAA] text-sm flex items-center gap-2 tracking-tight">
              <Trash2 className="w-4.5 h-4.5 text-rose-500" /> Remove Unused Columns
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Drop ID indicators, invariant constants, or static coordinates to collapse dimensionality noise and prevent target value leakage points.
            </p>
            <div className="max-h-[200px] overflow-y-auto space-y-2 border border-slate-850 p-3 rounded-xl bg-slate-950/70">
              {dataset.columns.map(col => {
                const isId = col.name.toLowerCase().includes('id') || col.name.toLowerCase() === 'index';
                return (
                  <div key={col.name} className="flex justify-between items-center text-xs p-2 hover:bg-slate-900/60 rounded-lg group transition-colors">
                    <span className="font-mono text-slate-300 font-extrabold truncate max-w-[200px] flex items-center gap-2">
                      {col.name}{' '}
                      {isId && (
                        <span className="text-[8px] bg-amber-500/10 text-amber-400 font-sans font-bold border border-amber-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-widest font-mono">
                          ID Candidate
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDropColumn(col.name)}
                      className="text-rose-400 hover:text-white bg-rose-500/5 hover:bg-rose-500/20 p-2 rounded-xl transition-all duration-300 border border-rose-500/10 cursor-pointer"
                      title="Drop Column"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cleaning Changelog History */}
        {operations.length > 0 && (
          <div className="mt-6 border-t border-slate-800 pt-5 relative z-10">
            <h4 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest mb-3 font-mono">Applied Processing Log Checklist</h4>
            <div className="flex flex-wrap gap-2.5 text-[10px] font-mono">
              {operations.map((op, i) => (
                <div key={op.id} className="bg-emerald-505/10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-1.5 px-3 rounded-xl font-bold flex items-center gap-1.5 shadow-sm">
                  <span className="text-emerald-500">Step {i+1}:</span>
                  <span className="text-slate-300 font-medium">{op.type === 'drop_column' ? `Dropped column "${op.column}"` : `Imputed "${op.column}" using ${op.params.strategy}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Preview Container */}
      <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 shadow-xl animate-fade-in">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
          <Database className="w-5 h-5 text-emerald-400" />
          <h3 className="font-extrabold text-white text-base">Data Preview (First 10 rows)</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4 font-medium">
          Live workspace rows rendering after processing operations are compiled. Select tabs above to proceed.
        </p>

        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40 shadow-inner">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 font-semibold font-mono text-slate-400">
                {dataset.columns.map(c => (
                  <th key={c.name} className="p-3.5 min-w-[130px] uppercase tracking-wider text-[10px]">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px] text-slate-300">
              {dataset.rows.slice(0, 10).map((row, i) => (
                <tr key={i} className="hover:bg-slate-900/30 transition-colors">
                  {dataset.columns.map(c => {
                    const cellVal = row[c.name];
                    const isNull = cellVal === null || cellVal === undefined || cellVal === '';
                    return (
                      <td key={c.name} className="p-3.5 max-w-[180px] truncate">
                        {isNull ? (
                          <span className="text-rose-400 font-bold bg-rose-500/15 py-0.5 px-2 rounded-full border border-rose-500/25 text-[10px] tracking-wide">
                            N/A
                          </span>
                        ) : typeof cellVal === 'boolean' ? (
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border uppercase ${cellVal ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-rose-500/10 text-rose-404 border-rose-500/20'}`}>
                            {String(cellVal).toUpperCase()}
                          </span>
                        ) : (
                          String(cellVal)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
