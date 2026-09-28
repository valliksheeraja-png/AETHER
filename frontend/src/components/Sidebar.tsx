import React from 'react';
import {
  LayoutDashboard,
  MessageSquareText,
  AlertTriangle,
  BrainCircuit,
  Bot,
  Rocket,
  Settings,
  Database,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isDemoMode: boolean;
  totalFeedback: number;
  onReseed: () => void;
  isReseeding: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isDemoMode,
  totalFeedback,
  onReseed,
  isReseeding,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'feedback', label: 'Feedback', icon: MessageSquareText },
    { id: 'issues', label: 'Issues', icon: AlertTriangle },
    { id: 'memory', label: 'Memory', icon: BrainCircuit },
    { id: 'analyst', label: 'AI Analyst', icon: Bot },
    { id: 'releases', label: 'Releases', icon: Rocket },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0d0f18] border-r border-white/10 flex flex-col h-screen select-none shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 p-[1.5px] flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-[#0d0f18] rounded-[10px] flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-wider text-white">AETHER</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AGENT
            </span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1">AI Feedback Memory</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.id === 'analyst' && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-3 border-t border-white/10 bg-black/20 space-y-2">
        {/* Engine Mode */}
        <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-md bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isDemoMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span className="text-slate-300 font-medium">
              {isDemoMode ? 'Demo AI Mode' : 'Gemini Live AI'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">v1.0</span>
        </div>

        {/* Memory Stats */}
        <div className="flex items-center justify-between text-xs px-2 py-1 text-slate-400">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Memory Pool</span>
          </div>
          <span className="font-mono text-cyan-300">{totalFeedback} items</span>
        </div>

        {/* Reseed Button */}
        <button
          onClick={onReseed}
          disabled={isReseeding}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-2 rounded-md text-xs font-medium text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-all disabled:opacity-50"
          title="Reload 500 realistic seed records with emerging trends"
        >
          <RefreshCw className={`w-3 h-3 ${isReseeding ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{isReseeding ? 'Seeding...' : 'Reload 500 Seed Data'}</span>
        </button>
      </div>
    </aside>
  );
};
