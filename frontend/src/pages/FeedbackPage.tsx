import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw,
  MessageSquare,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { api } from '../services/api';
import { Feedback, Issue } from '../types';

interface FeedbackPageProps {
  onSelectFeedback: (fb: Feedback) => void;
  onOpenAddModal: () => void;
}

const CHANNELS = ['All', 'Customer Review', 'Support Ticket', 'Survey', 'Email', 'Social Media', 'App Feedback', 'Interview'];
const SENTIMENTS = ['All', 'Negative', 'Positive', 'Neutral'];

export const FeedbackPage: React.FC<FeedbackPageProps> = ({
  onSelectFeedback,
  onOpenAddModal,
}) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [search, setSearch] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('All');
  const [selectedSentiment, setSelectedSentiment] = useState('All');
  const [selectedIssueId, setSelectedIssueId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    loadIssues();
    loadFeedbacks();
  }, [selectedChannel, selectedSentiment, selectedIssueId, limit]);

  const loadIssues = async () => {
    try {
      const res = await api.getIssues();
      setIssues(res);
    } catch (e) {
      console.error(e);
    }
  };

  const loadFeedbacks = async () => {
    setIsLoading(true);
    try {
      const res = await api.getFeedbacks({
        channel: selectedChannel,
        sentiment: selectedSentiment,
        issue_id: selectedIssueId,
        search: search.trim() || undefined,
        limit,
      });
      setFeedbacks(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFeedbacks();
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove feedback #${id}?`)) {
      try {
        await api.deleteFeedback(id);
        setFeedbacks((prev) => prev.filter((item) => item.id !== id));
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Customer Feedback Stream</h2>
          <p className="text-xs text-slate-400">
            {feedbacks.length} records matching current semantic filters
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 shadow-md shadow-cyan-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Feedback</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121522] border border-white/10 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search verbatim quotes, e.g. 'checkout', 'card', 'lag', 'failed'..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-slate-200 transition-all cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Channel Filter */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Channel
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              {CHANNELS.map((ch) => (
                <option key={ch} value={ch} className="bg-[#121522]">
                  {ch}
                </option>
              ))}
            </select>
          </div>

          {/* Sentiment Filter */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Sentiment
            </label>
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              {SENTIMENTS.map((s) => (
                <option key={s} value={s} className="bg-[#121522]">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Issue Filter */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Clustered Issue
            </label>
            <select
              value={selectedIssueId || ''}
              onChange={(e) => setSelectedIssueId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="" className="bg-[#121522]">
                All Issues
              </option>
              {issues.map((iss) => (
                <option key={iss.id} value={iss.id} className="bg-[#121522]">
                  {iss.title} ({iss.total_mentions})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Records List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Loading feedback stream...</span>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#121522] border border-white/10 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No Feedback Matches Query</h4>
            <p className="text-xs text-slate-500">Try clearing filters or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                onClick={() => onSelectFeedback(fb)}
                className="p-4 rounded-xl bg-[#121522] hover:bg-[#161a2b] border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-slate-500">#{fb.id}</span>
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
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5">
                      {fb.channel}
                    </span>
                    {fb.issue_title && (
                      <span className="text-cyan-300 font-semibold flex items-center gap-1">
                        • {fb.issue_title}
                      </span>
                    )}
                    <span className="text-slate-500 font-mono text-[11px] ml-auto sm:ml-0">
                      {new Date(fb.date).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-slate-200 font-medium text-sm leading-relaxed">
                    "{fb.text}"
                  </p>

                  {fb.keywords && fb.keywords.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {fb.keywords.slice(0, 4).map((kw, idx) => (
                        <span key={idx} className="text-[10px] text-slate-400 font-mono">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={(e) => handleDelete(fb.id, e)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="text-cyan-400 flex items-center gap-1 text-[11px] font-medium hover:underline">
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
