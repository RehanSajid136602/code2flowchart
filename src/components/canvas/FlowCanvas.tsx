'use client';

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useLogicStore } from '@/store/useLogicStore';
import { OvalNode, RectangleNode, DiamondNode, ParallelogramNode } from './CustomNodes';
import { Play, SkipForward, RotateCcw, Bug, FileDown, BrainCircuit, Activity } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { playEffect } from '@/hooks/useSoundEffect';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const nodeTypes = {
  oval: OvalNode,
  rectangle: RectangleNode,
  diamond: DiamondNode,
  parallelogram: ParallelogramNode,
};

export default function FlowCanvas() {
  const [isHudMinimized, setIsHudMinimized] = React.useState(false);
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    isTracing,
    setIsTracing,
    nextStep,
    runAnalysis,
    complexityData,
    bugNodeIds,
    activeNodeId,
    activeEdgeId
  } = useLogicStore();

  const defaultEdgeOptions = useMemo(() => ({
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2, filter: 'drop-shadow(0 0 5px rgba(59, 130, 246, 0.5))' },
  }), []);

  const edgesWithHighlight = useMemo(() => {
    return edges.map((edge) => {
      const isActive = edge.id === activeEdgeId;
      return {
        ...edge,
        animated: isActive || edge.animated !== false,
        style: {
          ...edge.style,
          stroke: isActive ? '#10b981' : (edge.style?.stroke || '#3b82f6'),
          strokeWidth: isActive ? 4 : (edge.style?.strokeWidth || 2),
          filter: isActive 
            ? 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.8))' 
            : 'drop-shadow(0 0 5px rgba(59, 130, 246, 0.5))',
        },
      };
    });
  }, [edges, activeEdgeId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput = activeElement?.tagName === 'INPUT' || 
                      activeElement?.tagName === 'TEXTAREA' || 
                      activeElement?.classList.contains('monaco-editor') ||
                      (activeElement as HTMLElement)?.isContentEditable;

      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        runAnalysis();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [runAnalysis]);

  const handleExport = async () => {
    const element = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!element) return;

    try {
      playEffect('sync');
      const dataUrl = await toPng(element, {
        backgroundColor: '#0a0a0a',
        quality: 1,
        pixelRatio: 2,
        filter: (node) => {
          const exclusionClasses = ['monaco-editor', 'monaco-aria-container'];
          if (node instanceof HTMLElement) {
            return !exclusionClasses.some(cls => node.classList.contains(cls));
          }
          return true;
        },
      });
      
      const link = document.createElement('a');
      link.download = `logicflow-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      playEffect('export');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="w-full h-full bg-[#0a0a0a] relative overflow-hidden">
      {/* BACKGROUND DECORATION - Absolute position to avoid overlap issues */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edgesWithHighlight}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.5 }}
        minZoom={0.1}
        maxZoom={2}
        className="z-10 bg-dot-white/[0.05]"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#333" />
        <Controls className="bg-slate-900 border-slate-700 fill-slate-100" />
        <MiniMap 
          nodeStrokeColor={(n) => {
            if (n.type === 'oval') return '#60a5fa';
            if (n.type === 'rectangle') return '#94a3b8';
            if (n.type === 'diamond') return '#fbbf24';
            if (n.type === 'parallelogram') return '#34d399';
            return '#eee';
          }}
          nodeColor={(n) => '#1e293b'}
          className="bg-slate-900 border border-slate-700"
          maskColor="rgba(0, 0, 0, 0.1)"
        />

        {/* TOP RIGHT CONTROLS PANEL */}
        <Panel position="top-right" className="bg-slate-900/80 backdrop-blur-md p-3 border border-slate-700 rounded-xl shadow-2xl flex flex-col gap-3 z-50">
          <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
            <button 
              onClick={() => setIsTracing(!isTracing)}
              className={cn(
                "p-2 rounded-lg transition-all",
                isTracing ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
              )}
            >
              {isTracing ? <RotateCcw size={18} /> : <Play size={18} />}
            </button>
            <button 
              onClick={nextStep}
              disabled={!isTracing}
              className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-all"
            >
              <SkipForward size={18} />
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={runAnalysis}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-amber-600/20 text-amber-400 border border-amber-600/30 hover:bg-amber-600/30 rounded-lg transition-all"
            >
              <Bug size={14} /> Bug Spotter
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all shadow-lg"
            >
              <FileDown size={14} /> Export
            </button>
          </div>
        </Panel>
      </ReactFlow>

      {/* COMPLEXITY HUD - Fixed position OUTSIDE ReactFlow viewport to avoid overlaps */}
      {complexityData && (
        <div className="absolute bottom-6 left-6 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={cn(
            "bg-slate-950/90 backdrop-blur-xl border border-blue-500/40 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all duration-500 ease-in-out overflow-hidden",
            isHudMinimized ? "w-[48px] h-[48px] p-0 flex items-center justify-center rounded-full" : "min-w-[280px] p-5"
          )}>
            {isHudMinimized ? (
              <button 
                onClick={() => setIsHudMinimized(false)}
                className="w-full h-full flex items-center justify-center text-blue-400 hover:text-blue-200 transition-colors"
              >
                <BrainCircuit size={20} className="animate-pulse" />
              </button>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
                    <BrainCircuit size={16} className="text-blue-500" /> Engine Analysis
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 mr-2">
                      <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                      <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse delay-75" />
                    </div>
                    <button 
                      onClick={() => setIsHudMinimized(true)}
                      className="p-1 hover:bg-slate-800 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <RotateCcw size={12} className="rotate-45" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 relative">
                  <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-800/50" />
                  
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-500 uppercase font-bold flex items-center gap-1">
                       Time Complexity
                    </p>
                    <div className="flex items-baseline gap-2">
                       <p className="font-mono text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                         {complexityData.time}
                       </p>
                       <Activity size={12} className="text-emerald-900" />
                    </div>
                  </div>

                  <div className="space-y-1 pl-4">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">
                      Space Complexity
                    </p>
                    <div className="flex items-baseline gap-2">
                       <p className="font-mono text-2xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                         {complexityData.space}
                       </p>
                       <Activity size={12} className="text-amber-900" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center">
                  <p className="text-[8px] text-slate-500 italic">Optimized for Gemini 2.5 Swarm</p>
                  <div className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[8px] text-blue-400 font-bold uppercase">Active</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}