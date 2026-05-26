/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trash2, RefreshCw, Layers, CheckCircle, Flame, Plus, AlertCircle } from 'lucide-react';
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
    <div className="space-y-6" id="cleaning_module">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-4 pb-2 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">COVARIATE PREPARATION</span>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight mt-1">2. Cleanse and Prepare Covariates</h2>
            <p className="text-xs text-slate-500 mt-1">
              Impute empty values, filter redundancies, and inspect real-time row transformations before modeling.
            </p>
          </div>
          <button
            onClick={resetAll}
            className="text-xs font-bold text-rose-600 hover:text-rose-705 bg-rose-50 hover:bg-rose-100/60 px-3.5 py-1.5 rounded cursor-pointer transition-colors border border-rose-100"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Raw State
          </button>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-xs flex items-center gap-2 animate-pulse font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Missing Value Fill Card */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/55">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" /> Mathematical Imbalance Imputer
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Choose Impute Column
                </label>
                <select
                  value={selectedCol}
                  onChange={(e) => setSelectedCol(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {dataset.columns.map(c => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.type.toUpperCase()}) - {c.missingCount} Missing cells
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Imputation Strategy
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setImputeStrategy('mean')}
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      imputeStrategy === 'mean' ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950 font-semibold' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold">Mean Average</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Numeric fields only</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImputeStrategy('median')}
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      imputeStrategy === 'median' ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950 font-semibold' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold">Median Value</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Middle-indexed value</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImputeStrategy('zero')}
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      imputeStrategy === 'zero' ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950 font-semibold' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold">Constant '0'</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Reset empty to zero</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImputeStrategy('mode')}
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      imputeStrategy === 'mode' ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950 font-semibold' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold">Frequent Label</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Categorical modes</p>
                  </button>
                </div>
              </div>

              <button
                onClick={handleImputation}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors mt-2 cursor-pointer border-0"
              >
                <Plus className="w-4 h-4" /> Apply Impute Correction
              </button>
            </div>
          </div>

          {/* Feature Selector & Drop Redundancies Card */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/55">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500" /> Prune Redundant Columns
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              Drop ID indicators or static variables to shrink noise and improve machine learning metrics performance.
            </p>
            <div className="max-h-[190px] overflow-y-auto space-y-2 border border-slate-200 p-2.5 rounded-lg bg-white">
              {dataset.columns.map(col => {
                const isId = col.name.toLowerCase().includes('id') || col.name.toLowerCase() === 'index';
                return (
                  <div key={col.name} className="flex justify-between items-center text-xs p-1.5 hover:bg-slate-50 rounded">
                    <span className="font-mono text-slate-800 font-bold truncate max-w-[200px]">
                      {col.name}{' '}
                      {isId && (
                        <span className="text-[9px] bg-amber-50 text-amber-700 font-sans font-bold border border-amber-100 px-1 py-0.5 rounded uppercase tracking-wide">
                          ID Candidate
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDropColumn(col.name)}
                      className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
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
          <div className="mt-5 border-t border-slate-200 pt-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Applied Processing Log Checklist</h4>
            <div className="flex flex-wrap gap-2 text-[10px]">
              {operations.map((op, i) => (
                <div key={op.id} className="bg-emerald-50 text-emerald-800 border border-emerald-100 py-1 px-2.5 rounded font-bold flex items-center gap-1">
                  <span className="text-emerald-950">Step {i+1}:</span>
                  <span>{op.type === 'drop_column' ? `Dropped column "${op.column}"` : `Imputed "${op.column}" using ${op.params.strategy}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Preview Container */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
        <h3 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-emerald-500" /> Spreadsheet Record Inspection (First 10 rows)
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          This shows live resulting rows after active operations are evaluated. Feel free to load target predictions next!
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold font-sans">
                {dataset.columns.map(c => (
                  <th key={c.name} className="p-3 text-slate-700 min-w-[120px] uppercase tracking-wider text-[10px]">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
              {dataset.rows.slice(0, 10).map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  {dataset.columns.map(c => {
                    const cellVal = row[c.name];
                    const isNull = cellVal === null || cellVal === undefined || cellVal === '';
                    return (
                      <td key={c.name} className="p-3 max-w-[180px] truncate">
                        {isNull ? (
                          <span className="text-rose-700 font-bold bg-rose-50 py-0.5 px-1.5 rounded border border-rose-100 text-[10px]">
                            N/A
                          </span>
                        ) : typeof cellVal === 'boolean' ? (
                          <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] border uppercase ${cellVal ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
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
