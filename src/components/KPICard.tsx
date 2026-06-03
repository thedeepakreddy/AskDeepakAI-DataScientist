import React from 'react';
import { useDashboardContext } from './DashboardContext';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
  column: string;
}

export default function KPICard({ column }: KPICardProps) {
  const { filteredData } = useDashboardContext();

  if (!filteredData || filteredData.length === 0) return null;

  const values = filteredData.map(d => Number(d[column])).filter(v => !isNaN(v));
  if (values.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-center items-center shadow-lg h-32">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{column}</span>
        <span className="text-xs text-slate-500">N/A</span>
      </div>
    );
  }

  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  // Sparkline data
  const sparkData = values.slice(-20).map((v, i) => ({ value: v, index: i }));
  const isPositive = values[values.length - 1] >= avg;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden h-32">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{column}</span>
        <div className={`p-1 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        </div>
      </div>
      
      <div className="flex items-end gap-3 mb-4">
        <span className={`text-2xl font-bold font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {avg.toFixed(2)}
        </span>
        <span className="text-xs text-slate-500 mb-1">avg</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 border-t border-slate-800/50 pt-2">
        <div>Min: <span className="text-slate-300">{min.toFixed(2)}</span></div>
        <div>Max: <span className="text-slate-300">{max.toFixed(2)}</span></div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-12 opacity-30 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Line type="monotone" dataKey="value" stroke={isPositive ? '#10B981' : '#F43F5E'} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
