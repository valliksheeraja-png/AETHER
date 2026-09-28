import React, { useState, useEffect } from 'react';
import { X, BrainCircuit, Sparkles, MessageSquare, Tag, Calendar, User, ExternalLink } from 'lucide-react';
import { Feedback, SimilarFeedbackItem } from '../types';
import { api } from '../services/api';

interface FeedbackDetailModalProps {
  feedback: Feedback | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectIssue?: (issueId: number) => void;
}

export const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  feedback,
  isOpen,
  onClose,
  onSelectIssue,
}) => {
  const [similarItems, setSimilarItems] = useState<SimilarFeedbackItem[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);

  useEffect(() => {
    if (feedback && isOpen) {
      setIsLoadingSimilar(true);
      api.getSimilarFeedback(feedback.id, 5)
        .then((res) => setSimilarItems(res.similar_feedback || []))
        .catch(() => setSimilarItems([]))
        .finally(() => setIsLoadingSimilar(false));
    } else {
      setSimilarItems([]);
    }
  }, [feedback, isOpen]);

  if (!isOpen || !feedback) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-[#121522] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
                feedback.sentiment === 'positive'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : feedback.sentiment === 'negative'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
              }`}
            >
              {feedback.sentiment} ({Math.round(feedback.sentiment_score * 100)}%)
            </span>
            <span className="text-xs text-slate-400 font-mono">ID #{feedback.id}</span>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Main Feedback Verbatim Quote */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 relative">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Customer Verbatim Quote
            </span>
            <p className="text-base text-slate-100 font-medium leading-relaxed">
              "{feedback.text}"
            </p>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-cyan-400" /> Channel
              </span>
              <span className="font-semibold text-slate-200 block">{feedback.channel}</span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                <Tag className="w-3 h-3 text-indigo-400" /> Feature
              </span>
              <span className="font-semibold text-slate-200 block">{feedback.feature}</span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-400" /> Date
              </span>
              <span className="font-semibold text-slate-200 block">
                {new Date(feedback.date).toLocaleDateString()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                <User className="w-3 h-3 text-fuchsia-400" /> Customer ID
              </span>
              <span className="font-semibold text-slate-200 block font-mono">
                {feedback.customer_id || 'Anonymous'}
              </span>
            </div>
          </div>

          {/* AI Intelligence Extraction */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Extracted Intelligence</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Connected Issue / Theme</span>
                <span className="font-semibold text-cyan-300 text-sm flex items-center gap-1 mt-0.5">
                  {feedback.issue_title || 'General Theme'}
                  {feedback.issue_id && onSelectIssue && (
                    <button
                      onClick={() => {
                        onClose();
                        onSelectIssue(feedback.issue_id!);
                      }}
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-0.5 ml-2 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" /> View Issue
                    </button>
                  )}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Severity & Intent</span>
                <span className="font-semibold text-slate-200 capitalize mt-0.5 block">
                  {feedback.severity} Severity • {feedback.intent.replace('_', ' ')}
                </span>
              </div>
            </div>

            {feedback.summary && (
              <div className="text-xs pt-1 border-t border-white/5">
                <span className="text-slate-400 text-[10px] uppercase block">AI Synthesis</span>
                <p className="text-slate-300 mt-0.5">{feedback.summary}</p>
              </div>
            )}

            {feedback.keywords && feedback.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {feedback.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300 font-mono"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Persistent Vector Memory: Semantically Similar Feedback */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                <span>Vector Memory Connections (Cross-Time & Cross-Channel)</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {isLoadingSimilar ? 'Scanning embeddings...' : `${similarItems.length} related records found`}
              </span>
            </div>

            {isLoadingSimilar ? (
              <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Searching persistent vector memory...</span>
              </div>
            ) : similarItems.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-500">
                No high-confidence semantic matches found in vector memory for this item.
              </div>
            ) : (
              <div className="space-y-2">
                {similarItems.map((item) => (
                  <div
                    key={item.feedback_id}
                    className="p-3 rounded-xl bg-black/30 hover:bg-black/50 border border-white/5 hover:border-cyan-500/30 transition-all flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <p className="text-slate-200 font-medium">"{item.text}"</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/5 text-slate-300">
                          {item.channel}
                        </span>
                        <span>•</span>
                        <span>{item.date}</span>
                        <span>•</span>
                        <span className="text-cyan-400">{item.issue_title || item.feature}</span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[10px] text-slate-500 block">Similarity</span>
                      <span className="font-mono font-bold text-cyan-300">
                        {Math.round(item.similarity_score * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
