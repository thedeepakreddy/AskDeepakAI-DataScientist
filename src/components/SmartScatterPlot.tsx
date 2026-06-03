import React from 'react';
import { useDashboardContext } from './DashboardContext';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SmartScatterPlotProps {
  xColumn: string;
  yColumn: string;
  colorColumn?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B'];

export default function SmartScatterPlot({ xColumn, yColumn, colorColumn }: SmartScatterPlotProps) {
  const { filteredData } = useDashboardContext();

  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg min-h-[300px] flex flex-col items-center justify-center">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Scatter: {yColumn} vs {xColumn}</h3>
        <p className="text-slate-500 text-xs text-center">No data available.</p>
      </div>
    );
  }

  let categories: string[] = [];
  if (colorColumn) {
    const rawCats = filteredData.map(r => r[colorColumn]).filter(Boolean);
    categories = Array.from(new Set(rawCats));
  }

  const chartData = filteredData
    .map(row => ({
      x: Number(row[xColumn]),
      y: Number(row[yColumn]),
      colorVal: colorColumn ? row[colorColumn] : null,
      __raw: row
    }))
    .filter(d => !isNaN(d.x) && !isNaN(d.y))
    .slice(0, 500); // Max 500 points to prevent lag

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-xl text-xs max-w-xs">
          <p className="font-bold text-slate-200 mb-1 border-b border-slate-800 pb-1">Point Details</p>
          <div className="space-y-1 mt-2">
            <p><span className="text-slate-500 font-mono">{xColumn}:</span> <span className="text-blue-400">{data.x}</span></p>
            <p><span className="text-slate-500 font-mono">{yColumn}:</span> <span className="text-emerald-400">{data.y}</span></p>
            {colorColumn && <p><span className="text-slate-500 font-mono">{colorColumn}:</span> <span className="text-indigo-400">{data.colorVal}</span></p>}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg min-h-[300px] flex flex-col">
       <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">
        Scatter: {yColumn} vs {xColumn}
      </h3>
      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis type="number" dataKey="x" name={xColumn} stroke="#64748B" fontSize={10} tickFormatter={(v) => v.toLocaleString()} />
            <YAxis type="number" dataKey="y" name={yColumn} stroke="#64748B" fontSize={10} width={50} tickFormatter={(v) => v.toLocaleString()} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            
            <Scatter data={chartData} fill="#3B82F6" shape="circle" style={{opacity: 0.7}}>
              {chartData.map((entry, index) => {
                let fill = '#3B82F6';
                if (colorColumn && categories.length > 0) {
                  const colorIdx = categories.indexOf(entry.colorVal);
                  if (colorIdx !== -1) {
                    fill = COLORS[colorIdx % COLORS.length];
                  }
                }
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
