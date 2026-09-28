import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Flame,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MessageSquare,
  Tag,
  Share2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { IssueDetail, Feedback } from '../types';

interface IssueDetailPageProps {
  issueId: number;
  onBack: () => void;
  onSelectFeedback: (fb: Feedback) => void;
}

export const IssueDetailPage: React.FC<IssueDetailPageProps> = ({
  issueId,
  onBack,
  onSelectFeedback,
}) => {
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadIssueDetail();
  }, [issueId]);

  const loadIssueDetail = async () => {
    setIsLoading(true);
    try {
      const data = await api.getIssueDetail(issueId);
      setIssue(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !issue) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>Loading issue timeline and memory connections...</span>
      </div>
    );
  }

  const isEmerging = issue.status === 'Emerging';
  const channelData = Object.entries(issue.channel_distribution || {}).map(([name, count]) => ({
    name,
    count,
  }));

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back button & Breadcrumb */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Issues</span>
      </button>

      {/* Main Issue Header Card */}
      <div className="p-6 rounded-2xl bg-[#121522] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                isEmerging
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              {isEmerging && <Flame className="w-3.5 h-3.5 text-rose-400" />}
              {issue.status}
            </span>

            <span className="text-xs text-slate-400 font-mono">Category: {issue.category}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Severity: <strong className="capitalize text-white">{issue.severity}</strong>
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{issue.title}</h2>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Growth and Mentions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5 text-xs">
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-0.5">
            <span className="text-[10px] uppercase text-slate-400">Total Mentions</span>
            <span className="font-mono text-xl font-bold text-white block">{issue.total_mentions}</span>
          </div>

          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-0.5">
            <span className="text-[10px] uppercase text-slate-400">PoP Growth</span>
            <span
              className={`font-mono text-xl font-bold block ${
                issue.growth_rate > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {issue.growth_rate > 0 ? `+${issue.growth_rate.toFixed(0)}%` : `${issue.growth_rate.toFixed(0)}%`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-0.5">
            <span className="text-[10px] uppercase text-slate-400">Current Period</span>
            <span className="font-mono text-xl font-bold text-slate-200 block">
              {issue.current_period_mentions} items
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-0.5">
            <span className="text-[10px] uppercase text-slate-400">Previous Period</span>
            <span className="font-mono text-xl font-bold text-slate-400 block">
              {issue.previous_period_mentions} items
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: Timeline Chart + Channel Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <div className="p-5 rounded-2xl bg-[#121522] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white">Mentions Timeline</h3>
            <span className="text-xs text-slate-400">Frequency over time</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issue.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161926',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="mentions" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Distribution */}
        <div className="p-5 rounded-2xl bg-[#121522] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white">Channel Distribution</h3>
            <span className="text-xs text-slate-400">Cross-channel appearance</span>
          </div>

          <div className="space-y-3 pt-2">
            {channelData.map((item) => {
              const pct = Math.round((item.count / Math.max(issue.total_mentions, 1)) * 100);
              return (
                <div key={item.name} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-medium">{item.name}</span>
                    <span className="font-mono text-slate-400">
                      {item.count} mentions ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Related features */}
          {issue.related_features && issue.related_features.length > 0 && (
            <div className="pt-3 border-t border-white/5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1.5">
                Related Feature Components
              </span>
              <div className="flex flex-wrap gap-1.5">
                {issue.related_features.map((f, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-cyan-300"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Representative Customer Feedback */}
      <div className="p-5 rounded-2xl bg-[#121522] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-white">Representative Feedback Items</h3>
            <p className="text-xs text-slate-400">
              Verbatim customer complaints connected to this issue across channels and time
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            {issue.representative_feedback.length} items
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {issue.representative_feedback.map((fb) => (
            <div
              key={fb.id}
              onClick={() => onSelectFeedback(fb)}
              className="p-4 rounded-xl bg-black/30 hover:bg-black/50 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-slate-300">
                  {fb.channel}
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {new Date(fb.date).toLocaleDateString()}
                </span>
              </div>

              <p className="text-slate-200 font-medium text-sm">
                "{fb.text}"
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                <span className="text-slate-400 capitalize">{fb.intent.replace('_', ' ')}</span>
                <span className="text-cyan-400 hover:underline flex items-center gap-0.5">
                  Inspect in Memory <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
