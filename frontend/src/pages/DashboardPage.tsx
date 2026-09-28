import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Smile,
  Frown,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Flame,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import {
  DashboardStats,
  EmergingIssue,
  TopTheme,
  SentimentTrendPoint,
  Feedback
} from '../types';

interface DashboardPageProps {
  onSelectFeedback: (fb: Feedback) => void;
  onSelectIssue: (issueId: number) => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectFeedback,
  onSelectIssue,
  onNavigateToTab,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [emergingIssues, setEmergingIssues] = useState<EmergingIssue[]>([]);
  const [sentimentTrends, setSentimentTrends] = useState<SentimentTrendPoint[]>([]);
  const [topThemes, setTopThemes] = useState<TopTheme[]>([]);
  const [recentFeedbacks, setRecentFeedbacks] = useState<Feedback[]>([]);
  const [insight, setInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [s, em, tr, th, fb, ins] = await Promise.all([
        api.getDashboardStats(),
        api.getEmergingIssues(4),
        api.getSentimentTrends(30),
        api.getTopThemes(6),
        api.getFeedbacks({ limit: 6 }),
        api.getDashboardInsight(),
      ]);
      setStats(s);
      setEmergingIssues(em);
      setSentimentTrends(tr);
      setTopThemes(th);
      setRecentFeedbacks(fb);
      setInsight(ins.insight);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Synthesizing feedback memory & trends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* AI Insight Executive Banner */}
      {insight && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-purple-950/30 border border-cyan-500/30 shadow-lg shadow-cyan-500/5 relative overflow-hidden">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/40 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  AI Memory Synthesis
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Live Insight
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {insight}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Feedback */}
        <div className="p-4 rounded-2xl bg-[#121522] border border-white/10 hover:border-white/20 transition-all space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Feedback</span>
            <MessageSquare className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">
            {stats?.total_feedback ?? 0}
          </p>
          <span className="text-[11px] text-slate-400">Persistent memory pool</span>
        </div>

        {/* Active Issues */}
        <div className="p-4 rounded-2xl bg-[#121522] border border-white/10 hover:border-white/20 transition-all space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Issues</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-300 tracking-tight">
            {stats?.active_issues ?? 0}
          </p>
          <span className="text-[11px] text-slate-400">Clustered semantic themes</span>
        </div>

        {/* Emerging Issues */}
        <div className="p-4 rounded-2xl bg-[#121522] border border-rose-500/30 bg-rose-500/[0.03] hover:border-rose-500/50 transition-all space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-rose-300 text-xs font-semibold">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> Emerging Issues
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <p className="text-2xl font-bold text-rose-400 tracking-tight">
            {stats?.emerging_issues ?? 0}
          </p>
          <span className="text-[11px] text-rose-300/80">Growth &gt; +25% threshold</span>
        </div>

        {/* Positive Sentiment */}
        <div className="p-4 rounded-2xl bg-[#121522] border border-white/10 hover:border-white/20 transition-all space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Positive Sentiment</span>
            <Smile className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 tracking-tight">
            {stats?.positive_percentage ?? 0}%
          </p>
          <span className="text-[11px] text-slate-400">{stats?.total_positive ?? 0} positive items</span>
        </div>

        {/* Negative Sentiment */}
        <div className="p-4 rounded-2xl bg-[#121522] border border-white/10 hover:border-white/20 transition-all space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Negative Sentiment</span>
            <Frown className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400 tracking-tight">
            {stats?.negative_percentage ?? 0}%
          </p>
          <span className="text-[11px] text-slate-400">{stats?.total_negative ?? 0} complaints</span>
        </div>
      </div>

      {/* Emerging Issues Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider border border-rose-500/30 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> 🚨 Emerging Issues
            </span>
            <span className="text-xs text-slate-400">Explainable Period-over-Period Spike Analysis</span>
          </div>

          <button
            onClick={() => onNavigateToTab('issues')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Issues</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {emergingIssues.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectIssue(item.id)}
              className="p-4 rounded-2xl bg-[#121522] border border-rose-500/25 hover:border-rose-400/50 hover:bg-white/[0.02] transition-all cursor-pointer space-y-3 shadow-md shadow-rose-950/20 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm text-white line-clamp-1">{item.title}</h4>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 shrink-0">
                    +{Math.round(item.growth_percentage)}%
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs py-2 border-y border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Previous</span>
                    <span className="font-mono text-slate-300 font-semibold">{item.previous_mentions}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Current</span>
                    <span className="font-mono text-white font-bold text-rose-400">
                      {item.current_mentions}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 italic mt-2 line-clamp-2">
                  "{item.sample_quote}"
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {item.channels.slice(0, 3).map((ch, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5"
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Row: Sentiment Trend Line Chart + Top Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Trend Line Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#121522] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-white">Sentiment Trend Over Time</h3>
              <p className="text-xs text-slate-400">Daily distribution of positive, neutral, and negative customer comments</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Positive
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-400" /> Neutral
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Negative
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="negative"
                  name="Negative"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#f43f5e' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="positive"
                  name="Positive"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#10b981' }}
                />
                <Line
                  type="monotone"
                  dataKey="neutral"
                  name="Neutral"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Themes */}
        <div className="p-5 rounded-2xl bg-[#121522] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white">Top Themes</h3>
            <span className="text-xs text-slate-400">By volume</span>
          </div>

          <div className="space-y-2.5">
            {topThemes.map((theme, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-slate-500 w-4">{i + 1}.</span>
                  <span className="font-semibold text-slate-200">{theme.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-medium text-slate-400">{theme.count} mentions</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                    {Math.round(theme.sentiment_score * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Feedback Table */}
      <div className="p-5 rounded-2xl bg-[#121522] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-white">Recent Feedback Stream</h3>
            <p className="text-xs text-slate-400">Live multi-channel ingestion with automatic semantic tagging</p>
          </div>
          <button
            onClick={() => onNavigateToTab('feedback')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Stream</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-black/20 text-slate-400 font-semibold border-b border-white/5">
              <tr>
                <th className="py-2.5 px-3">Feedback</th>
                <th className="py-2.5 px-3">Channel</th>
                <th className="py-2.5 px-3">Sentiment</th>
                <th className="py-2.5 px-3">Connected Issue</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentFeedbacks.map((fb) => (
                <tr
                  key={fb.id}
                  onClick={() => onSelectFeedback(fb)}
                  className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <td className="py-3 px-3 max-w-xs font-medium text-slate-200 truncate">
                    "{fb.text}"
                  </td>
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[11px]">
                      {fb.channel}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        fb.sentiment === 'positive'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : fb.sentiment === 'negative'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-500/20 text-slate-300'
                      }`}
                    >
                      {fb.sentiment}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-cyan-300 font-medium whitespace-nowrap">
                    {fb.issue_title || 'General'}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`text-[11px] font-medium capitalize ${
                        fb.severity === 'critical'
                          ? 'text-rose-400'
                          : fb.severity === 'high'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {fb.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap font-mono">
                    {new Date(fb.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
