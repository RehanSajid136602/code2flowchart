'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import CodeEditor from '@/components/editor/CodeEditor';
import FlowCanvas from '@/components/canvas/FlowCanvas';
import { Play, Share2, Zap, RefreshCw, Bug, Save, History, BookOpen, Info } from 'lucide-react';
import { useSyncLogic } from '@/hooks/useSyncLogic';
import { useLogicStore } from '@/store/useLogicStore';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import LanguageSelector from '@/components/LanguageSelector';
import EmailVerificationBanner from '@/components/auth/EmailVerificationBanner';
import UserMenu from '@/components/auth/UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { useDialogStore } from '@/store/useDialogStore';
import { saveProject } from '@/lib/projectActions';
import RefineModal from '@/components/RefineModal';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const { playSound } = useSoundEffect();
  const {
    isSyncing,
    nodes,
    edges,
    setCode,
    code,
    bugNodeIds,
    setIsSyncing,
    setNodes,
    setEdges,
    runAnalysis,
    lastModelUsed,
    setLastModelUsed,
    currentProjectId,
    setCurrentProjectId,
    currentProjectName,
    setCurrentProjectName,
  } = useLogicStore();
  const { showDialog } = useDialogStore();

  // Redirect unauth users to /login
  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent('/');
      router.replace(`/login?next=${next}`);
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (isSyncing) playSound('sync');
  }, [isSyncing]);

  useEffect(() => {
    if (bugNodeIds.length > 0) playSound('bug');
  }, [bugNodeIds]);

  // Hoisted store-derived values to avoid inline hook calls in JSX
  const bugCount = bugNodeIds.length;
  const nodeCount = nodes.length;
  const edgeCount = edges.length;

  const [targetLang, setTargetLang] = useState('python');
  const [isConverting, setIsConverting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefineOpen, setIsRefineOpen] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    const executeSave = async (name: string) => {
      setIsSaving(true);
      try {
        const projectId = currentProjectId || crypto.randomUUID();
        await saveProject(user.uid, {
          id: projectId,
          name: name,
          code,
          nodes,
          edges,
        });
        setCurrentProjectId(projectId);
        setCurrentProjectName(name);
        playSound('sync');

        // Success dialog will replace the naming dialog
        showDialog({
          type: 'success',
          title: 'Project Saved',
          message: `"${name}" has been successfully synchronized to your cloud workspace.`,
        });
      } catch (error) {
        console.error('Save failed:', error);
        showDialog({
          type: 'error',
          title: 'Save Failed',
          message: 'An unexpected error occurred while preserving your project. Please verify your connection.',
        });
      } finally {
        setIsSaving(false);
      }
    };

    if (!currentProjectId) {
      showDialog({
        type: 'confirm',
        title: 'Name Your Project',
        message: 'Please provide a descriptive title for this logic workflow to save it to your dashboard.',
        showInput: true,
        confirmLabel: 'Save Project',
        onConfirm: async (name) => {
          if (name && name.trim()) {
            useDialogStore.getState().setIsLoading(true);
            await executeSave(name.trim());
          }
        },
      });
    } else {
      executeSave(currentProjectName || 'Untitled Project');
    }
  };

  const handleConvert = async (options?: { codingStyle: string; refinementPrompt: string }) => {
    setIsConverting(true);
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes,
          edges,
          language: targetLang,
          codingStyle: options?.codingStyle,
          refinementPrompt: options?.refinementPrompt
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setCode(data.code);
        setIsRefineOpen(false);
        playSound('sync');
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
      showDialog({
        type: 'warning',
        title: 'Insufficient Logic',
        message: 'Please define your algorithm or architectural logic in the editor before generating a visualization.',
      });
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
        setLastModelUsed(data.modelUsed);
        playSound('sync');
      } else {
        const err = await response.json();
        console.error('API Error:', err);
        showDialog({
          type: 'error',
          title: 'Architectural Error',
          message: err.error || 'The AI engine encountered a logical contradiction while parsing your code.',
        });
      }
    } catch (error) {
      console.error('Network Error:', error);
      showDialog({
        type: 'error',
        title: 'Connection Interrupted',
        message: 'LogicFlow could not reach the high-performance AI cluster. Please check your network status.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePlayTracer = async () => {
    if (nodes.length === 0) return;

    const { setIsTracing, nextStep, isTracing } = useLogicStore.getState();

    if (isTracing) {
      setIsTracing(false);
      await new Promise((r) => setTimeout(r, 100));
    }

    setIsTracing(true);

    const autoStep = async () => {
      const state = useLogicStore.getState();
      if (!state.isTracing || !state.activeNodeId) return;

      const outgoing = state.edges.filter((e) => e.source === state.activeNodeId);
      if (outgoing.length === 0) {
        setIsTracing(false);
        return;
      }

      await new Promise((r) => setTimeout(r, 1000));
      nextStep();
      autoStep();
    };

    autoStep();
  };

  // While redirecting, show nothing (or a minimal loader)
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-[#050505]">
      <EmailVerificationBanner />

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
          <LanguageSelector selectedId={targetLang} onSelect={(id) => setTargetLang(id)} />

          <button
            onClick={() => router.push('/history')}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <History className="w-4 h-4" />
            History
          </button>

          <button
            onClick={() => router.push('/guide')}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Guide
          </button>

          <button
            onClick={() => router.push('/about')}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <Info className="w-4 h-4" />
            About
          </button>

          <button
            onClick={() => setIsRefineOpen(true)}
            disabled={isConverting}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            {isConverting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Convert
          </button>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? (
              <Bug className="w-4 h-4 animate-pulse text-red-400" />
            ) : (
              <Bug className="w-4 h-4 text-red-400" />
            )}
            Spot Bugs
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || nodes.length === 0}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4 text-blue-400" />
            )}
            Save
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <button
            onClick={handleBuildFlowchart}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-full text-sm font-medium text-white transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 fill-current" />
            )}
            {isSyncing ? 'Building...' : 'Build Flowchart'}
          </button>
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <Share2 className="w-5 h-5" />
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <UserMenu />
        </nav>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="w-[40%] min-w-[300px] border-r border-slate-800">
          <CodeEditor />
        </div>
        <div className="flex-1 relative">
          <FlowCanvas />
        </div>
      </div>

      <footer className="h-6 border-t border-slate-800 bg-slate-950 flex items-center px-4 justify-between text-[10px] text-slate-500 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div
              className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                }`}
            />
            Engine: {lastModelUsed || 'Gemini 2.5 Swarm'}
          </span>
          <span>Status: {isSyncing ? 'Syncing Logic...' : 'Connected'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-red-400">Bugs: {bugCount}</span>
          <span className="uppercase">{targetLang}</span>
          <span>
            Nodes: {nodeCount} | Edges: {edgeCount}
          </span>
        </div>
      </footer>
      <button
        onClick={handlePlayTracer}
        className="fixed bottom-6 right-6 p-4 bg-slate-900 border border-slate-800 rounded-full shadow-2xl hover:bg-slate-800 transition-all z-50 text-blue-500 hover:text-blue-400 group"
      >
        <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
      </button>

      <RefineModal
        isOpen={isRefineOpen}
        onClose={() => setIsRefineOpen(false)}
        onConvert={handleConvert}
        isConverting={isConverting}
      />
    </main>
  );
}
