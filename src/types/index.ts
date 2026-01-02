import { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect } from '@xyflow/react';

export type NodeType = 'oval' | 'rectangle' | 'diamond' | 'parallelogram';

export interface LogicNodeData extends Record<string, unknown> {
  label: string;
  code?: string;
  type: NodeType;
}

export type LogicNode = Node<LogicNodeData>;

export interface LogicState {
  nodes: LogicNode[];
  edges: Edge[];
  code: string;
  isSyncing: boolean;
  isTracing: boolean;
  currentStep: number;
  activeNodeId: string | null;
  activeEdgeId: string | null;
  bugNodeIds: string[];
  complexityData: { time: string; space: string } | null;
  lastModelUsed: string | null;
  onNodesChange: OnNodesChange<LogicNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: LogicNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeData: (nodeId: string, data: Partial<LogicNodeData>) => void;
  setCode: (code: string) => void;
  setIsSyncing: (isSyncing: boolean) => void;
  setIsTracing: (isTracing: boolean) => void;
  nextStep: () => void;
  setActiveNodeId: (id: string | null) => void;
  setBugNodeIds: (ids: string[]) => void;
  setComplexityData: (data: { time: string; space: string } | null) => void;
  setLastModelUsed: (model: string | null) => void;
  runAnalysis: () => Promise<void>;
}
