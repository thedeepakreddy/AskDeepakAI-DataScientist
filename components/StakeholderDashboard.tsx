/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Filter, Sliders, RefreshCw, BarChart3, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { Dataset } from '../types';

interface StakeholderDashboardProps {
  dataset: Dataset;
  strategicSlicer?: string;
}

export default function StakeholderDashboard({ dataset, strategicSlicer }: StakeholderDashboardProps) {
  // Find default Slicers and Range attributes
  const categoricalCols = dataset.columns.filter(c => c.type === 'categorical' || c.type === 'boolean');
  const numericCols = dataset.columns.filter(c => c.type === 'numeric');

  const defaultSlicerCol = strategicSlicer && dataset.columns.some(c => c.name === strategicSlicer)
    ? strategicSlicer
    : (categoricalCols[0]?.name || '');

  const defaultRangeCol = numericCols[0]?.name || '';

  // Filter States
  const [slicerCol, setSlicerCol] = useState(defaultSlicerCol);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [rangeCol, setRangeCol] = useState(defaultRangeCol);
  const [rangeLimits, setRangeLimits] = useState<{ min: number; max: number; currentMin: number; currentMax: number }>({
    min: 0,
    max: 100,
    currentMin: 0,
    currentMax: 100
  });

  // Unique categories of selected Slicer Column
  const uniqueCategories = React.useMemo(() => {
    if (!slicerCol) return [];
    const vals = dataset.rows.map(r => String(r[slicerCol] || 'Unknown'));
    return Array.from(new Set(vals)).filter(v => v !== 'null' && v !== '');
  }, [dataset, slicerCol]);

  // Sync limits when dataset or range Column changes
  useEffect(() => {
    if (slicerCol) {
      setSelectedCategories([]); // Reset selection to select everything by default
    }
  }, [slicerCol]);

  useEffect(() => {
    if (!rangeCol) return;
    const colMeta = dataset.columns.find(c => c.name === rangeCol);
    if (colMeta && colMeta.statistics.min !== undefined && colMeta.statistics.max !== undefined) {
      setRangeLimits({
        min: colMeta.statistics.min,
        max: colMeta.statistics.max,
        currentMin: colMeta.statistics.min,
        currentMax: colMeta.statistics.max
      });
    }
  }, [dataset, rangeCol]);

  const handleToggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    if (rangeCol) {
      const colMeta = dataset.columns.find(c => c.name === rangeCol);
      if (colMeta && colMeta.statistics.min !== undefined && colMeta.statistics.max !== undefined) {
        setRangeLimits(prev => ({
          ...prev,
          currentMin: colMeta.statistics.min!,
          currentMax: colMeta.statistics.max!
        }));
      }
    }
  };

  // Compute dynamically filtered rows
  const filteredRows = React.useMemo(() => {
    return dataset.rows.filter(row => {
      // 1. Slicer Category Check
      if (slicerCol && selectedCategories.length > 0) {
        const val = String(row[slicerCol] || 'Unknown');
        if (!selectedCategories.includes(val)) return false;
      }
      // 2. Range Threshold Check
      if (rangeCol) {
        const val = Number(row[rangeCol]);
        if (!isNaN(val)) {
          if (val < rangeLimits.currentMin || val > rangeLimits.currentMax) return false;
        }
      }
      return true;
    });
  }, [dataset, slicerCol, selectedCategories, rangeCol, rangeLimits]);

  // KPIs Calculations
  const totalInvoiced = React.useMemo(() => {
    if (filteredRows.length === 0) return 0;
    // Look for charges or revenue
    const col = dataset.columns.find(c => c.name.toLowerCase().includes('charge') || c.name.toLowerCase().includes('recurring') || c.name.toLowerCase().includes('pressure'));
    if (!col) return filteredRows.length;
    const sum = filteredRows.reduce((acc, r) => acc + Number(r[col.name] || 0), 0);
    return parseFloat(sum.toFixed(1));
  }, [filteredRows, dataset]);

  const chargesHeader = dataset.columns.find(c => c.name.toLowerCase().includes('charge') || c.name.toLowerCase().includes('recurring') || c.name.toLowerCase().includes('pressure'))?.name || 'Size';

  const averageTenureHours = React.useMemo(() => {
    if (filteredRows.length === 0) return 0;
    const col = dataset.columns.find(c => c.name.toLowerCase().includes('tenure') || c.name.toLowerCase().includes('hours') || c.name.toLowerCase().includes('success'));
    if (!col) return 0;
    const sum = filteredRows.reduce((acc, r) => acc + Number(r[col.name] || 0), 0);
    return parseFloat((sum / filteredRows.length).toFixed(1));
  }, [filteredRows, dataset]);

  const tenureHeader = dataset.columns.find(c => c.name.toLowerCase().includes('tenure') || c.name.toLowerCase().includes('hours') || c.name.toLowerCase().includes('success'))?.name || 'N/A';

  // Chart data 1: Volume Segment bar chart of Slicer Selected column
  const segmentChartData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRows.forEach(row => {
      const key = String(row[slicerCol] || 'Unknown');
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [filteredRows, slicerCol]);

  // Chart data 2: Numeric fluctuations across samples
  const numericTrendChartData = React.useMemo(() => {
    return filteredRows.slice(0, 30).map((row, idx) => {
      const dateCol = dataset.columns.find(c => c.type === 'datetime')?.name;
      const xLabel = dateCol && row[dateCol] ? String(row[dateCol]).split('T')[0] : `ID ${idx + 1}`;
      const numericVal = rangeCol ? Number(row[rangeCol] || 0) : 100;
      return {
        name: xLabel,
        metric: parseFloat(numericVal.toFixed(2))
      };
    });
  }, [filteredRows, rangeCol, dataset]);

  return (
    <div className="space-y-6" id="dashboard_module">
      {/* 1. DASHBOARD CONTROLS HUD */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">STAKEHOLDER HUD</span>
            <h2 className="text-base font-bold text-slate-850 flex items-center gap-1.5 leading-none mt-1">
              <Sliders className="w-5 h-5 text-indigo-600" /> Interactive Stakeholder Dashboard
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Slice categories and slide numerical coordinates to isolate business value insights.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors self-end md:self-auto cursor-pointer border-0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clear All Slices
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
          {/* Slicer: Categorical selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Dynamic Slicer Column</span>
              <select
                value={slicerCol}
                onChange={(e) => setSlicerCol(e.target.value)}
                className="bg-transparent border-0 font-bold text-indigo-650 focus:ring-0 p-0 text-xs shrink-0 cursor-pointer"
              >
                {categoricalCols.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-500">Select columns slices to isolate charts:</p>
            <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-1.5 bg-slate-50 rounded-lg border border-slate-100">
              {uniqueCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleToggleCategory(cat)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded transition-colors cursor-pointer border-0 ${
                    selectedCategories.includes(cat)
                      ? 'bg-indigo-650 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-705 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
              {uniqueCategories.length === 0 && (
                <span className="text-[10px] text-slate-400 italic p-1">No values extracted.</span>
              )}
            </div>
          </div>

          {/* Slicer: Range selector limits */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Metric Range Selector</span>
              <select
                value={rangeCol}
                onChange={(e) => setRangeCol(e.target.value)}
                className="bg-transparent border-0 font-bold text-indigo-650 focus:ring-0 p-0 text-xs shrink-0 cursor-pointer"
              >
                {numericCols.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-400">Filter datasets ranges securely:</p>
            <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold font-mono">
                <span>Min: {rangeLimits.currentMin}</span>
                <span>Max: {rangeLimits.currentMax}</span>
              </div>
              <input
                type="range"
                min={rangeLimits.min}
                max={rangeLimits.max}
                value={rangeLimits.currentMax}
                onChange={(e) => setRangeLimits(prev => ({ ...prev, currentMax: Number(e.target.value) }))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Filtering Status Cards */}
          <div className="flex items-center gap-3 p-4 bg-indigo-50/40 border border-indigo-100/50 rounded-xl text-xs">
            <Filter className="w-7 h-7 text-indigo-650 shrink-0" />
            <div>
              <p className="font-bold text-indigo-950">Active Filters Cohort</p>
              <p className="text-slate-600 mt-1 font-mono">
                Retaining <strong>{filteredRows.length}</strong> / <strong>{dataset.rowCount}</strong> records ({((filteredRows.length / dataset.rowCount) * 100).toFixed(0)}%).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STAKEHOLDER HIGH-IMPACT METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Selected Ingest Row Depth</p>
            <p className="text-2xl font-extrabold text-slate-855 mt-1 font-mono">{filteredRows.length}</p>
            <p className="text-[10px] text-emerald-600 mt-0.5 font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Fully compiled dataset
            </p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100/50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-455 uppercase tracking-widest truncate">Total value ({chargesHeader})</p>
            <p className="text-2xl font-extrabold text-slate-855 mt-1 font-mono">${totalInvoiced.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-bold">Sum value of slice</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100/50 rounded-xl flex items-center justify-center text-emerald-650 font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-455 uppercase tracking-widest truncate">MTRX Average ({tenureHeader})</p>
            <p className="text-2xl font-extrabold text-slate-855 mt-1 font-mono">{averageTenureHours}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-bold">Target ratio center</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 border border-amber-100/50 rounded-xl flex items-center justify-center text-amber-600 font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. CORE CHARTS BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart A: Distribution Segmentation Map */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-850 text-sm mb-1.5 flex items-center gap-1.5">
            <BarChart3 className="w-4.5 h-4.5 text-indigo-600" /> Segmentation Demographics: {slicerCol}
          </h3>
          <p className="text-[11px] text-slate-500 mb-4 pb-2 border-b border-slate-100">
            Total row composition of records matching categories under active range selections.
          </p>
          <div className="h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentChartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: '11px', background: '#0f172a', color: '#fff', borderRadius: '4px' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  {segmentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Numerical Fluctuations */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-850 text-sm mb-1.5 flex items-center gap-1.5">
            <TrendingUp className="w-4.5 h-4.5 text-indigo-600" /> Longitudinal Trend Progression: {rangeCol}
          </h3>
          <p className="text-[11px] text-slate-500 mb-4 pb-2 border-b border-slate-100">
            Sequential numerical variance of active rows representing selected boundaries.
          </p>
          <div className="h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={numericTrendChartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: '11px', background: '#0f172a', color: '#fff', borderRadius: '4px' }}
                />
                <Area type="monotone" dataKey="metric" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorMetric)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
