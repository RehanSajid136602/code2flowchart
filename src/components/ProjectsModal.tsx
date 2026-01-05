'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Trash2, Clock, X, ChevronRight, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getProjects, deleteProject } from '@/lib/projectActions';
import { Project } from '@/types';
import { useLogicStore } from '@/store/useLogicStore';
import { playEffect } from '@/hooks/useSoundEffect';

interface ProjectsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProjectsModal({ isOpen, onClose }: ProjectsModalProps) {
    const { user } = useAuth();
    const { loadProject } = useLogicStore();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProjects = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getProjects(user.uid);
            setProjects(data);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchProjects();
        }
    }, [isOpen, user]);

    const handleLoad = (project: Project) => {
        loadProject(project);
        playEffect('step');
        onClose();
    };

    const handleDelete = async (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        if (!user || !confirm('Are you sure you want to delete this project?')) return;

        try {
            await deleteProject(user.uid, projectId);
            setProjects(projects.filter(p => p.id !== projectId));
            playEffect('stop');
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                                    <FolderOpen className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">My Projects</h2>
                                    <p className="text-xs text-slate-500">Manage your saved flowcharts</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-4 border-b border-slate-900 bg-slate-900/30">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm text-slate-500">Loading your projects...</p>
                                </div>
                            ) : filteredProjects.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                                        <FolderOpen className="w-6 h-6 text-slate-700" />
                                    </div>
                                    <p className="text-sm text-slate-500">No projects found</p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {filteredProjects.map((project) => (
                                        <motion.div
                                            key={project.id}
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="group flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800/50 hover:border-blue-500/50 hover:bg-slate-900/60 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-blue-500/5"
                                            onClick={() => handleLoad(project)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-800 rounded-lg flex flex-col items-center justify-center group-hover:bg-blue-600/10 transition-colors">
                                                    <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                                                        {project.name}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-mono">
                                                            <Clock size={10} />
                                                            {new Date(project.updatedAt).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-[10px] text-slate-700 mx-1">•</span>
                                                        <span className="text-[10px] text-slate-500 font-mono">
                                                            {project.nodes.length} nodes
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => handleDelete(e, project.id)}
                                                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-slate-500 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-900/20 border-t border-slate-900 flex justify-between items-center">
                            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                                LogicFlow Enterprise Persistence
                            </p>
                            <div className="flex gap-1">
                                <div className="w-1 h-1 rounded-full bg-blue-500/50" />
                                <div className="w-1 h-1 rounded-full bg-blue-500/30" />
                                <div className="w-1 h-1 rounded-full bg-blue-500/10" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
