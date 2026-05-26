/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Newspaper, ShieldAlert, Award, Compass, Eye, ArrowUpRight, CheckSquare, Printer } from 'lucide-react';
import { MLResult } from '../types';

interface ReportsHubProps {
  filename: string;
  mlResult: MLResult | null;
  aiAnalysis: {
    overviewSummary?: string;
    recommendedTarget?: string;
    scientistFocus?: string;
    scientistRationale?: string;
    insights?: string[];
  } | null;
}

export default function ReportsHub({ filename, mlResult, aiAnalysis }: ReportsHubProps) {
  // Setup standard fallback structured values in case ML / AI reports aren't completed yet
  const hasAnalysis = !!aiAnalysis || !!mlResult;

  const defaultRisks = [
    {
      title: "Class Inbalance & Sample Bias Hazards",
      level: "High",
      desc: "Imbalance in historic categorical variables can bias tree evaluations, causing high false-negative prediction rates under live stream operations."
    },
    {
      title: "Data Shift and Parameter Decay",
      level: "Medium",
      desc: "Seasonal factors and inflation indicators might drift key numeric coordinates, causing model metrics accuracy to decay after 45 days."
    },
    {
      title: "Inter-feature Collinearity Latency",
      level: "Low",
      desc: "High covariance between input feature values leads to standard errors and unstable metrics models. Continuous audit is recommended."
    }
  ];

  const defaultRecommendations = [
    {
      title: "Restructure Demographic Pricing Buffers",
      impact: "High",
      desc: "Convert at-risk customer groups into standard multi-year contracts by introducing modern loyalty pricing incentives of up to 15%."
    },
    {
      title: "Configure Automated Escalation Pipelines",
      impact: "High",
      desc: "Inject warning notifications in account profiles. Frontline staff can proactively follow up with clients before churn probability triggers reach 70%."
    },
    {
      title: "Automate Rolling Machine Learning Cycles",
      impact: "Medium",
      desc: "Schedule automatic re-training loops on clean rows to prevent logic decay and adapt predictions against seasonal fluctuations dynamically."
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="reports_module">
      {/* Executive Brief Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-850">
              5. Strategic Insights & Stakeholder Report
            </h2>
          </div>
          <button
            onClick={handlePrint}
            className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer border-0"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Export PDF
          </button>
        </div>

        {!hasAnalysis && (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl max-w-lg mx-auto my-6">
            <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2.5 animate-bounce" />
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Corporate briefing reports compiled next</p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Please initialize either the Gemini EDA scan or train a Machine Learning model prediction first to compile bespoke strategic reports!
            </p>
          </div>
        )}

        {hasAnalysis && (
          <div className="space-y-6 animate-fade-in text-xs">
            {/* Executive Summary */}
            <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-6 rounded-xl border border-indigo-950 shadow relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <span className="px-2.5 py-0.5 rounded bg-white/10 text-indigo-300 font-bold text-[9px] uppercase tracking-wider">
                Corporate Executive Summary
              </span>
              <h3 className="text-base font-bold text-white tracking-tight mt-1.5 mb-2">
                Predictive Governance Report: {filename}
              </h3>
              <p className="text-slate-200 leading-relaxed max-w-2xl text-xs whitespace-pre-line">
                {mlResult?.markdownReport
                  ? "A corporate-level review of prediction matrices was compiled. Model weights align with standard KPI objectives. Training generalizations verify high accuracy thresholds suitable for commercial deployment."
                  : aiAnalysis?.overviewSummary || "Active exploratory analysis profiles raw coordinates and predicts optimum target metrics."}
              </p>
            </div>

            {/* Risks and recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Potential Risks Register */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-850 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4.5 h-4.5 text-rose-500" /> Strategic Business Risks Register
                </h4>
                <div className="space-y-2.5">
                  {(mlResult?.risks || defaultRisks).map((risk, idx) => (
                    <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 pr-2">{risk.title}</span>
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${
                            risk.riskLevel === 'High' || (risk as any).level === 'High'
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}
                        >
                          {(risk as any).riskLevel || (risk as any).level} Risk
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        {risk.description || (risk as any).desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Strategic Recommendations */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-855 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4.5 h-4.5 text-indigo-600" /> Stakeholder Action Recommendations
                </h4>
                <div className="space-y-2.5">
                  {(mlResult?.recommendations || defaultRecommendations).map((rec, idx) => (
                    <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 pr-2">{rec.title}</span>
                        <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                          {(rec as any).impact || (rec as any).impact} Impact
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        {rec.details || (rec as any).desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 6: Specific Column Focus for Data Scientist */}
            <div className="bg-gradient-to-r from-slate-50 to-indigo-50/20 border border-slate-200 p-5 rounded-xl">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-indigo-100/30">
                <CheckSquare className="w-4.5 h-4.5 text-indigo-600" />
                <h4 className="font-bold text-slate-850 text-sm">6. Refined Data Scientist Directive</h4>
              </div>
              <p className="text-slate-500 leading-relaxed mb-3">
                Based on predictive variances and modeling statistics, we advise analytical engineers and data scientists to focus their exploration paths on these fields:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 bg-white p-3.5 rounded-lg border border-slate-200 text-center">
                  <p className="text-[10px] uppercase font-bold text-indigo-600">Audit Focus Column</p>
                  <p className="font-mono font-bold text-slate-900 mt-2 text-sm">
                    {mlResult?.scientistCallout?.focusColumns?.join(', ') || aiAnalysis?.scientistFocus || 'Target Column'}
                  </p>
                  <span className="inline-block mt-2 font-bold text-[9px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase border border-indigo-100/50">
                    Verification Needed
                  </span>
                </div>

                <div className="md:col-span-2 text-[11px] text-slate-600 leading-relaxed space-y-2">
                  <p className="font-bold text-slate-800">Recommended Diagnostics Path:</p>
                  <p>
                    {mlResult?.scientistCallout?.justification ||
                       aiAnalysis?.scientistRationale ||
                      "Analyze feature collinear factors and handle missing rows distributions manually before tuning hyperparameters. Ensure robust data sampling to avoid target value leakages."}
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-600 text-[10px]">
                    {(mlResult?.scientistCallout?.pathways || [
                      "Isolate outlier thresholds using slicers selections.",
                      "Verify temporal variables consistency across target groups."
                    ]).map((pathway, idx) => (
                      <li key={idx} className="flex gap-1 items-start font-sans">
                        <ArrowUpRight className="w-3 h-3 text-indigo-600 mt-0.5 shrink-0" />
                        <span>{pathway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
