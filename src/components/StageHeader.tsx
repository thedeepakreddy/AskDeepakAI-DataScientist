import React from 'react';
import { Database, Sparkles, Lightbulb, Brain, LayoutGrid, FileText } from 'lucide-react';
import { PipelineStage } from '../contexts/PipelineContext';

interface StageHeaderProps {
  activeTab: PipelineStage;
}

const STAGE_CONFIG = {
  ingest: {
    icon: Database,
    title: 'Data Ingestion',
    description: 'Upload your dataset and define the business problem. This helps the AI understand the ultimate goal of your analysis.',
    color: 'text-[#4A7FA5]',
    bg: 'bg-[#4A7FA5]/10',
    border: 'border-[#4A7FA5]/20'
  },
  clean: {
    icon: Sparkles,
    title: 'Cleaning Studio',
    description: 'Run an automated quality audit to detect issues like missing values, outliers, and duplicates, then cleanly resolve them.',
    color: 'text-[#3A9E8F]',
    bg: 'bg-[#3A9E8F]/10',
    border: 'border-[#3A9E8F]/20'
  },
  eda: {
    icon: Lightbulb,
    title: 'Exploration (EDA)',
    description: 'Discover hidden patterns and correlations. Generate and test deep hypotheses automatically or manually.',
    color: 'text-[#C8922A]',
    bg: 'bg-[#C8922A]/10',
    border: 'border-[#C8922A]/20'
  },
  ml: {
    icon: Brain,
    title: 'Machine Learning Modeling',
    description: 'Train predictive models using automated machine learning, analyze feature importance, and understand predictions.',
    color: 'text-[#7B5EA7]',
    bg: 'bg-[#7B5EA7]/10',
    border: 'border-[#7B5EA7]/20'
  },
  dashboard: {
    icon: LayoutGrid,
    title: 'Stakeholder Dashboard',
    description: 'A dedicated interactive visual dashboard summarizing findings. Apply intelligent slicers to view different data perspectives.',
    color: 'text-[#3A8C5C]',
    bg: 'bg-[#3A8C5C]/10',
    border: 'border-[#3A8C5C]/20'
  },
  reports: {
    icon: FileText,
    title: 'Reports Hub',
    description: 'Generate polished, executive-ready PDF reports summarizing the data analysis and predictive model performance.',
    color: 'text-[#B5736A]',
    bg: 'bg-[#B5736A]/10',
    border: 'border-[#B5736A]/20'
  }
};

export default function StageHeader({ activeTab }: StageHeaderProps) {
  const config = STAGE_CONFIG[activeTab];
  if (!config) return null;
  
  const Icon = config.icon;

  return (
    <div className={`mb-8 p-6 rounded-2xl border flex items-start gap-4 transition-colors ${config.bg} ${config.border}`}>
      <div className={`p-3 rounded-xl bg-slate-950/40 border ${config.border}`}>
        <Icon className={`w-6 h-6 ${config.color}`} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">{config.title}</h2>
        <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
          {config.description}
        </p>
      </div>
    </div>
  );
}
