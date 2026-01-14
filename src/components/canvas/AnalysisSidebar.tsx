'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BrainCircuit,
    ChevronRight,
    ChevronLeft,
    Bug,
    Wand2,
    Info,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { useLogicStore } from '@/store/useLogicStore';
import { useDialogStore } from '@/store/useDialogStore';
import { AnalysisSuggestion } from '@/types';

export default function AnalysisSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const { analysisDetails, applyFix, bugNodeIds } = useLogicStore();
    const { showDialog } = useDialogStore();

    if (!analysisDetails) return null;

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-[100] bg-slate-900 border border-slate-700 p-2 rounded-l-xl shadow-2xl transition-all ${isOpen ? 'mr-[320px]' : 'mr-0'
                    }`}
            >
                {isOpen ? <ChevronRight size={20} className="text-slate-400" /> : <ChevronLeft size={20} className="text-blue-500 animate-pulse" />}
            </button>

            {/* Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: 320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 320, opacity: 0 }}
                        className="absolute right-0 top-0 bottom-0 w-[320px] bg-slate-950/90 backdrop-blur-xl border-l border-slate-800 z-[90] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >
                        <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-blue-600/5">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                                <BrainCircuit className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">AI Analysis</h2>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Intelligent Insights</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                            {/* Summary Section */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <Info size={14} className="text-blue-500" /> Executive Summary
                                </div>
                                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed shadow-sm">
                                    {analysisDetails.analysis}
                                </div>
                            </section>

                            {/* Suggestions Section */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <Bug size={14} className="text-red-500" /> {analysisDetails.suggestions.length} Logical Issues
                                </div>

                                <div className="space-y-3">
                                    {analysisDetails.suggestions.map((s, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className={`p-4 rounded-xl border transition-all ${bugNodeIds.includes(s.nodeId || '')
                                                ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                                                : 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                {bugNodeIds.includes(s.nodeId || '') ? (
                                                    <AlertCircle size={14} className="text-red-500" />
                                                ) : (
                                                    <CheckCircle2 size={14} className="text-amber-500" />
                                                )}
                                                <h4 className="text-xs font-bold text-slate-100">{s.title}</h4>
                                            </div>

                                            <p className="text-[11px] text-slate-400 mb-3 leading-normal">
                                                {s.issue}
                                            </p>

                                            <div className="p-2.5 bg-black/40 rounded-lg mb-4">
                                                <p className="text-[10px] text-blue-400 font-medium italic">
                                                &quot; {s.suggestion} &quot;
                                                </p>
                                            </div>

                                            {s.fix && (
                                                <button
                                                    onClick={() => showDialog({
                                                        type: 'confirm',
                                                        title: 'Apply Modification?',
                                                        message: 'This will append the suggested logic to your current code. You can undo this manually if needed.',
                                                        confirmLabel: 'Apply Now',
                                                        onConfirm: () => applyFix(s.fix!)
                                                    })}
                                                    className="w-full py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 border border-blue-600/30"
                                                >
                                                    <Wand2 size={12} /> Apply Quick Fix
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="p-4 border-t border-slate-800 bg-slate-900/20">
                            <div className="flex items-center justify-between opacity-50">
                                <span className="text-[9px] text-slate-500 font-mono">POWERED BY LOGICFLOW AI</span>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-75" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
