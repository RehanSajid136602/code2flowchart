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
import { LogicState, LogicNode } from '@/types';
import { playEffect } from '@/hooks/useSoundEffect';

const initialNodes: LogicNode[] = [
  {
    id: '1',
    type: 'oval',
    data: { label: 'Start', type: 'oval' },
    position: { x: 250, y: 0 },
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
  lastModelUsed: null,

  onNodesChange: (changes: NodeChange<LogicNode>[]) => {
    // Immediate state update but with optimized array handling
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
      activeEdgeId: null
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
      // End of flow
      set({ isTracing: false, activeNodeId: null, activeEdgeId: null });
      playEffect('stop');
      return;
    }

    // Smart Branching: If multiple edges (Decision), prioritize "True/Yes"
    let targetEdge = outgoingEdges[0];
    if (outgoingEdges.length > 1) {
      const trueEdge = outgoingEdges.find(e => 
        e.label?.toLowerCase().includes('true') || 
        e.label?.toLowerCase().includes('yes')
      );
      if (trueEdge) targetEdge = trueEdge;
    }

    set({ 
      activeNodeId: targetEdge.target, 
      activeEdgeId: targetEdge.id,
      currentStep: get().currentStep + 1 
    });
    
    playEffect('step');
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

  setLastModelUsed: (lastModelUsed: string | null) => {
    set({ lastModelUsed });
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
          complexityData: data.complexity || null 
        });
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  },
}));
