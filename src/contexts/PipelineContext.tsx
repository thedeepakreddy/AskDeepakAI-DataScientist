import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface PipelineIntelligence {
  detectedDomain: string;
  inferredProblem: string;
  recommendedTarget: string;
  pipelineStrategy: string;
  stageInstructions: Record<string, string>;
}

export type PipelineStage = 'ingest' | 'clean' | 'eda' | 'ml' | 'dashboard' | 'reports';

export interface StageChecklist {
  [key: string]: boolean;
}

interface PipelineContextType {
  datasetProfile: any | null;
  setDatasetProfile: (profile: any) => void;
  
  businessProblem: string;
  setBusinessProblem: (problem: string) => void;
  
  pipelineIntelligence: PipelineIntelligence | null;
  setPipelineIntelligence: (intel: PipelineIntelligence | null) => void;
  
  mlTarget: string;
  setMlTarget: (target: string) => void;
  
  mlMetrics: any | null;
  setMlMetrics: (metrics: any) => void;
  
  cleaningSteps: any[];
  setCleaningSteps: (steps: any[]) => void;
  
  edaInsights: any[];
  setEdaInsights: (insights: any[]) => void;
  
  featureImportance: any[];
  setFeatureImportance: (importance: any[]) => void;
  
  bannerDismissed: boolean;
  setBannerDismissed: (dismissed: boolean) => void;

  // New Global State variables
  expertMode: boolean;
  setExpertMode: (expert: boolean) => void;
  
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;

  // Minimum required action tracking
  hasRunAudit: boolean;
  setHasRunAudit: (run: boolean) => void;
  
  hasRunEda: boolean;
  setHasRunEda: (run: boolean) => void;
  
  mlSkipped: boolean;
  setMlSkipped: (skipped: boolean) => void;
  
  dashboardRendered: boolean;
  setDashboardRendered: (rendered: boolean) => void;

  // Checklists State
  checklists: Record<PipelineStage, StageChecklist>;
  updateChecklist: (stage: PipelineStage, item: string, completed: boolean) => void;
}

const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

export const PipelineProvider = ({ children }: { children: ReactNode }) => {
  const [datasetProfile, setDatasetProfile] = useState<any | null>(null);
  const [businessProblem, setBusinessProblem] = useState('');
  const [pipelineIntelligence, setPipelineIntelligence] = useState<PipelineIntelligence | null>(null);
  const [mlTarget, setMlTarget] = useState('');
  const [mlMetrics, setMlMetrics] = useState<any | null>(null);
  const [cleaningSteps, setCleaningSteps] = useState<any[]>([]);
  const [edaInsights, setEdaInsights] = useState<any[]>([]);
  const [featureImportance, setFeatureImportance] = useState<any[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // New Global Settings
  const [expertMode, setExpertMode] = useState<boolean>(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(true);

  // Read initial from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedExpert = localStorage.getItem('expertMode');
      if (storedExpert !== null) setExpertMode(storedExpert === 'true');
      
      const storedOnboarding = localStorage.getItem('onboardingCompleted');
      if (storedOnboarding !== null) setOnboardingCompleted(storedOnboarding === 'true');
      else setOnboardingCompleted(false); // First time!
    }
  }, []);

  const handleSetExpertMode = (val: boolean) => {
    setExpertMode(val);
    localStorage.setItem('expertMode', String(val));
  };

  const handleSetOnboardingCompleted = (val: boolean) => {
    setOnboardingCompleted(val);
    localStorage.setItem('onboardingCompleted', String(val));
  };

  // Completion Trackers
  const [hasRunAudit, setHasRunAudit] = useState(false);
  const [hasRunEda, setHasRunEda] = useState(false);
  const [mlSkipped, setMlSkipped] = useState(false);
  const [dashboardRendered, setDashboardRendered] = useState(false);

  // Central Checklist State
  const [checklists, setChecklists] = useState<Record<PipelineStage, StageChecklist>>({
    ingest: { 'Upload CSV': false, 'Review schema': false, 'Set context': false, 'Review intel': false },
    clean: { 'Run audit': false, 'Review issues': false, 'Apply fixes': false, 'Verify data': false },
    eda: { 'Run profiling': false, 'Review column intel': false, 'Explore hypotheses': false, 'Run AB Test': false },
    ml: { 'Review model recommendation': false, 'Select target': false, 'Configure params': false, 'Run model': false },
    dashboard: { 'Review layout': false, 'Customise components': false, 'Apply filters': false, 'Review business insights': false },
    reports: { 'Review risk register': false, 'Review recommendations': false, 'Generate PDF': false, 'Download ETL Script': false }
  });

  const updateChecklist = (stage: PipelineStage, item: string, completed: boolean) => {
    setChecklists(prev => ({
      ...prev,
      [stage]: {
        ...(prev[stage] || {}),
        [item]: completed
      }
    }));
  };

  return (
    <PipelineContext.Provider
      value={{
        datasetProfile, setDatasetProfile,
        businessProblem, setBusinessProblem,
        pipelineIntelligence, setPipelineIntelligence,
        mlTarget, setMlTarget,
        mlMetrics, setMlMetrics,
        cleaningSteps, setCleaningSteps,
        edaInsights, setEdaInsights,
        featureImportance, setFeatureImportance,
        bannerDismissed, setBannerDismissed,
        
        expertMode, setExpertMode: handleSetExpertMode,
        onboardingCompleted, setOnboardingCompleted: handleSetOnboardingCompleted,
        
        hasRunAudit, setHasRunAudit,
        hasRunEda, setHasRunEda,
        mlSkipped, setMlSkipped,
        dashboardRendered, setDashboardRendered,

        checklists, updateChecklist
      }}
    >
      {children}
    </PipelineContext.Provider>
  );
};

export const usePipelineContext = () => {
  const context = useContext(PipelineContext);
  if (context === undefined) {
    throw new Error('usePipelineContext must be used within a PipelineProvider');
  }
  return context;
};

