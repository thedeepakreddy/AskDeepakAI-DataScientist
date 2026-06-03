import React, { useState } from 'react';
import { Database, Clock, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseCSV } from '../utils/csvParser';

export default function PipelineBuilder({ onDatasetLoaded }: { onDatasetLoaded?: (dataset: any) => void }) {
  const [provider, setProvider] = useState<'PostgreSQL' | 'Snowflake'>('PostgreSQL');
  const [connectionString, setConnectionString] = useState('');
  const [schedule, setSchedule] = useState('0 0 * * *');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/db-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, connectionString, schedule })
      });

      const data = await response.json();
      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        
        if (data.data && data.data.length > 0 && onDatasetLoaded) {
          // Convert JSON to CSV so we reuse parser
          const keys = Object.keys(data.data[0]);
          const csvLines = [keys.join(',')];
          data.data.forEach((row: any) => {
            const line = keys.map(k => {
              let val = row[k];
              if (val === null || val === undefined) return '';
              const str = String(val);
              if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
            }).join(',');
            csvLines.push(line);
          });
          const csvString = csvLines.join('\n');
          const parsed = parseCSV(csvString, `${provider}_sync_${new Date().getTime()}.csv`);
          onDatasetLoaded(parsed);
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Connection failed.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || String(err));
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 shadow-xl w-full h-full flex flex-col transition-all duration-300">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
        <Database className="w-6 h-6 text-indigo-400" />
        <div>
          <h2 className="text-lg font-bold text-white">Visual Pipeline Builder</h2>
          <p className="text-sm text-slate-400">Automate your ingestion pipelines via direct Cloud Warehouse mapping</p>
        </div>
      </div>

      <form onSubmit={handleConnect} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Data Provider</label>
            <div className="relative">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full bg-[#060A10] border border-slate-700 text-slate-200 text-sm rounded-xl py-3 px-4 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
              >
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="Snowflake">Snowflake</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Sync Schedule</label>
            <div className="relative flex items-center">
              <Clock className="w-4 h-4 text-slate-500 absolute left-3" />
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full bg-[#060A10] border border-slate-700 text-slate-200 text-sm rounded-xl py-3 pl-10 pr-4 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
              >
                <option value="*/15 * * * *">Every 15 Minutes</option>
                <option value="0 * * * *">Hourly</option>
                <option value="0 0 * * *">Nightly (Midnight)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Connection String / URL</label>
          <div className="relative flex items-center">
            <Key className="w-4 h-4 text-slate-500 absolute left-3" />
            <input
              type="password"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              placeholder="e.g., postgres://user:password@host:port/dbname"
              className="w-full bg-[#060A10] border border-slate-700 text-slate-200 text-sm rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95"
        >
          {status === 'loading' ? 'Authenticating & Verifying Schema...' : 'Initialize Ingestion Pipeline'}
        </button>

        {status === 'success' && (
          <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl mt-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-300 font-medium leading-relaxed">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 p-4 rounded-xl mt-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300 font-medium leading-relaxed">{message}</p>
          </div>
        )}
      </form>
    </div>
  );
}
