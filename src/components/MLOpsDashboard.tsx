import React, { useState, useEffect } from 'react';
import { usePipelineContext } from '../contexts/PipelineContext';
import { Rocket, Activity, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';

interface DriftMetrics {
  [feature: string]: {
    ks_stat: number;
    p_value: number;
    drift_detected: boolean;
  };
}

export default function MLOpsDashboard() {
  const { expertMode, datasetProfile } = usePipelineContext();
  const [deployStatus, setDeployStatus] = useState<'idle' | 'deploying' | 'online'>('idle');
  const [driftData, setDriftData] = useState<DriftMetrics | null>(null);

  const handleDeploy = async () => {
    setDeployStatus('deploying');
    try {
      const response = await fetch('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [], target: 'mockTarget' }) // using mock
      });
      await response.json();
      setDeployStatus('online');
      fetchDriftMetrics();
    } catch (err) {
      console.error(err);
      setDeployStatus('idle');
    }
  };

  const fetchDriftMetrics = async () => {
    try {
      const response = await fetch('/api/drift-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference_data: [], current_data: [] }) // mock arrays
      });
      const data = await response.json();
      setDriftData(data.drift_status);
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = driftData ? Object.keys(driftData).map(feat => ({
    feature: feat,
    ksStat: driftData[feat].ks_stat,
    pValue: driftData[feat].p_value,
    isDrifted: driftData[feat].drift_detected
  })) : [];

  return (
    <div className="bg-[#050A10] border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <Cpu className="w-6 h-6 text-indigo-400" />
          <div>
            <h2 className="text-lg font-bold text-white">MLOps Production Center</h2>
            <p className="text-sm text-slate-400">Native Python Compute & Live Model Serving</p>
          </div>
        </div>

        <button
          onClick={handleDeploy}
          disabled={deployStatus !== 'idle'}
          className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl shadow-lg transition-all ${deployStatus === 'online' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 cursor-default' : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'}`}
        >
          {deployStatus === 'idle' && <><Rocket className="w-4 h-4" /> 1-Click Deploy</>}
          {deployStatus === 'deploying' && <><Activity className="w-4 h-4 animate-spin" /> Provisioning Native Worker...</>}
          {deployStatus === 'online' && <><CheckCircle className="w-4 h-4" /> Live Deployment Online</>}
        </button>
      </div>

      {deployStatus === 'online' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-4 mb-4">Data Drift Telemetry (KS-Test)</h3>
            
            {!expertMode ? (
               // BEGINNER MODE: Simple badges
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {chartData.map((stat, idx) => (
                   <div key={idx} className={`p-4 rounded-xl border flex items-center gap-3 ${stat.isDrifted ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                     {stat.isDrifted ? <ShieldAlert className="text-red-400 w-6 h-6" /> : <CheckCircle className="text-emerald-400 w-6 h-6" />}
                     <div>
                       <div className="text-xs text-slate-400 font-bold uppercase">{stat.feature} Health</div>
                       <div className={`font-bold ${stat.isDrifted ? 'text-red-300' : 'text-emerald-300'}`}>{stat.isDrifted ? 'Drifted' : 'Stable'}</div>
                     </div>
                   </div>
                 ))}
               </div>
            ) : (
               // EXPERT MODE: Recharts visualization
               <div className="h-[250px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis dataKey="feature" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                     <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                     <Tooltip 
                       contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                       formatter={(value: number, name: string) => [value.toFixed(3), name === 'ksStat' ? 'KS-Statistic' : 'P-Value']}
                       labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}
                     />
                     <ReferenceLine y={0.05} label="Drift Threshold (p=0.05)" stroke="#ef4444" strokeDasharray="3 3" />
                     <Bar dataKey="ksStat" fill="#6366f1" radius={[4, 4, 0, 0]} name="KS-Statistic" />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            )}
            {expertMode && <p className="text-xs text-slate-500 mt-4 leading-relaxed">* Kolmogorov-Smirnov test mapping real-time inference payloads against training distributions. Values peaking above the threshold signal model degradation.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
