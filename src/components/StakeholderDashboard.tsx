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

  const rangeColMeta = dataset.columns.find(c => c.name === rangeCol);
  const minVal = rangeColMeta?.statistics.min;
  const maxVal = rangeColMeta?.statistics.max;

  useEffect(() => {
    if (!rangeCol) return;
    if (rangeColMeta && minVal !== undefined && maxVal !== undefined) {
      setRangeLimits({
        min: minVal,
        max: maxVal,
        currentMin: minVal,
        currentMax: maxVal
      });
    }
  }, [rangeCol, minVal, maxVal]);

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
      const xLabel = dateCol && row[dateCol] ? String(row[dateCol]).split('T')[0] : `Unit ${idx + 1}`;
      const numericVal = rangeCol ? Number(row[rangeCol] || 0) : 100;
      return {
        name: xLabel,
        metric: parseFloat(numericVal.toFixed(2))
      };
    });
  }, [filteredRows, rangeCol, dataset]);

  return (
    <div className="space-y-8" id="dashboard_module">
      {/* 1. DASHBOARD CONTROLS HUD */}
      <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 z-10 relative">
          <div>
            <span className="text-[10px] font-mono font-bold text-indigo-400 tracking-widest uppercase">STAKEHOLDER HUD</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
              <Sliders className="w-5.5 h-5.5 text-indigo-405 text-indigo-400" /> Interactive Stakeholder Dashboard
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Slice categories and drag quantitative metric limits to isolate, filter, and drill into business cohorts dynamically.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs font-mono font-bold text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/25 px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all duration-300 self-start md:self-auto cursor-pointer border border-indigo-500/20 shadow"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clear All Slices
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 border-t border-slate-800/80 relative z-10">
          {/* Slicer: Categorical selection */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-[10px] text-slate-450 uppercase tracking-wider font-mono font-bold px-0.5">
              <span>Dynamic Slicer Column</span>
              <select
                value={slicerCol}
                onChange={(e) => setSlicerCol(e.target.value)}
                className="bg-transparent border-0 font-extrabold font-mono text-indigo-400 focus:ring-0 p-0 text-xs shrink-0 cursor-pointer"
              >
                {categoricalCols.map(c => (
                  <option key={c.name} value={c.name} className="bg-slate-950 text-slate-200">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">Select categorical values to isolate cohorts:</p>
            <div className="flex flex-wrap gap-1.5 max-h-[105px] overflow-y-auto p-2 border border-slate-800 bg-slate-950/30 rounded-xl">
              {uniqueCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleToggleCategory(cat)}
                  className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg transition-all border shrink-0 cursor-pointer ${
                    selectedCategories.includes(cat)
                      ? 'bg-indigo-650 hover:bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
              {uniqueCategories.length === 0 && (
                <span className="text-[10px] text-slate-500 font-mono italic p-1">No categories extracted.</span>
              )}
            </div>
          </div>

          {/* Slicer: Range selector limits */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-[10px] text-slate-455 uppercase tracking-wider font-mono font-bold px-0.5">
              <span>Metric Range Selector</span>
              <select
                value={rangeCol}
                onChange={(e) => setRangeCol(e.target.value)}
                className="bg-transparent border-0 font-extrabold font-mono text-[#3bc8c8] focus:ring-0 p-0 text-xs shrink-0 cursor-pointer"
              >
                {numericCols.map(c => (
                  <option key={c.name} value={c.name} className="bg-slate-950 text-slate-200">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">Constraint numeric dataset boundaries:</p>
            <div className="space-y-3 p-3.5 bg-slate-950/30 rounded-xl border border-slate-800">
              <div className="flex justify-between text-[10px] text-slate-400 font-extrabold font-mono">
                <span>Min: {rangeLimits.currentMin}</span>
                <span>Max: {rangeLimits.currentMax}</span>
              </div>
              <input
                type="range"
                min={rangeLimits.min}
                max={rangeLimits.max}
                value={rangeLimits.currentMax}
                onChange={(e) => setRangeLimits(prev => ({ ...prev, currentMax: Number(e.target.value) }))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Filtering Status Cards */}
          <div className="flex items-center gap-3.5 p-4.5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-xs shadow-inner">
            <Filter className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <p className="font-extrabold text-white text-xs uppercase tracking-wide font-mono">Cohort Filter Pipeline</p>
              <p className="text-slate-400 mt-1 font-mono text-[11px] leading-relaxed">
                Retaining <strong className="text-indigo-405 text-indigo-400">{filteredRows.length.toLocaleString()}</strong> / <strong>{dataset.rowCount.toLocaleString()}</strong> rows ({((filteredRows.length / dataset.rowCount) * 100).toFixed(0)}% metrics index).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STAKEHOLDER HIGH-IMPACT METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between hover:border-slate-705 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">Active Ingestion Depth</p>
            <p className="text-2xl font-extrabold text-white font-mono">{filteredRows.length.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-450 mt-1.5 font-bold flex items-center gap-1 font-mono">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Compiled schema cells active
            </p>
          </div>
          <div className="w-11 h-11 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl flex items-center justify-center text-indigo-400 select-none shadow">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between hover:border-slate-705 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-455 uppercase tracking-widest font-mono truncate">Cumulative Value ({chargesHeader})</p>
            <p className="text-2xl font-extrabold text-white font-mono">${totalInvoiced.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 mt-1.5 font-bold font-mono">Aggregate metric coefficient sum</p>
          </div>
          <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center text-emerald-400 select-none shadow">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between hover:border-slate-705 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-455 uppercase tracking-widest font-mono truncate">Average Ratio ({tenureHeader})</p>
            <p className="text-2xl font-extrabold text-white font-mono">{averageTenureHours}</p>
            <p className="text-[10px] text-slate-500 mt-1.5 font-bold font-mono">Cohort mathematical center ratio</p>
          </div>
          <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-center justify-center text-amber-400 select-none shadow">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. CORE CHARTS BENTO WORKSPACE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Chart A: Distribution Segmentation Map */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-2xl hover:border-slate-705 transition-colors">
          <h3 className="font-extrabold text-white text-sm mb-1.5 flex items-center gap-2">
            <BarChart3 className="w-4.5 h-4.5 text-indigo-400" /> Segmentation Demographics: {slicerCol}
          </h3>
          <p className="text-[11px] text-slate-400 mb-5 pb-2 border-b border-slate-800">
            Total row proportion distribution matching target slice variables under active metrics thresholds.
          </p>
          <div className="h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentChartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: '11px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  {segmentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#a855f7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Numerical Fluctuations */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-2xl hover:border-slate-705 transition-colors">
          <h3 className="font-extrabold text-white text-sm mb-1.5 flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-indigo-400" /> Longitudinal Trend Progression: {rangeCol}
          </h3>
          <p className="text-[11px] text-slate-400 mb-5 pb-2 border-b border-slate-800">
            Sequential variance and fluctuation dynamics plotted across active row cohorts.
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
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: '11px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="metric" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMetric)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
