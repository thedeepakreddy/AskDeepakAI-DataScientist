import React, { useState, useEffect } from 'react';
import { MLResult } from '../types';
import { Brain, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ModelExplainerProps {
  result: any;
}

export default function ModelExplainer({ result }: ModelExplainerProps) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateExplanation();
  }, [result]);

  const generateExplanation = async () => {
    setLoading(true);
    setError(null);
    try {
       const rawFiData = result.featureImportance || result.algorithmDetails?.featureImportance || {};
       const isArray = Array.isArray(rawFiData);
       let formattedFiParams: Record<string, number> = {};
       if (isArray) {
           rawFiData.forEach((item: any) => {
               formattedFiParams[item.feature] = item.score;
           });
       } else {
           formattedFiParams = rawFiData;
       }

       const metrics = result.metrics || {};
       const context = {
          target: result.targetSelected || "Target Variable",
          features: result.featuresSelected || Object.keys(formattedFiParams),
          type: result.modelType || "Unknown ML Predictor"
       };
       
       const response = await fetch('/api/model-explainer', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ featureImportance: formattedFiParams, metrics, context })
       });

       const data = await response.json();
       if (response.ok && data.overallSummary) {
          setExplanation(data);
       } else {
          setError(data.error || 'Failed to explain model.');
       }
    } catch(err) {
       setError('Network error generating explanation.');
    } finally {
       setLoading(false);
    }
  };

  const rawFiData = result.featureImportance || result.algorithmDetails?.featureImportance || {};
  const isArray = Array.isArray(rawFiData);
  const fiData = isArray 
    ? [...rawFiData]
       .sort((a, b) => b.score - a.score)
       .slice(0, 5)
       .map(val => ({ name: val.feature, importance: Number((val.score * 100).toFixed(1)) }))
    : Object.entries(rawFiData)
       .sort((a, b) => (b[1] as number) - (a[1] as number))
       .slice(0, 5)
       .map(([name, val]) => ({ name, importance: Number(((val as number)*100).toFixed(1)) }));

  return (
     <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden mt-8 animate-fade-in">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20 shadow-inner">
            <Brain className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">AI Model Explainer</h2>
            <p className="text-xs text-slate-400 mt-1">Plain-English translation of feature importance and model dynamics.</p>
          </div>
        </div>

        {error && (
           <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-start gap-3 mb-6">
             <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
             <p>{error}</p>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Chart */}
           <div>
              <h3 className="text-sm font-bold text-slate-200 mb-4 font-mono uppercase tracking-wider">Top Drivers</h3>
              <div className="h-[250px] bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fiData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                      <XAxis type="number" stroke="#64748B" fontSize={10} tickFormatter={(val) => `${val}%`} />
                      <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} width={80} />
                      <Tooltip 
                         contentStyle={{ backgroundColor: '#0B0E17', borderColor: '#1E293B', fontSize: '12px', color: '#fff' }}
                         itemStyle={{ color: '#60A5FA' }}
                      />
                      <Bar dataKey="importance" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={16} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* AI Story */}
           <div>
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center bg-blue-900/10 border border-blue-500/20 rounded-xl p-6 text-center">
                   <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
                   <h4 className="text-sm font-bold text-blue-300">Translating Model Mechanics</h4>
                   <p className="text-xs text-slate-400 mt-2">Gemini is analyzing decision trees and logistic weights to explain how this model thinks.</p>
                </div>
              ) : explanation ? (
                 <div className="space-y-4">
                    <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800">
                       <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                         <Sparkles className="w-3.5 h-3.5" /> Overall Assessment
                       </h4>
                       <p className="text-sm text-slate-300 leading-relaxed">{explanation.overallSummary}</p>
                    </div>
                    
                    <div className="space-y-3">
                       {explanation.topFeatures?.slice(0, 2).map((feat: any, idx: number) => (
                         <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-800/80">
                            <h5 className="text-sm font-bold text-slate-200">{feat.featureName}</h5>
                            <p className="text-xs text-slate-400 mt-1 mb-2 italic">"{feat.explanation}"</p>
                            <p className="text-xs text-blue-300 bg-blue-500/10 px-2 py-1.5 rounded-lg border border-blue-500/20">{feat.insight}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              ) : null}
           </div>
        </div>
     </div>
  );
}
