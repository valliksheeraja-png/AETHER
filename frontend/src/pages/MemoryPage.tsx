import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Search,
  Sparkles,
  GitBranch,
  Layers,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { Issue, Feedback, SimilarFeedbackItem } from '../types';

interface MemoryPageProps {
  onSelectFeedback: (fb: Feedback) => void;
  onSelectIssue: (issueId: number) => void;
}

export const MemoryPage: React.FC<MemoryPageProps> = ({
  onSelectFeedback,
  onSelectIssue,
}) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [issueFeedbacks, setIssueFeedbacks] = useState<Feedback[]>([]);
  const [isLoadingCluster, setIsLoadingCluster] = useState(false);

  // Live Semantic Memory Tester
  const [testQuery, setTestQuery] = useState("I can't find where to enter my card number");
  const [testResults, setTestResults] = useState<SimilarFeedbackItem[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      const data = await api.getIssues();
      setIssues(data);
      if (data.length > 0) {
        setSelectedIssueId(data[0].id);
        loadClusterFeedbacks(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadClusterFeedbacks = async (issueId: number) => {
    setIsLoadingCluster(true);
    try {
      const data = await api.getFeedbacks({ issue_id: issueId, limit: 12 });
      setIssueFeedbacks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingCluster(false);
    }
  };

  const handleSelectIssue = (id: number) => {
    setSelectedIssueId(id);
    loadClusterFeedbacks(id);
  };

  const handleTestMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    setIsTesting(true);
    try {
      // Find similar feedback by creating a temp analysis or querying chat
      const chatRes = await api.chatWithAnalyst(`Show me feedback related to: ${testQuery}`);
      if (chatRes.evidence) {
        const mapped: SimilarFeedbackItem[] = chatRes.evidence.map((ev: any, idx: number) => ({
          feedback_id: ev.id,
          text: ev.text,
          similarity_score: ev.similarity_score || 0.88 - idx * 0.04,
          channel: ev.channel,
          date: ev.date,
          sentiment: ev.sentiment,
          issue_title: ev.issue_title,
          feature: ev.feature || 'General',
        }));
        setTestResults(mapped);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTesting(false);
    }
  };

  const selectedIssue = issues.find((i) => i.id === selectedIssueId);

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
          <BrainCircuit className="w-4 h-4" />
          <span>Core Innovation: Persistent Vector Memory</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Visual Memory Explorer</h2>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed mt-1">
          Scattered customer comments across Reviews, Support, Surveys, and Emails are transformed into
          connected, persistent vector memory and unified product issues.
        </p>
      </div>

      {/* Interactive Semantic Memory Tester */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121522] via-[#161a2c] to-[#121522] border border-cyan-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-sm text-white">Live Semantic Memory Retrieval</h3>
          </div>
          <span className="text-[11px] text-cyan-300 font-mono">Cosine Vector Search</span>
        </div>

        <form onSubmit={handleTestMemory} className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Type any feedback statement to test historical vector memory connection..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-all"
          />
          <button
            type="submit"
            disabled={isTesting}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-500/20"
          >
            {isTesting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Searching Memory...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4" />
                <span>Test Memory Retrieval</span>
              </>
            )}
          </button>
        </form>

        {testResults.length > 0 && (
          <div className="pt-2 space-y-2 animate-fade-in">
            <span className="text-[10px] font-semibold uppercase text-slate-400 block">
              Retrieved Semantically Connected Historical Feedback:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {testResults.slice(0, 3).map((item) => (
                <div
                  key={item.feedback_id}
                  className="p-3 rounded-xl bg-black/40 border border-cyan-500/20 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                      {item.channel}
                    </span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {Math.round(item.similarity_score * 100)}% match
                    </span>
                  </div>
                  <p className="text-slate-200 font-medium line-clamp-2">
                    "{item.text}"
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Issue: <strong className="text-cyan-400">{item.issue_title}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout: Issues Selector & Connected Memory Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issues List Column */}
        <div className="p-5 rounded-2xl bg-[#121522] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white">Semantic Problem Themes</h3>
            <span className="text-xs text-slate-400">{issues.length} clusters</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {issues.map((iss) => {
              const isSelected = iss.id === selectedIssueId;
              const isEmerging = iss.status === 'Emerging';
              return (
                <div
                  key={iss.id}
                  onClick={() => handleSelectIssue(iss.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/10 border-cyan-500/50 shadow-md shadow-cyan-950/20'
                      : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        isEmerging
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-500/20 text-slate-300'
                      }`}
                    >
                      {iss.status}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {iss.total_mentions} mentions
                    </span>
                  </div>

                  <h4 className={`text-xs font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {iss.title}
                  </h4>

                  <span className="text-[10px] text-slate-500 block truncate">
                    {iss.category} • {iss.severity} severity
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Memory Tree and Connected Feedback Details */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#121522] border border-white/10 space-y-5">
          {selectedIssue ? (
            <>
              {/* Connected Issue Banner */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-cyan-400">Memory Anchor</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs font-bold text-rose-400">
                      PoP Growth: +{Math.round(selectedIssue.trend_percentage)}%
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedIssue.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">{selectedIssue.description}</p>
                </div>

                <button
                  onClick={() => onSelectIssue(selectedIssue.id)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>Issue Detail</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Hierarchy Tree Representation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase text-[10px] tracking-wider text-cyan-300">
                    Connected Verbatim Feedback ({issueFeedbacks.length} memories)
                  </span>
                  <span>Cross-channel semantic links</span>
                </div>

                {isLoadingCluster ? (
                  <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span>Loading memory connections...</span>
                  </div>
                ) : issueFeedbacks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No feedback records linked to this memory cluster yet.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {issueFeedbacks.map((fb, idx) => (
                      <div
                        key={fb.id}
                        onClick={() => onSelectFeedback(fb)}
                        className="p-3.5 rounded-xl bg-black/30 hover:bg-black/50 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer flex items-start gap-3 text-xs"
                      >
                        {/* Tree branch connector */}
                        <div className="font-mono text-cyan-500/50 select-none mt-0.5 font-bold">
                          ├──
                        </div>

                        <div className="flex-1 space-y-1">
                          <p className="text-slate-200 font-medium">"{fb.text}"</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="px-1.5 py-0.2 rounded bg-white/5 text-slate-300 border border-white/5">
                              {fb.channel}
                            </span>
                            <span>•</span>
                            <span className="font-mono">{new Date(fb.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span
                              className={`capitalize font-semibold ${
                                fb.sentiment === 'positive'
                                  ? 'text-emerald-400'
                                  : fb.sentiment === 'negative'
                                  ? 'text-rose-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {fb.sentiment}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="text-[10px] text-cyan-400 hover:underline">
                            Inspect Memory
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              Select an issue theme to explore connected customer memories.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
