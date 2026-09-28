import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Flame,
  Clock,
  ArrowUpRight,
  Filter,
  ArrowUpDown,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { api } from '../services/api';
import { Issue } from '../types';

interface IssuesPageProps {
  onSelectIssue: (issueId: number) => void;
}

const STATUSES = ['All', 'Emerging', 'Recurring', 'Active', 'Monitoring', 'New', 'Resolved'];

export const IssuesPage: React.FC<IssuesPageProps> = ({ onSelectIssue }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('mentions'); // mentions, growth, recent
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadIssues();
  }, [selectedStatus, sortBy]);

  const loadIssues = async () => {
    setIsLoading(true);
    try {
      const res = await api.getIssues({
        status: selectedStatus,
        sort_by: sortBy,
      });
      setIssues(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Clustered Issues & Themes</h2>
          <p className="text-xs text-slate-400">
            Semantic problem spaces connected by persistent AI memory
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#121522] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st} className="bg-[#121522]">
                {st === 'All' ? 'All Statuses' : st}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#121522] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="mentions" className="bg-[#121522]">Sort by Mentions</option>
            <option value="growth" className="bg-[#121522]">Sort by Growth %</option>
            <option value="recent" className="bg-[#121522]">Sort by Recency</option>
          </select>
        </div>
      </div>

      {/* Issues Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Clustering issues...</span>
        </div>
      ) : issues.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#121522] border border-white/10 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">No Issues Found</h4>
          <p className="text-xs text-slate-500">No issues match the selected criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {issues.map((iss) => {
            const isEmerging = iss.status === 'Emerging';
            return (
              <div
                key={iss.id}
                onClick={() => onSelectIssue(iss.id)}
                className={`p-5 rounded-2xl bg-[#121522] border transition-all cursor-pointer space-y-4 hover:translate-y-[-2px] flex flex-col justify-between ${
                  isEmerging
                    ? 'border-rose-500/40 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-950/20'
                    : 'border-white/10 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-950/20'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isEmerging
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1'
                          : iss.status === 'Recurring'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                      }`}
                    >
                      {isEmerging && <Flame className="w-3 h-3 text-rose-400" />}
                      {iss.status}
                    </span>

                    <span
                      className={`text-[11px] font-mono font-bold ${
                        iss.trend_percentage > 0
                          ? 'text-rose-400'
                          : iss.trend_percentage < 0
                          ? 'text-emerald-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {iss.trend_percentage > 0 ? `+${iss.trend_percentage.toFixed(0)}%` : `${iss.trend_percentage.toFixed(0)}%`}
                    </span>
                  </div>

                  <h3 className="font-semibold text-base text-white mt-2.5 line-clamp-1">
                    {iss.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {iss.description || 'Customer reported issues grouped in this category.'}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Mentions</span>
                    <span className="font-mono font-bold text-white text-sm">{iss.total_mentions}</span>
                  </div>

                  {iss.channels && Object.keys(iss.channels).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(iss.channels).slice(0, 3).map(([ch, count]) => (
                        <span
                          key={ch}
                          className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5"
                        >
                          {ch}: {count}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Severity: <strong className="capitalize text-slate-300">{iss.severity}</strong></span>
                    <span className="text-cyan-400 flex items-center gap-0.5 font-medium hover:underline">
                      Detail View <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
