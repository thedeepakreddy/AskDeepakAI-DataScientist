import React, { useMemo, useState } from 'react';
import { useDashboardContext } from './DashboardContext';

interface CorrelationHeatmapProps {
  columns: string[];
}

export default function CorrelationHeatmap({ columns }: CorrelationHeatmapProps) {
  const { filteredData } = useDashboardContext();
  const [hoveredCell, setHoveredCell] = useState<{ x: string; y: string; val: number } | null>(null);

  const matrix = useMemo(() => {
    if (!filteredData || filteredData.length === 0 || columns.length < 2) return [];

    const calculatePearson = (xVals: number[], yVals: number[]) => {
      const n = xVals.length;
      if (n === 0) return 0;
      const sumX = xVals.reduce((a, b) => a + b, 0);
      const sumY = yVals.reduce((a, b) => a + b, 0);
      const sumXY = xVals.reduce((a, b, i) => a + (b * yVals[i]), 0);
      const sumX2 = xVals.reduce((a, b) => a + b * b, 0);
      const sumY2 = yVals.reduce((a, b) => a + b * b, 0);
      
      const num = (n * sumXY) - (sumX * sumY);
      const den = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
      if (den === 0) return 0;
      return num / den;
    };

    const extractedNumData = columns.map(col => filteredData.map(d => Number(d[col])).filter(n => !isNaN(n)));

    const result = [];
    for (let i = 0; i < columns.length; i++) {
      const row = [];
      for (let j = 0; j < columns.length; j++) {
        if (i === j) {
          row.push({ x: columns[j], y: columns[i], val: 1 });
        } else {
          // Assume aligned vectors (if NA omitted properly, careful! We assume rect data)
          const xVec = [];
          const yVec = [];
          for (let k = 0; k < filteredData.length; k++) {
            const vx = Number(filteredData[k][columns[j]]);
            const vy = Number(filteredData[k][columns[i]]);
            if (!isNaN(vx) && !isNaN(vy)) {
              xVec.push(vx);
              yVec.push(vy);
            }
          }
          row.push({ x: columns[j], y: columns[i], val: calculatePearson(xVec, yVec) });
        }
      }
      result.push({ rowCol: columns[i], cells: row });
    }
    return result;
  }, [filteredData, columns]);

  if (matrix.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg min-h-[300px] flex flex-col items-center justify-center">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Correlation Matrix</h3>
        <p className="text-slate-500 text-xs text-center">No sufficient data for correlation heatmap.</p>
      </div>
    );
  }

  const getColor = (val: number) => {
    if (val > 0) {
      return `rgba(16, 185, 129, ${Math.abs(val)})`; // emerald
    } else if (val < 0) {
      return `rgba(244, 63, 94, ${Math.abs(val)})`; // rose
    }
    return `rgba(30, 41, 59, 1)`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col relative overflow-hidden min-h-[300px]">
       <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Correlation Matrix</h3>
       
       <div className="flex-1 overflow-auto custom-scrollbar relative">
         <div className="inline-block min-w-full">
            <div className="flex">
               <div className="w-24 shrink-0"></div>
               {columns.map(c => (
                 <div key={`header-${c}`} className="w-20 text-center shrink-0 border-b border-slate-800 pb-2">
                   <span className="text-[10px] font-bold text-slate-400 rotate-[-45deg] inline-block w-full">{c.substring(0, 8)}</span>
                 </div>
               ))}
            </div>

            {matrix.map((rowItem, rIdx) => (
              <div key={`row-${rIdx}`} className="flex items-center">
                <div className="w-24 shrink-0 pr-2 text-right border-r border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 truncate block">{rowItem.rowCol.substring(0, 10)}</span>
                </div>
                {rowItem.cells.map((cell, cIdx) => (
                  <div
                    key={`cell-${rIdx}-${cIdx}`}
                    className="w-20 h-10 shrink-0 border border-slate-900 flex items-center justify-center cursor-pointer transition-transform hover:z-10 hover:scale-110"
                    style={{ backgroundColor: getColor(cell.val) }}
                    onMouseEnter={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <span className="text-[9px] font-mono text-white mix-blend-difference font-bold">
                      {cell.val.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
         </div>
       </div>

       {hoveredCell && (
         <div className="absolute top-4 right-4 bg-slate-950 border border-slate-800 p-2 rounded-lg text-xs shadow-xl min-w-[120px] pointer-events-none">
           <div className="font-bold text-slate-300 mb-1">Correlation Detail</div>
           <div className="text-slate-400"><span className="text-emerald-400">X:</span> {hoveredCell.x}</div>
           <div className="text-slate-400"><span className="text-blue-400">Y:</span> {hoveredCell.y}</div>
           <div className="font-mono text-white mt-1 pt-1 border-t border-slate-800 font-bold">{hoveredCell.val.toFixed(3)}</div>
         </div>
       )}
    </div>
  );
}
