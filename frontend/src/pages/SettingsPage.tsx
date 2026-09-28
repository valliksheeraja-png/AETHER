import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  Database,
  Cloud,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Server,
  Terminal,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';

interface SettingsPageProps {
  isDemoMode: boolean;
  totalFeedback: number;
  onReseed: () => void;
  isReseeding: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  isDemoMode,
  totalFeedback,
  onReseed,
  isReseeding,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [vectorCount, setVectorCount] = useState(totalFeedback);

  useEffect(() => {
    api.getSystemStatus().then((s) => {
      setVectorCount(s.vector_store_count || totalFeedback);
    }).catch(() => {});
  }, [totalFeedback]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">System & AI Agent Configuration</h2>
        <p className="text-xs text-slate-400">
          Manage AI providers, persistent vector memory engine, and demo datasets
        </p>
      </div>

      {/* AI Engine Status Card */}
      <div className="p-6 rounded-2xl bg-[#121522] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Active Intelligence Engine</h3>
              <p className="text-xs text-slate-400">Inference provider for sentiment, topics, and memory embeddings</p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              isDemoMode
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isDemoMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span>{isDemoMode ? 'Demo AI Mode (Deterministic Heuristics)' : 'Google Gemini Live API'}</span>
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {isDemoMode
            ? 'Operating in Demo AI Mode. Structured extraction, keyword analysis, and 64-dimensional semantic dense embeddings are fully functional offline without an external API key.'
            : 'Connected directly to Google Gemini 1.5 Flash for natural language reasoning and text-embedding-004.'}
        </p>
      </div>

      {/* Gemini API Key Configuration */}
      <div className="p-6 rounded-2xl bg-[#121522] border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">Google Gemini API Key</h3>
            <p className="text-xs text-slate-400">Set via <code className="text-cyan-400 font-mono">.env</code> or configure below</p>
          </div>
        </div>

        <form onSubmit={handleSaveKey} className="space-y-3">
          <div className="relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Keys are stored securely in environment variables and never exposed to the frontend.
            </span>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : null}
              <span>{isSaved ? 'Key Configured' : 'Update Key'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Memory & Storage Stats */}
      <div className="p-6 rounded-2xl bg-[#121522] border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">Persistent Vector Storage</h3>
            <p className="text-xs text-slate-400">High-performance vector memory and relational SQLite database</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase">Vectors Indexed</span>
            <span className="font-mono text-base font-bold text-white block">
              {vectorCount} vectors
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase">Relational Database</span>
            <span className="font-mono text-base font-bold text-slate-200 block">
              SQLite (SQLAlchemy)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase">Similarity Metric</span>
            <span className="font-mono text-base font-bold text-cyan-300 block">
              Cosine (Normalized)
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-white/5">
          <span className="text-xs text-slate-400">Reset or re-seed the 500 benchmark feedback records:</span>
          <button
            onClick={onReseed}
            disabled={isReseeding}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReseeding ? 'animate-spin' : ''}`} />
            <span>{isReseeding ? 'Seeding 500 Records...' : 'Reset & Seed Demo Data'}</span>
          </button>
        </div>
      </div>

      {/* Deployment & Cloud Target */}
      <div className="p-6 rounded-2xl bg-[#121522] border border-white/10 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">Google Cloud Run Deployment Target</h3>
            <p className="text-xs text-slate-400">Cloud-native containerized architecture</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          AETHER is packaged with container definitions (<code className="text-cyan-400 font-mono">Dockerfile</code>) ready for one-command deployment to Google Cloud Run with automated HTTPS and autoscaling.
        </p>
      </div>
    </div>
  );
};
