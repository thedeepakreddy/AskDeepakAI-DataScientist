import React from 'react';
import { useDashboardContext } from './DashboardContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SmartAreaChartProps {
  xAxisColumn: string;
  yAxisColumns: string[];
}

const COLORS = ['#3B82F6', '#10B981', '#F43F5E', '#F59E0B', '#8B5CF6'];

export default function SmartAreaChart({ xAxisColumn, yAxisColumns }: SmartAreaChartProps) {
  const { filteredData } = useDashboardContext();

  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg min-h-[300px] flex flex-col items-center justify-center">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">{yAxisColumns.join(' & ')} Area</h3>
        <p className="text-slate-500 text-xs text-center">No data available.</p>
      </div>
    );
  }

  const chartData = filteredData.map(row => {
    const dataPoint: any = { x: row[xAxisColumn] };
    yAxisColumns.forEach(col => {
      dataPoint[col] = Number(row[col]);
    });
    return dataPoint;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg min-h-[300px] flex flex-col">
       <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">
        {yAxisColumns.join(' & ')} Area
      </h3>
      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {yAxisColumns.map((col, idx) => (
                <linearGradient key={`color-${col}`} id={`color-${col}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="x" stroke="#64748B" fontSize={10} minTickGap={30} />
            <YAxis stroke="#64748B" fontSize={10} width={40} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0B0E17', borderColor: '#1E293B', color: '#fff', fontSize: '12px' }}
              itemStyle={{ fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            {yAxisColumns.map((col, idx) => (
              <Area
                key={col}
                type="monotone"
                dataKey={col}
                stroke={COLORS[idx % COLORS.length]}
                fillOpacity={1}
                fill={`url(#color-${col})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
