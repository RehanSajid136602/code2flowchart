'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LANGUAGES } from '@/types/languages';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LanguageSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function LanguageSelector({ selectedId, onSelect }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLang = LANGUAGES.find((l) => l.id === selectedId) || LANGUAGES[0];
  
  const filteredLangs = LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 hover:bg-slate-800/50 rounded-lg border border-slate-700/50 transition-all text-xs text-slate-200 min-w-[140px] justify-between group"
      >
        <div className="flex items-center gap-2">
          <span>{selectedLang.icon}</span>
          <span className="font-medium">{selectedLang.name}</span>
        </div>
        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-500 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute top-full mt-2 left-0 w-64 bg-[#0f172a] border border-slate-700/50 rounded-xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl"
          >
            <div className="p-2 border-b border-slate-700/50 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <input
                autoFocus
                type="text"
                placeholder="Search languages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs text-slate-200 outline-none w-full"
              />
            </div>
            <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
              {filteredLangs.length > 0 ? (
                filteredLangs.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      onSelect(lang.id);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-left text-xs rounded-lg transition-colors",
                      selectedId === lang.id ? "bg-blue-600/20 text-blue-400" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{lang.icon}</span>
                      <span>{lang.name}</span>
                    </div>
                    {selectedId === lang.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-xs text-slate-500 italic">
                  No languages found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
