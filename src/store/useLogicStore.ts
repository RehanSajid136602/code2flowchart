import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  Edge,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import { LogicState, LogicNode, Project, AnalysisDetails } from '@/types';
import { playEffect } from '@/hooks/useSoundEffect';

const initialNodes: LogicNode[] = [
  {
    id: '1',
    type: 'oval',
    data: { label: '🛫 Start', type: 'oval' },
    position: { x: 500, y: 0 },
  },
];

const initialEdges: Edge[] = [];

export const useLogicStore = create<LogicState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  code: '// Write your logic here\n\nfunction main() {\n  console.log("Hello LogicFlow!");\n}',
  isSyncing: false,
  isTracing: false,
  currentStep: 0,
  activeNodeId: null,
  activeEdgeId: null,
  bugNodeIds: [],
  complexityData: null,
  analysisDetails: null,
  lastModelUsed: null,
  currentProjectId: null,
  currentProjectName: null,

  onNodesChange: (changes: NodeChange<LogicNode>[]) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  setNodes: (nodes: LogicNode[]) => {
    set({ nodes });
  },

  setEdges: (edges: Edge[]) => {
    set({ edges });
  },

  updateNodeData: (nodeId: string, data: Partial<LogicNode['data']>) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
    });
  },

  setCode: (code: string) => {
    set({ code });
  },

  setIsSyncing: (isSyncing: boolean) => {
    set({ isSyncing });
  },

  setIsTracing: (isTracing: boolean) => {
    const { nodes } = get();
    const startNode = nodes[0]?.id || null;
    set({
      isTracing,
      currentStep: 0,
      activeNodeId: isTracing ? startNode : null,
      activeEdgeId: null,
    });

    playEffect(isTracing ? 'step' : 'stop');
  },

  nextStep: () => {
    const { nodes, edges, activeNodeId, isTracing } = get();
    if (!isTracing) return;

    if (!activeNodeId) {
      const firstNode = nodes[0]?.id;
      set({ activeNodeId: firstNode, currentStep: 0, activeEdgeId: null });
      playEffect('step');
      return;
    }

    // Find all outgoing edges
    const outgoingEdges = edges.filter((e) => e.source === activeNodeId);

    if (outgoingEdges.length === 0) {
      // Flow already naturally ended in the previous step's check
      set({ isTracing: false, activeNodeId: null, activeEdgeId: null });
      return;
    }

    // Smart Branching: If multiple edges (Decision), follow ONLY the single correct path
    let targetEdge = outgoingEdges[0];
    if (outgoingEdges.length > 1) {
      // Prioritize "True", "Yes", or labeled success paths
      const trueEdge = outgoingEdges.find((e) => {
        // Edge.label can be ReactNode/unknown in @xyflow/react typings; coerce safely.
        const label = String(e.label ?? '').toLowerCase();
        return (
          label.includes('true') ||
          label.includes('yes') ||
          label.includes('success')
        );
      });

      targetEdge = trueEdge || outgoingEdges[0];
    }

    // Set ONLY the target node and edge as active
    set({
      activeNodeId: targetEdge.target,
      activeEdgeId: targetEdge.id,
      currentStep: get().currentStep + 1,
    });

    // Smart Sound: If we reached the end node, play the 'stop' (success) sound immediately
    const nextOutgoing = edges.filter((e) => e.source === targetEdge.target);
    if (nextOutgoing.length === 0) {
      playEffect('stop');
    } else {
      playEffect('step');
    }
  },

  setActiveNodeId: (activeNodeId: string | null) => {
    set({ activeNodeId });
  },

  setBugNodeIds: (bugNodeIds: string[]) => {
    set({ bugNodeIds });
  },

  setComplexityData: (complexityData: { time: string; space: string } | null) => {
    set({ complexityData });
  },

  setAnalysisDetails: (analysisDetails: AnalysisDetails | null) => {
    set({ analysisDetails });
  },

  setLastModelUsed: (lastModelUsed: string | null) => {
    set({ lastModelUsed });
  },

  setCurrentProjectId: (currentProjectId: string | null) => {
    set({ currentProjectId });
  },

  setCurrentProjectName: (currentProjectName: string | null) => {
    set({ currentProjectName });
  },

  loadProject: (project: Project) => {
    set({
      currentProjectId: project.id,
      currentProjectName: project.name,
      code: project.code,
      nodes: project.nodes,
      edges: project.edges,
      bugNodeIds: [],
      complexityData: null,
      analysisDetails: null,
    });
  },

  applyFix: (fix: string) => {
    const { code } = get();
    // Intelligent insertion or append based on context could be complex.
    // For now, we append the fix with a comment, or if it looks like a full replacement, we could handle it.
    // Simplifying: AI provides a "fix" snippet, we append it for the user to integrate or replace parts.
    set({ code: code + "\n\n// Suggested Fix:\n" + fix });
  },

  runAnalysis: async () => {
    const { nodes, edges } = get();
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
      if (response.ok) {
        const data = await response.json();
        set({
          bugNodeIds: data.bugNodeIds || [],
          complexityData: data.complexity || null,
          analysisDetails: {
            analysis: data.analysis,
            suggestions: data.suggestions || [],
          },
        });
      } else {
        const err = await response.json().catch(() => ({}));
        console.error('Analysis failed with status:', response.status, err);
      }
    } catch (error) {
      console.error('Analysis network error:', error);
    }
  },
}));
