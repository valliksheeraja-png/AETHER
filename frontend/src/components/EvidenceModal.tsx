import React from 'react';
import { X, ShieldCheck, MessageSquare, Calendar, Tag, ExternalLink } from 'lucide-react';
import { FeedbackEvidence } from '../types';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: FeedbackEvidence[];
  title?: string;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  evidence,
  title = 'Grounded Evidence Records',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#121522] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-slate-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">{title}</h3>
              <p className="text-xs text-slate-400">
                {evidence.length} verified database records backing this insight
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Evidence List */}
        <div className="p-6 space-y-3 overflow-y-auto flex-1">
          {evidence.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No evidence records found for this query.
            </div>
          ) : (
            evidence.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 rounded-xl bg-black/30 border border-white/5 hover:border-emerald-500/30 transition-all space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500">#{item.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.sentiment === 'positive'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : item.sentiment === 'negative'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-500/20 text-slate-300'
                      }`}
                    >
                      {item.sentiment}
                    </span>
                    <span className="text-cyan-400 font-semibold">{item.issue_title || item.feature}</span>
                  </div>

                  <span className="text-slate-500 text-[11px] font-mono">{item.date}</span>
                </div>

                <p className="text-slate-100 text-sm font-medium">"{item.text}"</p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-slate-400" />
                    {item.channel}
                  </span>
                  {item.feature && (
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      {item.feature}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.01] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/15 transition-all cursor-pointer"
          >
            Close Evidence View
          </button>
        </div>
      </div>
    </div>
  );
};
