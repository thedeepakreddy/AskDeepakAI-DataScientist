import React from 'react';
import { usePipelineContext, PipelineStage } from '../contexts/PipelineContext';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';

interface StageNavigationProps {
  activeTab: PipelineStage;
  setActiveTab: (tab: PipelineStage) => void;
}

const STAGES: PipelineStage[] = ['ingest', 'clean', 'eda', 'ml', 'dashboard', 'reports'];
const STAGE_NAMES = {
  ingest: 'Data Ingestion',
  clean: 'Cleaning Studio',
  eda: 'Exploration (EDA)',
  ml: 'ML Modeling',
  dashboard: 'Dashboard',
  reports: 'Reports Hub'
};

export default function StageNavigation({ activeTab, setActiveTab }: StageNavigationProps) {
  const {
    datasetProfile,
    businessProblem,
    hasRunAudit,
    hasRunEda,
    mlMetrics,
    mlSkipped,
    dashboardRendered
  } = usePipelineContext();

  const currentIndex = STAGES.indexOf(activeTab);
  const prevStage = currentIndex > 0 ? STAGES[currentIndex - 1] : null;
  const nextStage = currentIndex < STAGES.length - 1 ? STAGES[currentIndex + 1] : null;

  const isUnlocked = (stageId: string) => {
    switch (stageId) {
      case 'ingest': return true;
      case 'clean': return !!datasetProfile;
      case 'eda': return hasRunAudit;
      case 'ml': return hasRunEda;
      case 'dashboard': return !!mlMetrics || mlSkipped;
      case 'reports': return dashboardRendered;
      default: return false;
    }
  };

  const handleNext = () => {
    if (nextStage && isUnlocked(nextStage)) {
      setActiveTab(nextStage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (prevStage) {
      setActiveTab(prevStage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextUnlocked = nextStage ? isUnlocked(nextStage) : false;

  return (
    <div className="mt-12 mb-8 flex items-center justify-between bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6 backdrop-blur-md">
      <div>
        {prevStage ? (
          <button
            onClick={handlePrev}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <div className="text-left hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Previous</div>
              <div className="text-sm font-medium">{STAGE_NAMES[prevStage]}</div>
            </div>
            <span className="sm:hidden text-sm font-medium">Back</span>
          </button>
        ) : (
          <div className="w-24" /> // Placeholder for spacing
        )}
      </div>

      <div className="flex-1 px-4 text-center">
         {/* Optional: Add a general hint message based on the current stage if next is locked */}
         {!nextUnlocked && nextStage === 'clean' && (
           <p className="text-xs text-slate-500 font-medium">Upload a dataset to unlock the next stage.</p>
         )}
         {!nextUnlocked && nextStage === 'eda' && (
           <p className="text-xs text-slate-500 font-medium">Run a Quality Audit to unlock Exploration.</p>
         )}
         {!nextUnlocked && nextStage === 'ml' && (
           <p className="text-xs text-slate-500 font-medium">Generate EDA scan to unlock ML Modeling.</p>
         )}
         {!nextUnlocked && nextStage === 'dashboard' && (
           <p className="text-xs text-slate-500 font-medium">Run a model or skip ML to unlock the Dashboard.</p>
         )}
         {!nextUnlocked && nextStage === 'reports' && (
           <p className="text-xs text-slate-500 font-medium">Render the Dashboard to unlock Reports.</p>
         )}
      </div>

      <div>
        {nextStage ? (
          <button
            onClick={handleNext}
            disabled={!nextUnlocked}
            className={`flex items-center gap-2 transition-all px-4 py-2 sm:p-0 sm:bg-transparent rounded-lg sm:rounded-none ${nextUnlocked ? 'text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 sm:hover:bg-transparent' : 'text-slate-600 cursor-not-allowed'}`}
          >
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase font-bold tracking-wider mb-0.5 flex items-center justify-end gap-1">
                Next Stage {!nextUnlocked && <Lock className="w-3 h-3" />}
              </div>
              <div className="text-sm font-medium">{STAGE_NAMES[nextStage]}</div>
            </div>
            <span className="sm:hidden text-sm font-medium flex items-center gap-1">
              Next {!nextUnlocked && <Lock className="w-3 h-3" />}
            </span>
            <ChevronRight className="w-5 h-5 hidden sm:block" />
          </button>
        ) : (
          <div className="w-24" /> // Placeholder for spacing
        )}
      </div>
    </div>
  );
}
