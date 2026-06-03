import React, { useMemo } from 'react';
import { useDashboardContext } from './DashboardContext';
import { Sliders } from 'lucide-react';

interface SlicersPanelProps {
  dataset: any;
}

export default function SlicersPanel({ dataset }: SlicersPanelProps) {
  const { numericSlicers, setNumericSlicers } = useDashboardContext();

  const numericColumns = useMemo(() => {
    return dataset.columns.filter((c: any) => c.type === 'numeric');
  }, [dataset]);

  const initSlicer = (col: any) => {
    if (!numericSlicers[col.name]) {
      const min = col.statistics?.min ?? 0;
      const max = col.statistics?.max ?? 100;
      setNumericSlicers((prev: any) => ({
        ...prev,
        [col.name]: { currentMin: min, currentMax: max, min, max }
      }));
    }
  };

  const handleSlider = (colName: string, val: number) => {
    setNumericSlicers((prev: any) => ({
      ...prev,
      [colName]: { ...prev[colName], currentMax: val }
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg mb-4">
      <div className="flex items-center gap-1.5 mb-4">
        <Sliders className="w-3.5 h-3.5 text-slate-300" />
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Numeric Slicers</h3>
      </div>

      <div className="space-y-5">
        {numericColumns.slice(0, 5).map((col: any) => {
          const slicer = numericSlicers[col.name] || { currentMax: col.statistics?.max ?? 100, min: col.statistics?.min ?? 0, max: col.statistics?.max ?? 100 };
          return (
            <div key={col.name} onMouseEnter={() => initSlicer(col)}>
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{col.name}</span>
                 <span className="text-[10px] font-mono text-blue-400">≤ {Number(slicer.currentMax).toFixed(1)}</span>
               </div>
               <input
                 type="range"
                 min={slicer.min}
                 max={slicer.max}
                 step={(slicer.max - slicer.min) / 100}
                 value={slicer.currentMax}
                 onChange={(e) => handleSlider(col.name, Number(e.target.value))}
                 className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-blue-500"
               />
               <div className="flex justify-between text-[8px] font-mono text-slate-600 mt-1">
                 <span>{Number(slicer.min).toFixed(1)}</span>
                 <span>{Number(slicer.max).toFixed(1)}</span>
               </div>
            </div>
          );
        })}
        {numericColumns.length === 0 && <div className="text-xs text-slate-500 italic">No numeric columns available.</div>}
      </div>
    </div>
  );
}
