import React, { useState, useEffect, useRef } from 'react';
import { usePipelineContext, PipelineStage } from '../contexts/PipelineContext';
import { Database, Sparkles, Lightbulb, Brain, LayoutGrid, FileText, ChevronRight, X, ChevronDown, ChevronUp, Lock } from 'lucide-react';

interface PipelineProgressBarProps {
  activeTab: PipelineStage;
  setActiveTab: (tab: PipelineStage) => void;
}

export default function PipelineProgressBar({ activeTab, setActiveTab }: PipelineProgressBarProps) {
  const {
    datasetProfile,
    businessProblem,
    hasRunAudit,
    hasRunEda,
    mlMetrics,
    mlSkipped,
    dashboardRendered,
    cleaningSteps,
    edaInsights
  } = usePipelineContext();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const expandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isMobile && isExpanded && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isExpanded]);

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    expandTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 400);
  };

  const handleBarTap = (e: React.MouseEvent) => {
    if (!isMobile) return;
    setIsExpanded(true);
  };

  const closeExpanded = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsExpanded(false);
  };

  const stages = [
    { id: 'ingest', name: 'Stage 1. Data Ingestion', desc: 'Upload CSV and set context', req: 'Upload CSV', color: '#4A7FA5', Icon: Database, mobileNumber: '01' },
    { id: 'clean', name: 'Stage 2. Cleaning Studio', desc: 'Find and fix data issues', req: 'Run Quality Audit', color: '#3A9E8F', Icon: Sparkles, mobileNumber: '02' },
    { id: 'eda', name: 'Stage 3. EDA', desc: 'Explore patterns & hypotheses', req: 'Run EDA Profiling', color: '#C8922A', Icon: Lightbulb, mobileNumber: '03' },
    { id: 'ml', name: 'Stage 4. ML Modeling', desc: 'Predict outcomes with AI', req: 'Run Model or Skip ML', color: '#7B5EA7', Icon: Brain, mobileNumber: '04' },
    { id: 'dashboard', name: 'Stage 5. Dashboard', desc: 'Visual interactive analysis', req: 'Render Dashboard', color: '#3A8C5C', Icon: LayoutGrid, mobileNumber: '05' },
    { id: 'reports', name: 'Stage 6. Stakeholder Insights', desc: 'Generate executive PDF', req: 'None', color: '#B5736A', Icon: FileText, mobileNumber: '06' },
  ];

  const getStageStatus = (stageId: string): 'locked' | 'active' | 'completed' | 'warning' => {
    if (activeTab === stageId) return 'active';

    switch (stageId) {
      case 'ingest':
        if (!datasetProfile) return 'locked';
        if (datasetProfile && !businessProblem) return 'warning';
        return 'completed';
      case 'clean':
        if (!datasetProfile) return 'locked';
        if (!hasRunAudit) return 'locked';
        if (hasRunAudit && cleaningSteps.length === 0) return 'warning';
        return 'completed';
      case 'eda':
        if (!hasRunAudit) return 'locked';
        if (!hasRunEda) return 'locked';
        if (hasRunEda && edaInsights.length === 0) return 'warning';
        return 'completed';
      case 'ml':
        if (!hasRunEda) return 'locked';
        if (!mlMetrics && !mlSkipped) return 'locked';
        return 'completed';
      case 'dashboard':
        if (!mlMetrics && !mlSkipped) return 'locked';
        if (!dashboardRendered) return 'locked';
        return 'completed';
      case 'reports':
        if (!dashboardRendered) return 'locked';
        return 'locked';
      default:
        return 'locked';
    }
  };

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNodeClick = (stageId: string, stageName: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (stageId === activeTab) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (isMobile) closeExpanded();
      return;
    }
    if (isUnlocked(stageId)) {
      setActiveTab(stageId as PipelineStage);
      if (isMobile) closeExpanded();
    } else {
      if (isMobile) {
         showToast(`Complete previous stages to unlock ${stageName.split('.')[1]}`);
      }
    }
  };

  return (
      <div 
        ref={containerRef}
        role="navigation"
        aria-label="Pipeline Progress"
        className={`fixed z-[100] transition-all duration-300 ease-out flex flex-col font-sans backdrop-blur-[8px] border border-white/10
          ${isMobile 
            ? `top-[72px] left-0 w-full rounded-b-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${isExpanded ? 'bg-[#1A1A2E]/95 p-4 h-auto' : 'bg-[#1A1A2E]/92 h-[44px] cursor-pointer'}` 
            : `left-3 top-1/2 -translate-y-1/2 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.3)] bg-[#1A1A2E]/90 ${isExpanded ? 'w-[280px] p-4' : 'w-[48px] py-4 cursor-pointer'}`
          }
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={isMobile && !isExpanded ? handleBarTap : undefined}
      >
          <style>{`
            @keyframes softPulse {
                0% { box-shadow: 0 0 0 0 var(--pulse-color); }
                70% { box-shadow: 0 0 0 6px rgba(0,0,0,0); }
                100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
            }
            @keyframes completeRipple {
                0% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.6); opacity: 0; }
                100% { transform: scale(1.8); opacity: 0; }
            }
          `}</style>
          
          {/* Mobile Collapsed State */}
          {isMobile && !isExpanded && (
              <div className="flex items-center justify-between w-full h-full px-4 relative">
                  <div className="flex items-center justify-between flex-1 pr-6">
                    {stages.map((stage) => {
                      const status = getStageStatus(stage.id);
                      const active = status === 'active';
                      return (
                          <div key={`mob-col-${stage.id}`} className="relative flex flex-col items-center justify-center">
                              {/* Status dot above icon */}
                              <div className={`w-1.5 h-1.5 rounded-full mb-0.5 absolute -top-2 ${status === 'locked' || status === 'warning' ? 'opacity-0' : 'opacity-100'}`} 
                                   style={{ backgroundColor: status === 'completed' || status === 'active' ? stage.color : 'transparent' }}>
                              </div>
                              {status === 'warning' && <div className="w-1 h-1 rounded-full bg-amber-400 absolute -top-2" />}
                              {status === 'locked' && <div className="w-1 h-1 rounded-full bg-slate-500 absolute -top-2" />}
                              
                              <stage.Icon 
                                className={`transition-all duration-300 ${active ? 'w-6 h-6' : 'w-5 h-5 opacity-70'} ${status === 'locked' ? 'opacity-30 grayscale' : ''}`}
                                color={status === 'locked' ? '#94a3b8' : stage.color}
                              />
                               {active && (
                                   <div className="absolute inset-0 rounded-full" 
                                        style={{ animation: 'softPulse 2s ease-in-out infinite', '--pulse-color': `${stage.color}66` } as any} />
                               )}
                          </div>
                      )
                    })}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
          )}

          {/* Desktop Collapsed & Expanded AND Mobile Expanded */}
          {(!isMobile || isExpanded) && (
              <div className={`relative w-full h-full flex ${isMobile ? 'flex-col' : 'flex-col justify-center'}`}>
                  {isExpanded && !isMobile && (
                      <button onClick={closeExpanded} className="absolute right-0 -top-1 p-1 text-slate-400 hover:text-white transition-colors z-20">
                          <X className="w-3.5 h-3.5" />
                      </button>
                  )}

                  <div className={`flex ${isMobile ? 'grid grid-cols-2 gap-3' : 'flex-col gap-2 relative'}`}>
                      {stages.map((stage, idx) => {
                          const status = getStageStatus(stage.id);
                          const unlocked = isUnlocked(stage.id);
                          const active = status === 'active';
                          const isLast = idx === stages.length - 1;

                          return (
                              <div 
                                  key={stage.id} 
                                  className={`group relative flex items-center outline-none ${isMobile ? 'flex-col text-center px-2 py-4 rounded-xl bg-slate-900/40 border border-slate-800/60' : 'flex-row'} ${unlocked ? 'cursor-pointer hover:bg-white/5 rounded-xl' : 'cursor-not-allowed opacity-80'} transition-colors duration-200 focus-within:ring-2`}
                                  style={{"--tw-ring-color": stage.color} as any}
                                  onClick={(e) => handleNodeClick(stage.id, stage.name, e)}
                                  tabIndex={0}
                                  aria-label={`${stage.name} - ${status}`}
                                  onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleNodeClick(stage.id, stage.name, e as any);
                                      if (e.key === 'Escape') closeExpanded(e as any);
                                  }}
                              >
                                  {/* Desktop vertical connector line logic inside the relative container */}
                                  {!isMobile && !isLast && isExpanded && (
                                     <div className="absolute left-[23px] top-[40px] w-[2px] h-[calc(100%-8px)] -z-10 transition-colors duration-500"
                                          style={{ backgroundColor: status === 'completed' ? stage.color : 'rgba(255,255,255,0.05)' }} />
                                  )}

                                  {/* Icon Container Desktop*/}
                                  {!isMobile && (
                                      <div className="w-[48px] shrink-0 flex items-center justify-center py-2 relative">
                                          <div className={`relative p-2 rounded-xl transition-all duration-300 ${active ? 'scale-110' : ''}`}
                                               style={{ backgroundColor: status === 'locked' ? 'transparent' : `${stage.color}15` }}>
                                             <stage.Icon 
                                                className={`w-5 h-5 transition-transform duration-300 ${status === 'completed' ? 'scale-100' : ''}`} 
                                                color={status === 'locked' ? '#64748B' : stage.color}
                                             />
                                             {/* Badge overrides */}
                                             {status === 'completed' && (
                                                 <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-[#1A1A2E]" style={{ backgroundColor: stage.color }}>
                                                     <svg viewBox="0 0 14 14" fill="none" className="w-2 h-2 text-white stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l3 3 5-5" /></svg>
                                                 </div>
                                             )}
                                             {status === 'warning' && (
                                                 <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-[#1A1A2E]" />
                                             )}
                                             
                                             {/* Pulse and Ripple Effects */}
                                             {active && (
                                                  <div className="absolute inset-0 rounded-xl" 
                                                       style={{ animation: 'softPulse 2s ease-in-out infinite', '--pulse-color': `${stage.color}66` } as any} />
                                             )}
                                             {status === 'completed' && (
                                                  <div className="absolute inset-0 rounded-xl" 
                                                       style={{ border: `1px solid ${stage.color}`, animation: 'completeRipple 0.6s ease-out' }} />
                                             )}
                                          </div>
                                          {/* Status Dot (Only shows when collapsed on desktop) */}
                                          {!isExpanded && (
                                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                                                  <div className={`w-1 h-1 rounded-full ${status === 'locked' ? 'bg-slate-600' : status === 'warning' ? 'bg-amber-400' : ''}`}
                                                       style={{ backgroundColor: status === 'completed' || status === 'active' ? stage.color : undefined }} />
                                              </div>
                                          )}
                                      </div>
                                  )}

                                  {/* Icon Container Mobile */}
                                  {isMobile && (
                                      <div className={`relative p-3 mb-3 rounded-2xl transition-all duration-300 shadow-sm ${active ? 'scale-110' : ''}`}
                                           style={{ backgroundColor: status === 'locked' ? 'rgba(100,116,139,0.1)' : `${stage.color}15` }}>
                                         <stage.Icon 
                                            className={`w-6 h-6 transition-transform duration-300`} 
                                            color={status === 'locked' ? '#64748B' : stage.color}
                                         />
                                         {status === 'completed' && (
                                             <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#1A1A2E]" style={{ backgroundColor: stage.color }}>
                                                 <svg viewBox="0 0 14 14" fill="none" className="w-2.5 h-2.5 text-white stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l3 3 5-5" /></svg>
                                             </div>
                                         )}
                                         {status === 'warning' && (
                                             <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-[#1A1A2E]" />
                                         )}
                                         {active && (
                                              <div className="absolute inset-0 rounded-2xl" 
                                                   style={{ animation: 'softPulse 2s ease-in-out infinite', '--pulse-color': `${stage.color}66` } as any} />
                                         )}
                                      </div>
                                  )}

                                  {/* Text Content */}
                                  {isExpanded && (
                                      <div className={`transition-opacity duration-300 ${isMobile ? 'w-full' : 'flex-1 pl-1 pr-4 whitespace-nowrap overflow-hidden'}`} style={{ opacity: isExpanded ? 1 : 0, transitionDelay: '100ms' }}>
                                          <div className={`text-[10px] font-mono tracking-wider mb-0.5 ${status === 'locked' ? 'text-slate-500' : 'text-slate-400'}`}>{stage.name.split('.')[0]}.</div>
                                          <div className={`text-sm font-bold truncate`} style={{ color: status === 'locked' ? '#64748B' : stage.color }}>
                                              {stage.name.split('. ')[1]}
                                          </div>
                                          <div className="text-[11px] mt-1 truncate text-slate-300">
                                              {status === 'completed' ? 'Complete' : status === 'active' ? 'In Progress' : status === 'warning' ? 'Action Required' : 'Not started'}
                                          </div>
                                      </div>
                                  )}
                                  
                                  {/* Tooltip for Locked Desktop */}
                                  {!isMobile && !unlocked && isExpanded && (
                                      <div className="absolute left-[130%] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-800 text-xs text-rose-300 px-3 py-1.5 rounded whitespace-nowrap shadow-xl border border-rose-500/20 z-50">
                                          <Lock className="w-3 h-3 inline mr-1" />
                                          Complete {idx > 0 ? stages[idx-1].name.split('. ')[1] : 'previous'} first
                                      </div>
                                  )}
                              </div>
                          );
                      })}
                  </div>
                  
                  {/* Chevron hint on Desktop when collapsed */}
                  {!isMobile && !isExpanded && (
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-slate-500/40">
                          <ChevronRight className="w-4 h-4 ml-0.5" />
                      </div>
                  )}

                  {/* Collapse chevron on Mobile */}
                  {isMobile && isExpanded && (
                      <div className="pt-4 border-t border-slate-800 mt-4 flex justify-center w-full">
                          <button onClick={closeExpanded} className="p-1 min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-800/40 rounded-full text-slate-400 hover:text-white transition-colors">
                              <ChevronUp className="w-5 h-5" />
                          </button>
                      </div>
                  )}
              </div>
          )}

          {/* Toast Notification for Mobile */}
          {toastMessage && isMobile && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/95 backdrop-blur-md border border-slate-700 text-white px-5 py-2.5 rounded-full text-xs shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-6 whitespace-nowrap font-medium flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  {toastMessage}
              </div>
          )}
      </div>
  );
}
