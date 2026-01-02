import React, { memo, useState } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogicNodeData } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLogicStore } from '@/store/useLogicStore';
import { HelpCircle, Sparkles, Loader2 } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AppNode = Node<LogicNodeData>;

const NodeWrapper = ({ children, selected, active, hasBug, className, data }: { children: React.ReactNode; selected?: boolean; active?: boolean; hasBug?: boolean; className?: string; data: LogicNodeData }) => {
  const [showExplainer, setShowExplainer] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExplain = async (e: React.MouseEvent) => {
    e.preventDefault();
    setShowExplainer(true);
    if (explanation) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeLabel: data.label, nodeType: data.type }),
      });
      const result = await res.json();
      setExplanation(result.explanation);
    } catch (err) {
      setExplanation("Failed to load explanation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group relative" onContextMenu={handleExplain}>
      <motion.div
        layout
        initial={{ scale: 0.8, opacity: 0, y: 10 }}
        animate={{ 
          scale: active ? 1.05 : 1, 
          opacity: 1,
          y: 0,
          boxShadow: active 
            ? '0 0 30px rgba(34, 197, 94, 0.8), inset 0 0 10px rgba(34, 197, 94, 0.3)' 
            : hasBug 
              ? '0 0 30px rgba(239, 68, 68, 0.8), inset 0 0 10px rgba(239, 68, 68, 0.3)' 
              : '0 10px 30px -5px rgb(0 0 0 / 0.5), inset 0 0 5px rgba(255,255,255,0.05)'
        }}
        className={cn(
          'relative px-4 py-2 shadow-lg transition-all duration-300 backdrop-blur-2xl border text-slate-100 min-w-[140px] text-center cursor-help',
          selected ? 'ring-4 ring-white/30 border-white/50' : '',
          active && 'border-green-400 border-2 z-50',
          hasBug && 'border-red-400 border-2 z-50',
          className
        )}
      >
        {children}
        
        {/* Concept Explainer Indicator */}
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
          <div className="bg-blue-600 p-1 rounded-full text-white shadow-lg shadow-blue-900/40">
            <HelpCircle size={10} />
          </div>
        </div>
      </motion.div>

      {/* Explainer Popup */}
      <AnimatePresence>
        {showExplainer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute z-[100] top-full mt-2 left-1/2 -translate-x-1/2 w-64 p-4 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl text-left pointer-events-auto"
            onClick={() => setShowExplainer(false)}
          >
            <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold text-[10px] uppercase tracking-tighter">
              <Sparkles size={12} /> AI Concept Explainer
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={16} className="animate-spin text-slate-500" />
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed font-serif italic">
                "{explanation}"
              </p>
            )}
            <div className="mt-2 text-[8px] text-slate-500 text-center">Click to close</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const OvalNode = memo((props: NodeProps<AppNode>) => {
  const { activeNodeId, bugNodeIds } = useLogicStore();
  const active = activeNodeId === props.id;
  const hasBug = bugNodeIds.includes(props.id);
  
  return (
    <NodeWrapper 
      selected={props.selected} 
      active={active} 
      hasBug={hasBug} 
      className="rounded-full bg-blue-950/80 border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
      data={props.data}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-400 border-2 border-slate-900 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
      <div className="font-bold text-[11px] sm:text-xs uppercase tracking-[0.15em] py-1 text-blue-50 drop-shadow-sm truncate max-w-[150px]">{props.data.label}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-400 border-2 border-slate-900 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
    </NodeWrapper>
  );
});

export const RectangleNode = memo((props: NodeProps<AppNode>) => {
  const { activeNodeId, bugNodeIds } = useLogicStore();
  const active = activeNodeId === props.id;
  const hasBug = bugNodeIds.includes(props.id);

  return (
    <NodeWrapper 
      selected={props.selected} 
      active={active} 
      hasBug={hasBug} 
      className="rounded-md bg-slate-900/90 border-slate-500/50 shadow-[0_0_15px_rgba(148,163,184,0.1)] min-w-[200px]" 
      data={props.data}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-400 border-2 border-slate-900 shadow-[0_0_10px_rgba(148,163,184,0.8)]" />
      <div className="text-[11px] sm:text-xs py-2 font-semibold text-slate-50 tracking-tight leading-relaxed whitespace-pre-wrap text-left px-2">{props.data.label}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-400 border-2 border-slate-900 shadow-[0_0_10px_rgba(148,163,184,0.8)]" />
    </NodeWrapper>
  );
});

export const DiamondNode = memo((props: NodeProps<AppNode>) => {
  const { activeNodeId, bugNodeIds } = useLogicStore();
  const active = activeNodeId === props.id;
  const hasBug = bugNodeIds.includes(props.id);

  return (
    <NodeWrapper 
      selected={props.selected} 
      active={active} 
      hasBug={hasBug} 
      className="w-32 h-32 flex items-center justify-center clip-diamond bg-amber-950/80 border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.2)]" 
      data={props.data}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-400 border-2 border-slate-900 shadow-[0_0_10px_rgba(251,191,36,0.8)] !top-0" />
      <div className="text-[10px] font-black text-amber-50 max-w-[70px] leading-[1.1] uppercase text-center drop-shadow-md break-words">{props.data.label}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-amber-400 border-2 border-slate-900 shadow-[0_0_10px_rgba(251,191,36,0.8)] !bottom-0" />
      <Handle type="source" position={Position.Right} id="right" className="w-3 h-3 bg-amber-400 border-2 border-slate-900 shadow-[0_0_10px_rgba(251,191,36,0.8)] !right-0" />
      <Handle type="source" position={Position.Left} id="left" className="w-3 h-3 bg-amber-400 border-2 border-slate-900 shadow-[0_0_10px_rgba(251,191,36,0.8)] !left-0" />
    </NodeWrapper>
  );
});

export const ParallelogramNode = memo((props: NodeProps<AppNode>) => {
  const { activeNodeId, bugNodeIds } = useLogicStore();
  const active = activeNodeId === props.id;
  const hasBug = bugNodeIds.includes(props.id);

  return (
    <NodeWrapper 
      selected={props.selected} 
      active={active} 
      hasBug={hasBug} 
      className="clip-parallelogram bg-emerald-950/80 border-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.2)] min-w-[180px]" 
      data={props.data}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-emerald-400 border-2 border-slate-900 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
      <div className="text-xs sm:text-sm py-2 px-8 font-black italic text-emerald-50 tracking-tight drop-shadow-sm">{props.data.label}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-400 border-2 border-slate-900 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
    </NodeWrapper>
  );
});

OvalNode.displayName = 'OvalNode';
RectangleNode.displayName = 'RectangleNode';
DiamondNode.displayName = 'DiamondNode';
ParallelogramNode.displayName = 'ParallelogramNode';
