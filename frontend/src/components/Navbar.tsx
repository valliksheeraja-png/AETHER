import React from 'react';
import { Plus, Upload, Sparkles, BrainCircuit } from 'lucide-react';

interface NavbarProps {
  title: string;
  subtitle: string;
  isDemoMode: boolean;
  onOpenAddModal: () => void;
  onOpenUploadModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  subtitle,
  isDemoMode,
  onOpenAddModal,
  onOpenUploadModal,
}) => {
  return (
    <header className="h-16 border-b border-white/10 bg-[#0d0f18]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title & Tagline */}
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Demo AI Mode Pill */}
        {isDemoMode ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Demo AI Mode</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Gemini Live AI</span>
          </div>
        )}

        {/* Upload CSV */}
        <button
          onClick={onOpenUploadModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 transition-all cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span>Upload CSV</span>
        </button>

        {/* Add Feedback */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 hover:opacity-95 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Feedback</span>
        </button>
      </div>
    </header>
  );
};
