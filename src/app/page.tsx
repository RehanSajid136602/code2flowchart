'use client';

import React, { useState, useEffect } from 'react';
import CodeEditor from '@/components/editor/CodeEditor';
import FlowCanvas from '@/components/canvas/FlowCanvas';
import { Layers, Play, Share2, Zap, RefreshCw, Bug, Info, X } from 'lucide-react';
import { useSyncLogic } from '@/hooks/useSyncLogic';
import { useLogicStore } from '@/store/useLogicStore';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import LanguageSelector from '@/components/LanguageSelector';

export default function Home() {
  useSyncLogic();
  const { playSound } = useSoundEffect();
  const { 
    isSyncing, nodes, edges, setCode, code,
    activeNodeId, setActiveNodeId,
    bugNodeIds, setBugNodeIds,
    complexityData, setComplexityData,
    setIsSyncing, setNodes, setEdges,
    runAnalysis
  } = useLogicStore();

  useEffect(() => {
    if (isSyncing) playSound('sync');
  }, [isSyncing]);

  useEffect(() => {
    if (bugNodeIds.length > 0) playSound('bug');
  }, [bugNodeIds]);
  
  const [targetLang, setTargetLang] = useState('python');
  const [isConverting, setIsConverting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const handleConvert = async () => {
    setIsConverting(true);
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, language: targetLang }),
      });
      if (response.ok) {
        const data = await response.json();
        setCode(data.code);
      }
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await runAnalysis();
    setIsAnalyzing(false);
  };

  const handleBuildFlowchart = async () => {
    if (!code || code.trim().length < 5) {
      alert("Please enter some logic in the editor first.");
      return;
    }
    
    setIsSyncing(true);
    try {
      const response = await fetch('/api/diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setNodes(data.nodes);
        setEdges(data.edges);
        playSound('sync');
      } else {
        const err = await response.json();
        console.error('API Error:', err);
        alert(`Build failed: ${err.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert('Failed to connect to the AI engine.');
    } finally {
      setIsSyncing(false);
    }
  };


  const handlePlayTracer = async () => {
    if (nodes.length === 0) return;
    
    const { setIsTracing, nextStep, isTracing } = useLogicStore.getState();
    
    // Reset if already tracing
    if (isTracing) {
      setIsTracing(false);
      await new Promise(r => setTimeout(r, 100));
    }

    setIsTracing(true);
    
    // Auto-step through the logic
    const autoStep = async () => {
      const state = useLogicStore.getState();
      if (!state.isTracing || !state.activeNodeId) return;

      // Find if there are outgoing edges
      const outgoing = state.edges.filter(e => e.source === state.activeNodeId);
      if (outgoing.length === 0) {
        setIsTracing(false);
        return;
      }

      await new Promise(r => setTimeout(r, 1000));
      nextStep();
      autoStep();
    };

    autoStep();
  };

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-[#050505]">
      {/* Navbar */}
      <header className="h-14 border-b border-slate-800 glass z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            LogicFlow AI
          </span>
        </div>
        
        <nav className="flex items-center gap-6">
          <LanguageSelector 
            selectedId={targetLang}
            onSelect={(id) => setTargetLang(id)}
          />

          <button 
            onClick={handleConvert}
            disabled={isConverting}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            {isConverting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Convert
          </button>

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? <Bug className="w-4 h-4 animate-pulse text-red-400" /> : <Bug className="w-4 h-4 text-red-400" />}
            Spot Bugs
          </button>
          
          <div className="h-4 w-px bg-slate-800" />
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBuildFlowchart}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-full text-sm font-medium text-white transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
              {isSyncing ? 'Building...' : 'Build Flowchart'}
            </button>
            <button 
              onClick={handlePlayTracer}
              className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-500 rounded-full text-sm font-medium text-white transition-all shadow-lg shadow-green-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Trace Logic
            </button>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Pane: Code Editor */}
        <div className="w-[40%] min-w-[300px] border-r border-slate-800">
          <CodeEditor />
        </div>

        {/* Right Pane: Flowchart Canvas */}
        <div className="flex-1 relative">
          <FlowCanvas />
        </div>
      </div>

      {/* Footer / Status Bar */}
      <footer className="h-6 border-t border-slate-800 bg-slate-950 flex items-center px-4 justify-between text-[10px] text-slate-500 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            Engine: {useLogicStore((s) => s.lastModelUsed) || 'Gemini 2.5 Swarm'}
          </span>
          <span>Status: {isSyncing ? 'Syncing Logic...' : 'Connected'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-red-400">Bugs: {useLogicStore((s) => s.bugNodeIds.length)}</span>
          <span className="uppercase">{targetLang}</span>
          <span>Nodes: {useLogicStore((s) => s.nodes.length)} | Edges: {useLogicStore((s) => s.edges.length)}</span>
        </div>
      </footer>
    </main>
  );
}