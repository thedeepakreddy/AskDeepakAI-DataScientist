import React, { useMemo } from 'react';
import { useDashboardContext } from './DashboardContext';
import { Filter, X } from 'lucide-react';

interface FiltersPanelProps {
  dataset: any;
}

export default function FiltersPanel({ dataset }: FiltersPanelProps) {
  const { categoryFilters, setCategoryFilters, setDateRanges, dateRanges } = useDashboardContext();

  const categoricalColumns = useMemo(() => {
    return dataset.columns.filter((c: any) => c.type === 'categorical' || c.type === 'boolean').map((c: any) => c.name);
  }, [dataset]);

  const dateColumns = useMemo(() => {
    return dataset.columns.filter((c: any) => c.type === 'datetime').map((c: any) => c.name);
  }, [dataset]);

  const uniqueValues = useMemo(() => {
    const vals: Record<string, string[]> = {};
    categoricalColumns.forEach((col: string) => {
      const unique = Array.from(new Set(dataset.rows.map((r: any) => String(r[col] || 'Unknown'))));
      vals[col] = unique as string[];
    });
    return vals;
  }, [dataset, categoricalColumns]);

  const toggleCategory = (col: string, val: string) => {
    setCategoryFilters((prev: any) => {
      const active = prev[col] || [];
      const updated = active.includes(val) ? active.filter((v: string) => v !== val) : [...active, val];
      return { ...prev, [col]: updated };
    });
  };

  const resetAll = () => {
    setCategoryFilters({});
    setDateRanges({});
  };

  const hasFilters = Object.values(categoryFilters).some((f: any) => f.length > 0) || Object.keys(dateRanges).length > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" /> Logical Filters
        </h3>
        {hasFilters && (
          <button onClick={resetAll} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded flex items-center gap-1">
            <X className="w-3 h-3" /> Reset All
          </button>
        )}
      </div>

      <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
        {categoricalColumns.slice(0, 5).map((col: string) => (
          <div key={col}>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{col}</div>
            <div className="flex flex-wrap gap-1">
              {uniqueValues[col]?.slice(0, 15).map(val => {
                const isActive = (categoryFilters[col] || []).includes(val);
                return (
                  <button
                    key={val}
                    onClick={() => toggleCategory(col, val)}
                    className={`text-[9px] px-2 py-1 rounded-full border transition-colors ${isActive ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                  >
                    {val.substring(0, 20)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {categoricalColumns.length === 0 && <div className="text-xs text-slate-500 italic">No categorical columns available for filtering.</div>}
      </div>
    </div>
  );
}
