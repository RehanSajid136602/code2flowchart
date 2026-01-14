import { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect } from '@xyflow/react';

export type NodeType = 'oval' | 'rectangle' | 'diamond' | 'parallelogram';

export interface LogicNodeData extends Record<string, unknown> {
  label: string;
  code?: string;
  type: NodeType;
}

export type LogicNode = Node<LogicNodeData>;

export interface AnalysisSuggestion {
  nodeId?: string;
  title: string;
  issue: string;
  suggestion: string;
  fix?: string;
}

export interface AnalysisDetails {
  analysis: string;
  suggestions: AnalysisSuggestion[];
}

export interface Project {
  id: string;
  name: string;
  code: string;
  nodes: LogicNode[];
  edges: Edge[];
  updatedAt: number;
  isDeleted?: boolean;
  deletedAt?: number;
  shareId?: string;
  isPublic?: boolean;
  sharedBy?: string;
  sharedAt?: number;
}

export interface ProjectHistory {
  id: string;
  projectId: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'version';
  changedBy: string;
  changedAt: number;
  previousValues?: Partial<Project>;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  version: number;
  name: string;
  code: string;
  nodes: LogicNode[];
  edges: Edge[];
  createdAt: number;
  createdBy: string;
  description?: string;
}

export interface CreateVersionInput {
  description?: string;
}

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
  analysisDetails: AnalysisDetails | null;
  lastModelUsed: string | null;
  currentProjectId: string | null;
  currentProjectName: string | null;
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
  setAnalysisDetails: (details: AnalysisDetails | null) => void;
  setLastModelUsed: (model: string | null) => void;
  setCurrentProjectId: (id: string | null) => void;
  setCurrentProjectName: (name: string | null) => void;
  loadProject: (project: Project) => void;
  applyFix: (fix: string) => void;
  runAnalysis: () => Promise<void>;
}
