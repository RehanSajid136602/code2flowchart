'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, X, Sparkles, Code2, Zap, Layout } from 'lucide-react';

interface RefineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConvert: (options: { codingStyle: string; refinementPrompt: string }) => void;
    isConverting: boolean;
}

const STYLES = [
    { id: 'standard', name: 'Standard / Idiomatic', description: 'Clean, well-structured code following language best practices.', icon: <Code2 size={16} /> },
    { id: 'functional', name: 'Functional', description: 'Emphasizes immutability and pure functions where applicable.', icon: <Zap size={16} /> },
    { id: 'object-oriented', name: 'Object-Oriented', description: 'Organizes logic into classes and objects.', icon: <Layout size={16} /> },
    { id: 'minimalist', name: 'Minimalist / Performance', description: 'Compacted logic optimized for execution speed.', icon: <Sparkles size={16} /> },
];

export default function RefineModal({ isOpen, onClose, onConvert, isConverting }: RefineModalProps) {
    const [codingStyle, setCodingStyle] = useState('standard');
    const [refinementPrompt, setRefinementPrompt] = useState('');

    const handleConvert = () => {
        onConvert({ codingStyle, refinementPrompt });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-blue-600/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                                    <Wand2 className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Smart Convert</h2>
                                    <p className="text-xs text-slate-500">Refine how AI generates your code</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Coding Style */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Layout size={14} className="text-blue-500" /> Coding Style
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {STYLES.map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => setCodingStyle(style.id)}
                                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${codingStyle === style.id
                                                    ? 'bg-blue-600/10 border-blue-500/50 text-white'
                                                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                                                }`}
                                        >
                                            <div className={`mt-0.5 ${codingStyle === style.id ? 'text-blue-500' : 'text-slate-500'}`}>
                                                {style.icon}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold">{style.name}</div>
                                                <div className="text-[10px] opacity-60 leading-tight">{style.description}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Instructions */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles size={14} className="text-blue-500" /> Custom Instructions
                                </label>
                                <textarea
                                    placeholder="e.g., 'Use async/await', 'Add detailed JSDoc comments', 'Use the axios library instead of fetch'..."
                                    value={refinementPrompt}
                                    onChange={(e) => setRefinementPrompt(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all min-h-[100px] resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900/20 border-t border-slate-800 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConvert}
                                disabled={isConverting}
                                className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isConverting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Wand2 size={16} />
                                )}
                                {isConverting ? 'Generating...' : 'Refine & Convert'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
