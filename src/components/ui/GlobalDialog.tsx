'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Info,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    HelpCircle,
    X,
    RefreshCw
} from 'lucide-react';
import { useDialogStore } from '@/store/useDialogStore';
import { playEffect } from '@/hooks/useSoundEffect';

export default function GlobalDialog() {
    const {
        isOpen,
        type,
        title,
        message,
        confirmLabel,
        cancelLabel,
        showInput,
        inputValue,
        isLoading,
        onConfirm,
        onCancel,
        setInputValue,
        closeDialog
    } = useDialogStore();

    const handleConfirm = async () => {
        if (isLoading) return;

        const currentTitle = title;
        playEffect('step');

        if (onConfirm) {
            await onConfirm(inputValue);
        }

        // Only close if we are still showing the same dialog
        // This prevents closing a success dialog that was opened during onConfirm
        const latestState = useDialogStore.getState();
        if (latestState.isOpen && latestState.title === currentTitle) {
            closeDialog();
        }
    };

    const handleCancel = () => {
        if (isLoading) return;
        if (onCancel) onCancel();
        closeDialog();
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-8 h-8 text-emerald-500" />;
            case 'warning': return <AlertTriangle className="w-8 h-8 text-amber-500" />;
            case 'error': return <XCircle className="w-8 h-8 text-red-500" />;
            case 'confirm': return <HelpCircle className="w-8 h-8 text-blue-500" />;
            default: return <Info className="w-8 h-8 text-blue-500" />;
        }
    };

    const getColorClass = () => {
        switch (type) {
            case 'success': return 'border-emerald-500/30 bg-emerald-500/5';
            case 'warning': return 'border-amber-500/30 bg-amber-500/5';
            case 'error': return 'border-red-500/30 bg-red-500/5';
            case 'confirm': return 'border-blue-500/30 bg-blue-500/5';
            default: return 'border-blue-500/30 bg-blue-500/5';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCancel}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Dialog Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`relative w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl ${getColorClass()} border-slate-800 bg-slate-950/80`}
                    >
                        {/* Glossy Header Effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        <div className="p-8">
                            <div className="flex items-start gap-6">
                                <div className={`p-4 rounded-2xl bg-slate-900/50 border border-white/5 shadow-inner`}>
                                    {getIcon()}
                                </div>

                                <div className="flex-1 space-y-2">
                                    <h3 className="text-xl font-black text-white tracking-tight leading-none pt-1">
                                        {title}
                                    </h3>
                                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                        {message}
                                    </p>

                                    {showInput && (
                                        <div className="mt-6">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                placeholder="Enter value..."
                                                className="w-full h-12 bg-slate-900 border border-slate-800 rounded-xl px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleConfirm();
                                                    if (e.key === 'Escape') handleCancel();
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleCancel}
                                    className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                                >
                                    <X className="w-5 h-5 text-slate-500 group-hover:text-white" />
                                </button>
                            </div>

                            <div className="mt-10 flex gap-3 justify-end font-bold">
                                {type === 'confirm' && (
                                    <button
                                        onClick={handleCancel}
                                        className="px-6 py-3 rounded-xl text-xs uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                                    >
                                        {cancelLabel}
                                    </button>
                                )}

                                <button
                                    onClick={handleConfirm}
                                    disabled={isLoading}
                                    className={`px-8 py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2
                    ${type === 'error' ? 'bg-red-600 text-white hover:bg-red-500' :
                                            type === 'warning' ? 'bg-amber-600 text-white hover:bg-amber-500' :
                                                'bg-blue-600 text-white hover:bg-blue-500'}
                   `}
                                >
                                    {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
