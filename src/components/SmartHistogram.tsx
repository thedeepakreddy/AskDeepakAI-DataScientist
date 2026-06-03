import React from 'react';
import { useDashboardContext } from './DashboardContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SmartHistogramProps {
  column: string;
}

export default function SmartHistogram({ column }: SmartHistogramProps) {
  const { filteredData } = useDashboardContext();

  if (!filteredData || filteredData.length === 0) return null;

  const values = filteredData.map(d => Number(d[column])).filter(v => !isNaN(v));
  if (values.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg min-h-[300px] flex flex-col items-center justify-center">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Histogram: {column}</h3>
        <p className="text-slate-500 text-xs text-center">No numeric data available for this column.</p>
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Freedman-Diaconis rule or simple binning
  const binCount = Math.min(20, Math.max(5, Math.ceil(Math.sqrt(values.length))));
  let binWidth = (max - min) / binCount;
  
  // Prevent zero bin width if all values are the same
  if (binWidth === 0) binWidth = 1;

  const bins = Array.from({ length: binCount }, (_, i) => ({
    min: min + (i * binWidth),
    max: min + ((i + 1) * binWidth),
    count: 0,
    label: `${(min + (i * binWidth)).toFixed(1)} - ${(min + ((i + 1) * binWidth)).toFixed(1)}`
  }));

  // Ensure last bin captures the absolute max
  if (bins.length > 0) {
    bins[bins.length - 1].max += 0.0001;
  }

  values.forEach(v => {
    for (let i = 0; i < bins.length; i++) {
      if (v >= bins[i].min && v < bins[i].max) {
        bins[i].count++;
        break;
      }
    }
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg min-h-[300px] flex flex-col">
       <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">
        Histogram: {column}
      </h3>
      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bins} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="label" stroke="#64748B" fontSize={9} minTickGap={20} />
            <YAxis stroke="#64748B" fontSize={10} width={40} />
            <Tooltip
              cursor={{ fill: '#1E293B', opacity: 0.4 }}
              contentStyle={{ backgroundColor: '#0B0E17', borderColor: '#1E293B', color: '#fff', fontSize: '12px' }}
            />
            <Bar dataKey="count" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
