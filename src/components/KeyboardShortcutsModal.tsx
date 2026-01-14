'use client';

import React from 'react';
import { Keyboard, X, Zap, Save, Undo2, Redo2, Share, Play, FileDown, Bug, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { key: 'Ctrl/Cmd + K', description: 'Run analysis', icon: <Bug size={18} /> },
    ]
  },
  {
    category: 'Project',
    items: [
      { key: 'Ctrl/Cmd + S', description: 'Save project', icon: <Save size={18} /> },
      { key: 'Ctrl/Cmd + H', description: 'Share project', icon: <Share size={18} /> },
    ]
  },
  {
    category: 'Edit',
    items: [
      { key: 'Ctrl/Cmd + E', description: 'Open convert modal', icon: <Settings size={18} /> },
    ]
  },
  {
    category: 'Actions',
    items: [
      { key: 'Ctrl/Cmd + Enter', description: 'Build flowchart', icon: <Zap size={18} /> },
      { key: 'Space', description: 'Step through execution', icon: <Play size={18} /> },
    ]
  },
  {
    category: 'Export',
    items: [
      { key: 'Click Export menu', description: 'Choose format (PNG, SVG, PDF, JSON)', icon: <FileDown size={18} /> },
    ]
  },
];

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Keyboard className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
              <p className="text-sm text-slate-400">Quick access to all features</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {shortcuts.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">
                {group.category}
              </h3>
              <div className="space-y-2">
                {group.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-700 rounded-lg">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm text-slate-300 font-medium">{item.description}</p>
                      </div>
                    </div>
                    <kbd className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono text-slate-400">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 pt-0">
          <p className="text-sm text-slate-400 text-center">
            Press <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-mono mx-1">?</kbd> anywhere in the app to show this modal again.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
