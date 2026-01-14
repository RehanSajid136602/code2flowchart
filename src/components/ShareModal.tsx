'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, Link2, X, Shield, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  isPublic?: boolean;
  shareUrl?: string;
  onShare: (action: 'share' | 'unshare') => Promise<{ shareUrl?: string }>;
}

export default function ShareModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  isPublic = false,
  shareUrl = '',
  onShare,
}: ShareModalProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const result = await onShare('share');
      setIsSharing(false);
    } catch (error) {
      console.error('Failed to share project:', error);
      setIsSharing(false);
    }
  };

  const handleUnshare = async () => {
    setIsSharing(true);
    try {
      await onShare('unshare');
      setIsSharing(false);
    } catch (error) {
      console.error('Failed to unshare project:', error);
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleCopyEmbed = async () => {
    if (!shareUrl) return;

    const embedCode = `<iframe src="${shareUrl}" width="800" height="600" frameborder="0" style="border:1px solid #ccc;"></iframe>`;

    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy embed code:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Share2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Share Project</h2>
              <p className="text-sm text-slate-400">{projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl mb-6">
            <div className="p-2 bg-amber-600/20 rounded-lg shrink-0">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-white mb-1">Privacy & Access</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isPublic
                  ? 'This project is publicly accessible to anyone with the link. Anyone can view but not edit your flowchart.'
                  : 'This project is private. Only you can access it. Share it to make it public.'}
              </p>
            </div>
          </div>

          {!isPublic && (
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="w-full mb-6 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSharing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating link...
                </>
              ) : (
                <>
                  <Globe className="w-5 h-5" />
                  Make Public & Share
                </>
              )}
            </button>
          )}

          {isPublic && shareUrl && (
            <>
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-300 font-mono truncate">
                    {shareUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                    title="Copy link"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Embed Code
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-slate-300 font-mono truncate">
                    &lt;iframe src=&quot;{shareUrl}&quot; width=&quot;800&quot; height=&quot;600&quot;&gt;&lt;/iframe&gt;
                  </div>
                  <button
                    onClick={handleCopyEmbed}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                    title="Copy embed code"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleUnshare}
                disabled={isSharing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSharing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                    Stop sharing...
                  </>
                ) : (
                  'Stop Sharing'
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
