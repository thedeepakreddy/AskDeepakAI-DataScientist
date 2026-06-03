import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { BookOpen, Sparkles, Loader2, Download, AlertCircle, FileText } from 'lucide-react';

interface ExecutivePDFReportProps {
  dataset: any;
  aiAnalysis: any;
  mlResult: any;
}

export default function ExecutivePDFReport({ dataset, aiAnalysis, mlResult }: ExecutivePDFReportProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executiveSummary, setExecutiveSummary] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const reportData = {
         datasetSummary: {
            rows: dataset.rowCount,
            columns: dataset.columns.length,
            features: dataset.columns.map((c: any) => c.name)
         },
         aiAnalysis,
         mlResult: mlResult ? {
            type: mlResult.modelType,
            metrics: mlResult.metrics,
            features: mlResult.featureImportance
         } : null
      };

      const response = await fetch('/api/executive-pdf-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportData })
      });

      const data = await response.json();
      if (response.ok && data.executiveSummary) {
         setExecutiveSummary(data.executiveSummary);
         createPDF(data.executiveSummary);
      } else {
         setError(data.error || 'Failed to generate summary.');
      }
    } catch(err) {
      setError('Network error generating PDF Report.');
    } finally {
      setLoading(false);
    }
  };

  const createPDF = (summary: string) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let curY = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text('EXECUTIVE MACHINE LEARNING REPORT', 15, curY);
    curY += 10;

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Dataset: ${dataset.filename}`, 15, curY);
    curY += 15;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('I. EXECUTIVE SUMMARY', 15, curY);
    curY += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const wrapSummary = doc.splitTextToSize(summary, 180);
    doc.text(wrapSummary, 15, curY);
    curY += (wrapSummary.length * 5) + 15;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('II. DATASET TOPOLOGY', 15, curY);
    curY += 8;

    doc.setFont('helvetica', 'normal');
    doc.text(`Total Records Analyzed: ${dataset.rowCount}`, 15, curY);
    curY += 6;
    doc.text(`Total Feature Dimensions: ${dataset.columns.length}`, 15, curY);
    curY += 15;

    if (mlResult) {
       doc.setFont('helvetica', 'bold');
       doc.setFontSize(14);
       doc.text('III. PREDICTIVE MODEL METRICS', 15, curY);
       curY += 8;

       doc.setFont('helvetica', 'normal');
       doc.text(`Model Algorithm: ${mlResult.modelAlgorithm || 'Optimized Ensemble'}`, 15, curY);
       curY += 6;
       
       const acc = mlResult.metrics.accuracy !== undefined ? mlResult.metrics.accuracy : (mlResult.metrics.r2Score || 0);
       doc.text(`Primary Metric Score: ${(acc * 100).toFixed(2)}%`, 15, curY);
       curY += 10;

       doc.setFont('helvetica', 'bold');
       doc.setFontSize(11);
       doc.text('Top Correlated Drivers:', 15, curY);
       curY += 6;

       doc.setFont('helvetica', 'normal');
       if (mlResult.featureImportance) {
          mlResult.featureImportance.slice(0, 5).forEach((f: any, i: number) => {
             doc.text(`${i+1}. ${f.feature}: ${(f.score * 100).toFixed(1)}% influence`, 15, curY);
             curY += 6;
          });
       }
    }

    doc.save(`Executive_Report_${dataset.filename}.pdf`);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden mt-8 animate-fade-in">
       <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20 shadow-inner">
            <BookOpen className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Executive PDF Report</h2>
            <p className="text-xs text-slate-400 mt-1">Compile all stages into a final polished PDF report containing an AI executive summary.</p>
          </div>
       </div>

       {error && (
         <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-start gap-3 mb-6">
           <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
           <p>{error}</p>
         </div>
       )}

       <button
         onClick={generateReport}
         disabled={loading}
         className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3"
       >
         {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
         {loading ? 'Synthesizing Report & Calling AI...' : 'Generate Full PDF Report'}
       </button>
    </div>
  );
}
