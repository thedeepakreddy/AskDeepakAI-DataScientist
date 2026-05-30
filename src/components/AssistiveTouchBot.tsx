/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, Send, X, Trash2, Cpu, BarChart2, Check, RefreshCw, Layers, Compass, Code, Play } from 'lucide-react';
import { Dataset } from '../types';

interface AssistiveTouchBotProps {
  activeDataset: Dataset | null;
  onUpdateDataset: (updated: Dataset) => void;
  onResetOriginal: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  triggerAIScan: () => Promise<void>;
  triggerPrediction: (
    targetCol: string,
    features: string[],
    modelClass: 'classification' | 'regression' | 'timeseries',
    hyperparameters: Record<string, any>
  ) => Promise<any>;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  executedCommands?: string[];
}

export default function AssistiveTouchBot({
  activeDataset,
  onUpdateDataset,
  onResetOriginal,
  activeTab,
  setActiveTab,
  triggerAIScan,
  triggerPrediction
}: AssistiveTouchBotProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello! I am **AskAI**, acting as your interactive **AskDeepakAI** co-pilot. 👋

I have real-time access to your active dataset. I can **read** statistics, **write adjustments** (like dropping columns or filling missing cells), and **edit workflow stages** instantly by your command.

Try asking me items like:
- *"Analyze this dataset with an EDA scan"*
- *"Drop the PaymentMethod column"*
- *"Fill missing Age data using the median"*
- *"Run classification training to predict Churn"*
- *"Go to the Stakeholder Dashboard"*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastExecutedTaskMsg, setLastExecutedTaskMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const dragContainerRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);

  // Responsive state for absolute coordinate snapping representation
  // Starts safely at a guaranteed visible position relative to typical smaller dimensions,
  // then instantly adjusts once the component mounts in the true client browser.
  const [position, setPosition] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 375;
    const h = typeof window !== 'undefined' ? window.innerHeight : 667;
    // Safely position on the right side within screen bounds
    const buttonSize = 56;
    const paddingX = 16;
    const initialX = w > 100 ? w - buttonSize - paddingX : 280;
    const initialY = h > 200 ? h - 185 : 450;
    return { x: initialX, y: initialY };
  });

  // Dynamic progressive clamping helper to keep button 100% visible at all times
  useEffect(() => {
    const clampToVisibleScreen = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      if (w > 50 && h > 50) {
        setPosition(prev => {
          const buttonSize = 56;
          const paddingX = 16;
          const headerHeight = 85;
          const footerHeight = 100;

          // Clamped X coordinates
          const maxX = w - buttonSize - paddingX;
          const minX = paddingX;
          let targetX = prev.x;
          if (prev.x > maxX || prev.x < minX || prev.x + buttonSize > w) {
            targetX = maxX; // Snap back to nearest edge/right side
          }

          // Clamped Y coordinates
          const maxY = h - footerHeight - buttonSize;
          const minY = headerHeight;
          let targetY = prev.y;
          if (prev.y > maxY || prev.y < minY || prev.y + buttonSize > h) {
            targetY = maxY; // Align near bottom safely
          }

          if (targetX !== prev.x || targetY !== prev.y) {
            return { x: targetX, y: targetY };
          }
          return prev;
        });
      }
    };

    // run immediately on client mount
    clampToVisibleScreen();

    // Listen to resize events
    window.addEventListener('resize', clampToVisibleScreen);

    // Progressive checking intervals to compensate for slow loads, sub-iframes, and dynamic viewports on Render
    const checks = [50, 150, 450, 950, 2000, 4500];
    const timers = checks.map(t => setTimeout(clampToVisibleScreen, t));

    return () => {
      window.removeEventListener('resize', clampToVisibleScreen);
      timers.forEach(clearTimeout);
    };
  }, []);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      setTimeout(scrollToBottom, 60);
    }
  }, [messages, isChatOpen]);

  // Execute API commands returned from Gemini in real-time
  const executeCommandsList = async (commands: any[]): Promise<string[]> => {
    const executedLogs: string[] = [];
    if (!commands || commands.length === 0) return executedLogs;

    for (const cmd of commands) {
      try {
        switch (cmd.type) {
          case 'SELECT_TAB':
            if (cmd.tab) {
              setActiveTab(cmd.tab);
              executedLogs.push(`🔄 Switched workflow stage to "${cmd.tab.toUpperCase()}"`);
            }
            break;

          case 'RESET_DATASET':
            onResetOriginal();
            executedLogs.push('🧹 Dynamic dataset restored to original RAW template');
            break;

          case 'DROP_COLUMN':
            if (activeDataset && cmd.column) {
              const targetColName = activeDataset.columns.find(
                c => c.name.toLowerCase() === cmd.column.toLowerCase()
              )?.name;

              if (targetColName) {
                const refreshedCols = activeDataset.columns.filter(c => c.name !== targetColName);
                const refreshedRows = activeDataset.rows.map(row => {
                  const copy = { ...row };
                  delete copy[targetColName];
                  return copy;
                });

                onUpdateDataset({
                  ...activeDataset,
                  columns: refreshedCols,
                  rows: refreshedRows,
                  rowCount: refreshedRows.length
                });
                executedLogs.push(`🗑️ Dropped column "${targetColName}" from active coordinates`);
              } else {
                executedLogs.push(`⚠️ Column "${cmd.column}" not found in current structures`);
              }
            }
            break;

          case 'FILL_MISSING':
            if (activeDataset && cmd.column) {
              const targetCol = activeDataset.columns.find(
                c => c.name.toLowerCase() === cmd.column.toLowerCase()
              );

              if (targetCol) {
                const strategy = cmd.strategy || 'mean';
                let fillVal: any = 0;

                if (targetCol.type === 'numeric') {
                  if (strategy === 'mean') fillVal = targetCol.statistics.mean || 0;
                  else if (strategy === 'median') fillVal = targetCol.statistics.median || 0;
                  else fillVal = 0;
                } else {
                  fillVal = targetCol.statistics.mostCommon?.[0]?.value || 'Unknown';
                }

                const cleanedRows = activeDataset.rows.map(row => {
                  const val = row[targetCol.name];
                  if (val === null || val === undefined || val === '') {
                    return { ...row, [targetCol.name]: fillVal };
                  }
                  return row;
                });

                const updatedCols = activeDataset.columns.map(col => {
                  if (col.name === targetCol.name) {
                    return { ...col, missingCount: 0 };
                  }
                  return col;
                });

                onUpdateDataset({
                  ...activeDataset,
                  columns: updatedCols,
                  rows: cleanedRows
                });
                executedLogs.push(`✨ Imputed missing values in "${targetCol.name}" using strategy "${strategy}" (${fillVal})`);
              } else {
                executedLogs.push(`⚠️ Column "${cmd.column}" not found to perform imputation`);
              }
            }
            break;

          case 'RUN_EDA_SCAN':
            // Async background call
            triggerAIScan();
            executedLogs.push('🧠 Neural exploratory scanning started in the background');
            break;

          case 'RUN_ML':
            if (activeDataset && cmd.targetColumn) {
              const foundTarget = activeDataset.columns.find(
                c => c.name.toLowerCase() === cmd.targetColumn.toLowerCase()
              )?.name || activeDataset.columns[activeDataset.columns.length - 1]?.name;

              const featCols = Array.isArray(cmd.featureColumns) 
                ? cmd.featureColumns.map(fc => activeDataset.columns.find(c => c.name.toLowerCase() === fc.toLowerCase())?.name).filter(Boolean) as string[]
                : activeDataset.columns.filter(c => c.name !== foundTarget).map(c => c.name).slice(0, 4);

              const modelType = cmd.modelType || (foundTarget.toLowerCase().includes('churn') ? 'classification' : 'regression');
              const hParams = cmd.hyperparameters || { n_estimators: 100, max_depth: 8 };

              triggerPrediction(foundTarget, featCols, modelType, hParams);
              executedLogs.push(`🔮 Machine Learning pipeline trained on "${foundTarget}" using features [${featCols.join(', ')}]`);
            }
            break;

          case 'FILTER_ROWS':
            if (activeDataset && cmd.column && cmd.operator) {
              const targetColName = activeDataset.columns.find(
                c => c.name.toLowerCase() === cmd.column.toLowerCase()
              )?.name;

              if (targetColName) {
                const operator = cmd.operator;
                const filterVal = cmd.value;

                const filteredRows = activeDataset.rows.filter(row => {
                  const val = row[targetColName];
                  if (val === null || val === undefined) return false;

                  if (operator === '==') return String(val).toLowerCase() === String(filterVal).toLowerCase();
                  if (operator === '!=') return String(val).toLowerCase() !== String(filterVal).toLowerCase();
                  if (operator === '>') return Number(val) > Number(filterVal);
                  if (operator === '<') return Number(val) < Number(filterVal);
                  return true;
                });

                onUpdateDataset({
                  ...activeDataset,
                  rows: filteredRows,
                  rowCount: filteredRows.length
                });

                executedLogs.push(`🔍 Filtered dataset: Kept rows where "${targetColName}" ${operator} "${filterVal}" (${filteredRows.length} left)`);
              }
            }
            break;

          case 'ADD_COLUMN':
            if (activeDataset && cmd.column) {
              const newColName = cmd.column;
              const newColType = cmd.columnType || 'categorical';
              const defaultVal = cmd.value !== undefined ? cmd.value : '';

              if (!activeDataset.columns.some(c => c.name.toLowerCase() === newColName.toLowerCase())) {
                const newColMeta = {
                  name: newColName,
                  type: newColType as any,
                  missingCount: 0,
                  distinctCount: 1,
                  statistics: {
                    min: newColType === 'numeric' ? Number(defaultVal) || 0 : undefined,
                    max: newColType === 'numeric' ? Number(defaultVal) || 0 : undefined,
                    mean: newColType === 'numeric' ? Number(defaultVal) || 0 : undefined,
                    median: newColType === 'numeric' ? Number(defaultVal) || 0 : undefined,
                    mostCommon: [{ value: String(defaultVal), count: activeDataset.rows.length }]
                  }
                };

                const updatedRows = activeDataset.rows.map(row => ({
                  ...row,
                  [newColName]: defaultVal
                }));

                onUpdateDataset({
                  ...activeDataset,
                  columns: [...activeDataset.columns, newColMeta],
                  rows: updatedRows
                });
                executedLogs.push(`➕ Added column "${newColName}" of type "${newColType}" filled with "${defaultVal}"`);
              } else {
                executedLogs.push(`⚠️ Column "${newColName}" already exists`);
              }
            }
            break;

          case 'ADD_ROW':
            if (activeDataset) {
              const newRow: Record<string, any> = {};
              activeDataset.columns.forEach(col => {
                if (col.type === 'numeric') {
                  newRow[col.name] = 0;
                } else if (col.type === 'boolean') {
                  newRow[col.name] = false;
                } else {
                  newRow[col.name] = '';
                }
              });

              // Optional support for custom values filled by AI
              if (cmd.values && typeof cmd.values === 'object') {
                Object.keys(cmd.values).forEach(k => {
                  const matchCol = activeDataset.columns.find(col => col.name.toLowerCase() === k.toLowerCase());
                  if (matchCol) {
                    newRow[matchCol.name] = cmd.values[k];
                  }
                });
              }

              const updatedRows = [...activeDataset.rows, newRow];
              onUpdateDataset({
                ...activeDataset,
                rows: updatedRows,
                rowCount: updatedRows.length
              });
              executedLogs.push(`➕ Appended new raw row matching structure`);
            }
            break;

          case 'DELETE_ROW':
            if (activeDataset && cmd.index !== undefined) {
              const idxToDelete = Number(cmd.index);
              if (idxToDelete >= 0 && idxToDelete < activeDataset.rows.length) {
                const refreshedRows = activeDataset.rows.filter((_, idx) => idx !== idxToDelete);
                onUpdateDataset({
                  ...activeDataset,
                  rows: refreshedRows,
                  rowCount: refreshedRows.length
                });
                executedLogs.push(`🗑️ Deleted dataset row index ${idxToDelete}`);
              } else {
                executedLogs.push(`⚠️ Invalid row index ${idxToDelete} specified`);
              }
            }
            break;

          case 'EXECUTE_DATASET_JS':
            if (activeDataset && cmd.jsCode) {
              try {
                const updater = new Function('dataset', `
                  try {
                    return (${cmd.jsCode})(dataset);
                  } catch (e) {
                    console.error("Inner dynamic code execution failed:", e);
                    throw e;
                  }
                `);
                const updated = updater(activeDataset);
                if (updated && Array.isArray(updated.rows)) {
                  onUpdateDataset({
                    ...activeDataset,
                    ...updated,
                    rowCount: updated.rows.length
                  });
                  let logMsg = `📊 SQL Action Applied`;
                  if (cmd.sqlQuery) logMsg += ` [Query: "${cmd.sqlQuery}"]`;
                  if (cmd.explanation) logMsg += `: ${cmd.explanation}`;
                  executedLogs.push(logMsg);
                } else {
                  executedLogs.push(`⚠️ Action executed successfully but returned incomplete data arrays`);
                }
              } catch (evalErr: any) {
                console.error("Evaluation error:", evalErr);
                executedLogs.push(`❌ Action Compiler Error: ${evalErr.message || String(evalErr)}`);
              }
            }
            break;

          default:
            break;
        }
      } catch (err: any) {
        executedLogs.push(`❌ Error executing command [${cmd.type}]: ${err.message || String(err)}`);
      }
    }

    return executedLogs;
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText ? customText.trim() : inputText.trim();
    if (!textToSend || isGenerating) return;

    if (!customText) {
      setInputText('');
    }

    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setIsGenerating(true);

    try {
      // Build dataset context schema to share with the Gemini Bot
      const datasetContext = activeDataset ? {
        filename: activeDataset.filename,
        rowCount: activeDataset.rowCount,
        columns: activeDataset.columns.map(c => ({
          name: c.name,
          type: c.type,
          missingCount: c.missingCount,
          distinctCount: c.distinctCount,
          statistics: {
            mean: c.statistics.mean,
            median: c.statistics.median,
            mostCommon: c.statistics.mostCommon?.slice(0, 3)
          }
        })),
        sampleRows: activeDataset.rows.slice(0, 3)
      } : null;

      // Extract brief history of latest 8 messages to keep token counts tight
      const messageHistory = messages.slice(-8).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messageHistory,
          datasetContext,
          activeTab
        })
      });

      if (!res.ok) {
        throw new Error('Chat model request failed on connection server.');
      }

      const data = await res.json();
      
      // Execute any commands returned by the model
      const executedLogs = await executeCommandsList(data.commands || []);

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message || `Processed your instruction successfully.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        executedCommands: executedLogs
      };

      setMessages(prev => [...prev, botMsg]);

      // Trigger temporary glowing system overlay notification on screen
      if (executedLogs.length > 0) {
        setLastExecutedTaskMsg(executedLogs.join(' | '));
        setTimeout(() => setLastExecutedTaskMsg(null), 5000);
      }

    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠️ Failed to execute task: ${err.message || 'connection timeout'}. Please verify server pipelines are running.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestedPromptClick = (promptStr: string) => {
    handleSendMessage(promptStr);
  };

  // Drag container Ref bounding calculations
  useEffect(() => {
    // Generate simple boundary constraints handler
  }, []);

  return (
    <>
      {/* Dynamic Screen Overlay for Executed Tasks */}
      <AnimatePresence>
        {lastExecutedTaskMsg && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#10b981]/15 backdrop-blur-md border border-[#10b981]/30 text-[#10b981] font-mono text-xs px-5 py-3 rounded-full flex items-center gap-2 shadow-2xl tracking-tight leading-relaxed font-bold select-none max-w-lg text-center"
          >
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
            <span>{lastExecutedTaskMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AssistiveTouch Floating Base Area */}
      <div 
        ref={dragContainerRef}
        className="fixed inset-0 pointer-events-none z-[9999] select-none overflow-hidden" 
        id="assistive_draggable_universe"
      >
        <AnimatePresence mode="wait">
          {!isChatOpen ? (
            /* AssistiveTouch Button Mode - Visible only when Chatbox is closed */
            <motion.div
              key="assistive-icon"
              drag
              dragMomentum={false}
              dragElastic={0.1}
              dragConstraints={dragContainerRef}
              animate={{ x: position.x, y: position.y, scale: 1, opacity: 1 }}
              initial={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 220
              }}
              className="fixed top-0 left-0 pointer-events-auto cursor-grab active:cursor-grabbing z-50 flex flex-col items-center justify-center p-1"
              style={{ touchAction: 'none' }}
              onDragStart={() => { isDragging.current = true; }}
              onDragEnd={(e, info) => {
                // Get release coordinates
                const pointerX = info.point.x;
                const pointerY = info.point.y;

                const midX = window.innerWidth / 2;
                const paddingX = 16;
                const buttonSize = 56;

                // Snap magnetically to the closest screen edge
                let targetX = pointerX < midX 
                  ? paddingX 
                  : window.innerWidth - buttonSize - paddingX;

                // Constrain vertically to stay safely within visible interactive frame (clear of header/footer)
                const headerLimit = 85;
                const footerLimit = 100;
                let targetY = Math.max(headerLimit, Math.min(window.innerHeight - footerLimit - buttonSize, pointerY - (buttonSize / 2)));

                // Set state to trigger framer motion spring physics magnetic snapping
                setPosition({ x: targetX, y: targetY });

                setTimeout(() => { isDragging.current = false; }, 150);
              }}
              onTap={() => {
                if (!isDragging.current) {
                  // Precheck to ensure opening the chat box doesn't push it out of screen bounds
                  const chatWidth = 270;
                  const chatHeight = 360;
                  const pad = 12;

                  let cx = position.x;
                  let cy = position.y;

                  if (cx + chatWidth > window.innerWidth) {
                    cx = window.innerWidth - chatWidth - pad;
                  }
                  if (cx < pad) cx = pad;

                  if (cy + chatHeight > window.innerHeight) {
                    cy = window.innerHeight - chatHeight - pad;
                  }
                  if (cy < pad) cy = pad;

                  setPosition({ x: cx, y: cy });
                  setIsChatOpen(true);
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* iOS AssistiveTouch Iconic Circle Shell with continuous 3D Live Aura */}
              <div className="w-14 h-14 bg-[#0A0D14]/90 backdrop-blur-md rounded-full border border-slate-700/50 flex items-center justify-center shadow-[0_0_20px_rgba(59,200,200,0.25)] relative group overflow-hidden select-none animate-neon-breath preserve-3d">
                <div className="absolute inset-0 bg-[#070A13]/85 rounded-full pointer-events-none" />

                {/* Ambient dynamic grid or stardust backdrops */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none animate-quantum-pulsar" />

                {/* 3D Holographic Orbiting Rings (Continuous) */}
                <div className="absolute w-12 h-12 rounded-full border border-dashed border-indigo-400/40 animate-live-ring-1 pointer-events-none" style={{ transformStyle: 'preserve-3d' }} />
                <div className="absolute w-11 h-11 rounded-full border border-double border-teal-400/30 animate-live-ring-2 pointer-events-none" style={{ transformStyle: 'preserve-3d' }} />
                <div className="absolute w-12 h-12 rounded-full border border-dotted border-rose-450/30 animate-live-ring-3 pointer-events-none" style={{ transformStyle: 'preserve-3d' }} />

                {/* Middle Ring Holder */}
                <div className="w-11 h-11 rounded-full border border-slate-600/30 flex items-center justify-center bg-slate-900/40 relative z-10 preserve-3d">
                  
                  {/* Central Round AskDeepakAI Logo Design - Spinning in 3D perspective continuously */}
                  <div className="w-8 h-8 rounded-full bg-[#050811]/95 flex flex-col justify-between p-1.5 border border-slate-700/60 shadow-[0_0_15px_rgba(59,200,200,0.4)] relative z-20 select-none overflow-hidden animate-live-3d-spin preserve-3d">
                    
                    {/* Glossy Reflection Sweep across the 3D rotating coin */}
                    <div className="absolute top-0 bottom-0 w-[40%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shiny-sheen pointer-events-none" />

                    {/* Top Bar with 3D layer translated layout */}
                    <div className="h-[24%] w-full flex rounded-full overflow-hidden" style={{ transform: 'translateZ(4px)' }}>
                      <div className="w-[18%] h-full bg-[#1b5bd2]"></div>
                      <div className="w-[82%] h-full bg-[#3bc8c8]"></div>
                    </div>
                    {/* Middle Bar with 3D layer translated layout */}
                    <div className="h-[24%] w-full flex rounded-full overflow-hidden" style={{ transform: 'translateZ(8px)' }}>
                      <div className="w-[18%] h-full bg-[#3bc8c8]"></div>
                      <div className="w-[82%] h-full bg-[#ef7222]"></div>
                    </div>
                    {/* Bottom Bar with 3D layer translated layout */}
                    <div className="h-[24%] w-[64%] flex rounded-full overflow-hidden" style={{ transform: 'translateZ(6px)' }}>
                      <div className="w-[32%] h-full bg-[#dfa435]"></div>
                      <div className="w-[68%] h-full bg-[#b22038]"></div>
                    </div>

                    {/* Inner 3D Backlight ring */}
                    <div className="absolute inset-0 border border-white/5 rounded-full pointer-events-none" />
                  </div>
                </div>

                {/* Dynamic corner specular flare elements */}
                <span className="absolute top-1 left-2 w-1 h-1 rounded-full bg-white opacity-40 blur-[0.5px]" />
                <span className="absolute bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-indigo-400 opacity-30 blur-[1px]" />

                {/* Ambient horizontal indicator glow */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#1b5bd2]/60 via-[#3bc8c8]/60 to-[#ef7222]/60 opacity-80 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-400 mt-1.5 bg-[#0B0F19]/90 border border-slate-800/80 px-2 py-0.5 rounded-full select-none shadow-md hidden sm:inline tracking-wide">
                AskAI
              </span>
            </motion.div>
          ) : (
            /* Chat Box Mode (65% Scaler Size applied, Draggable across coordinates) */
            <motion.div
              key="assistive-chat"
              drag
              dragMomentum={false}
              dragElastic={0.1}
              dragConstraints={dragContainerRef}
              animate={{ x: position.x, y: position.y, scale: 1, opacity: 1 }}
              initial={{ scale: 0.8, opacity: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onDragStart={() => { isDragging.current = true; }}
              onDragEnd={(e, info) => {
                const chatWidth = 270;
                const chatHeight = 360;
                const pad = 12;

                // Match alignment accurately
                let targetX = info.point.x - (chatWidth / 2);
                let targetY = info.point.y - 20;

                // Impose boundaries constraint
                targetX = Math.max(pad, Math.min(window.innerWidth - chatWidth - pad, targetX));
                targetY = Math.max(80, Math.min(window.innerHeight - 100 - chatHeight, targetY));

                setPosition({ x: targetX, y: targetY });
                setTimeout(() => { isDragging.current = false; }, 120);
              }}
              className="fixed top-0 left-0 w-[270px] h-[360px] bg-[#0A0F1D]/95 border border-slate-800 rounded-3xl shadow-3xl flex flex-col z-50 pointer-events-auto overflow-hidden backdrop-blur-lg select-text"
              id="assistive_chat_panel"
              style={{ touchAction: 'none' }}
            >
              {/* Header Details */}
              <div className="bg-[#0e162a]/95 px-3 py-2 border-b border-slate-800/80 flex items-center justify-between z-10 shrink-0 cursor-move select-none">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#070A13] rounded-full flex flex-col justify-between p-1 border border-slate-700/40 relative select-none shadow-md shrink-0 overflow-hidden">
                    {/* Top Bar */}
                    <div className="h-[24%] w-full flex rounded-full overflow-hidden">
                      <div className="w-[18%] h-full bg-[#1b5bd2]"></div>
                      <div className="w-[82%] h-full bg-[#3bc8c8]"></div>
                    </div>
                    {/* Middle Bar */}
                    <div className="h-[24%] w-full flex rounded-full overflow-hidden">
                      <div className="w-[18%] h-full bg-[#3bc8c8]"></div>
                      <div className="w-[82%] h-full bg-[#ef7222]"></div>
                    </div>
                    {/* Bottom Bar */}
                    <div className="h-[24%] w-[64%] flex rounded-full overflow-hidden">
                      <div className="w-[32%] h-full bg-[#dfa435]"></div>
                      <div className="w-[68%] h-full bg-[#b22038]"></div>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 border border-[#0A0F1D] absolute bottom-0.5 right-0.5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[11px] text-white flex items-center gap-1 leading-none">
                      AskAI <span className="text-[8px] text-teal-400 font-bold font-mono bg-[#3bc8c8]/10 px-1 rounded border border-[#3bc8c8]/20">DeepakAI</span>
                    </h4>
                    <p className="text-[8px] text-slate-400 mt-0.5 font-medium leading-none">Interactive Data Copilot</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Close the chat and snap the AssistiveTouch button back to nearest screen edge
                    setIsChatOpen(false);
                    setTimeout(() => {
                      const midX = window.innerWidth / 2;
                      const paddingX = 16;
                      const buttonSize = 56;
                      let snapX = position.x < midX ? paddingX : window.innerWidth - buttonSize - paddingX;
                      setPosition(prev => ({ ...prev, x: snapX }));
                    }, 50);
                  }}
                  className="p-1 px-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded transition-colors text-[10px] font-bold font-mono border border-slate-850 bg-[#070b14]/60 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Chat Thread Messages Stream (65% Scaled Height & Text) */}
              <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5 bg-[#070B14]/45 scrollbar-thin select-text">
                {messages.map((m) => {
                  const isUser = m.role === 'user';
                  return (
                    <div 
                      key={m.id} 
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end gap-1.5`}
                    >
                      {!isUser && (
                        <div className="w-5.5 h-5.5 rounded-full bg-[#070A13] flex flex-col justify-between p-1 border border-slate-800 shrink-0 self-start mt-0.5 select-none overflow-hidden">
                          {/* Top Bar */}
                          <div className="h-[24%] w-full flex rounded-full overflow-hidden">
                            <div className="w-[18%] h-full bg-[#1b5bd2]"></div>
                            <div className="w-[82%] h-full bg-[#3bc8c8]"></div>
                          </div>
                          {/* Middle Bar */}
                          <div className="h-[24%] w-full flex rounded-full overflow-hidden">
                            <div className="w-[18%] h-full bg-[#3bc8c8]"></div>
                            <div className="w-[82%] h-full bg-[#ef7222]"></div>
                          </div>
                          {/* Bottom Bar */}
                          <div className="h-[24%] w-[64%] flex rounded-full overflow-hidden">
                            <div className="w-[32%] h-full bg-[#dfa435]"></div>
                            <div className="w-[68%] h-full bg-[#b22038]"></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-1 max-w-[85%]">
                        <div 
                          className={`rounded-xl p-2.5 text-[10px] inline-block leading-relaxed border relative shadow-md ${
                            isUser 
                              ? 'bg-indigo-600 border-indigo-500 text-white rounded-br-none' 
                              : 'bg-slate-900/80 border-slate-800 text-slate-200 rounded-bl-none space-y-1'
                          }`}
                        >
                          <div className="whitespace-pre-wrap font-sans">
                            {m.content.split('\n').map((line, idx) => {
                              let formatted = line;
                              
                              // Translate markdowns bold text **abc** inside scaled thread
                              const boldRegex = /\*\*(.*?)\*\*/g;
                              const matches = [...formatted.matchAll(boldRegex)];
                              
                              if (matches.length > 0) {
                                return (
                                  <div key={idx} className="mb-0.5 leading-relaxed">
                                    {formatted.split(/\*\*.*?\*\*/g).map((part, pIdx) => {
                                      const boldText = matches[pIdx]?.[1];
                                      return (
                                        <React.Fragment key={pIdx}>
                                          {part}
                                          {boldText && <strong className="text-white font-extrabold">{boldText}</strong>}
                                        </React.Fragment>
                                      );
                                    })}
                                  </div>
                                );
                              }

                              if (formatted.trim().startsWith('-')) {
                                return (
                                  <li key={idx} className="list-disc ml-3 text-slate-350 mt-0.5 font-medium leading-normal">
                                    {formatted.replace('-', '').trim()}
                                  </li>
                                );
                              }

                              if (formatted.includes('`')) {
                                return (
                                  <div key={idx} className="mb-0.5 inline-block">
                                    {formatted.split('`').map((cPart, cIdx) => (
                                      cIdx % 2 === 1 
                                        ? <code key={cIdx} className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono text-[9px] font-bold">{cPart}</code>
                                        : <span key={cIdx}>{cPart}</span>
                                    ))}
                                  </div>
                                );
                              }

                              return <p key={idx} className="mb-0.5 font-medium">{formatted}</p>;
                            })}
                          </div>

                          {m.executedCommands && m.executedCommands.length > 0 && (
                            <div className="mt-1.5 pt-1.5 border-t border-slate-800/85 font-mono text-[8.5px] space-y-0.5 text-emerald-450">
                              <span className="block font-bold text-slate-400 text-[8px] uppercase">⚡ Applied Actions:</span>
                              {m.executedCommands.map((log, lIdx) => (
                                <div key={lIdx} className="flex items-start gap-0.5 text-slate-350">
                                  <span className="text-emerald-400">✓</span>
                                  <span>{log}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-[8px] text-slate-500 font-mono block px-1 text-right leading-none">
                          {m.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Loading indicator scale down */}
                {isGenerating && (
                  <div className="flex justify-start items-center gap-1.5">
                    <div className="w-5.5 h-5.5 rounded-full bg-[#070A13] flex flex-col justify-between p-1 border border-slate-800 shrink-0 select-none overflow-hidden animate-spin">
                      <div className="h-[24%] w-full flex rounded-full overflow-hidden">
                        <div className="w-[18%] h-full bg-[#1b5bd2]"></div>
                        <div className="w-[82%] h-full bg-[#3bc8c8]"></div>
                      </div>
                      <div className="h-[24%] w-full flex rounded-full overflow-hidden">
                        <div className="w-[18%] h-full bg-[#3bc8c8]"></div>
                        <div className="w-[82%] h-full bg-[#ef7222]"></div>
                      </div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-850 rounded-xl rounded-bl-none p-2 px-3 inline-block">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block animate-bounce" />
                        <span className="text-[9px] text-slate-450 font-mono font-medium ml-1">Computing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions Chips Slider Row */}
              <div className="py-1 px-2 bg-[#0a0f1d] border-t border-slate-800/65 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0 select-none" id="chat_suggestions">
                {[
                  { label: '🪄 Plan CRM', prompt: 'Analyze this dataset with an EDA scan' },
                  { label: '🧹 Impute Mean', prompt: 'Fill missing values with mean' },
                  { label: '📊 Dashboard', prompt: 'Show the stakeholder dashboard' },
                  { label: '🔌 SQL Run', prompt: 'SELECT * FROM dataset WHERE tenure > 35' },
                  { label: '🔄 Reset', prompt: 'Reset dataset' }
                ].map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleSuggestedPromptClick(s.prompt); }}
                    className="px-2 py-1 rounded-full bg-slate-900 hover:bg-slate-850 text-[9px] text-slate-300 border border-slate-800 transition-colors cursor-pointer select-none font-medium whitespace-nowrap shrink-0"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Chat Send Input Form */}
              <form 
                onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); handleSendMessage(); }}
                className="p-1.5 bg-[#090D17] border-t border-slate-800/80 flex items-center gap-1.5 shrink-0 relative select-none"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="SQL query or command..."
                  disabled={isGenerating}
                  className="flex-1 bg-[#060A10]/95 text-[10.5px] h-8 text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl py-1 px-2.5 transition-colors disabled:opacity-40"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isGenerating}
                  className="w-8 h-8 items-center justify-center flex rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:text-slate-600 text-white transition-all cursor-pointer shadow-md shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
