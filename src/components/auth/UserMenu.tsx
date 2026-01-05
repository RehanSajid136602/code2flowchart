'use client';

import React, { useState } from 'react';
import { LogOut, ChevronDown, FolderOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/authActions';
import ProjectsModal from '../ProjectsModal';

export default function UserMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [showProjects, setShowProjects] = useState(false);

  if (!user) return null;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-full text-xs text-slate-200 hover:bg-slate-900"
        >
          <span className="max-w-[160px] truncate">{user.displayName || user.email}</span>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-[200]">
            <div className="px-3 py-2 border-b border-slate-800">
              <div className="text-[10px] text-slate-500">Signed in as</div>
              <div className="text-xs text-slate-200 truncate">{user.email}</div>
            </div>

            <button
              onClick={() => {
                setShowProjects(true);
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-900 flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4 text-slate-500" /> My Projects
            </button>

            <button
              onClick={async () => {
                await logout();
                setOpen(false);
                window.location.href = '/login';
              }}
              className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-900 flex items-center gap-2 border-t border-slate-900"
            >
              <LogOut className="w-4 h-4 text-slate-500" /> Sign out
            </button>
          </div>
        )}
      </div>

      <ProjectsModal
        isOpen={showProjects}
        onClose={() => setShowProjects(false)}
      />
    </>
  );
}
