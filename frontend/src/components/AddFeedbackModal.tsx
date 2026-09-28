import React, { useState } from 'react';
import { X, Sparkles, BrainCircuit, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Feedback } from '../types';

interface AddFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newFeedback: Feedback) => void;
}

const CHANNELS = [
  'Customer Review',
  'Support Ticket',
  'Survey',
  'Email',
  'Social Media',
  'App Feedback',
  'Interview',
];

export const AddFeedbackModal: React.FC<AddFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [text, setText] = useState('');
  const [channel, setChannel] = useState('Customer Review');
  const [customerId, setCustomerId] = useState('');
  const [product, setProduct] = useState('ShopApp');
  const [feature, setFeature] = useState('Checkout');
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdFeedback, setCreatedFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Feedback text is required');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const fb = await api.createFeedback({
        text,
        channel,
        customer_id: customerId.trim() || undefined,
        product,
        feature,
      });
      setCreatedFeedback(fb);
      onSuccess(fb);
    } catch (err: any) {
      setError(err.message || 'Failed to ingest feedback');
      setIsProcessing(false);
    }
  };

  const handleResetAndClose = () => {
    setText('');
    setCustomerId('');
    setCreatedFeedback(null);
    setIsProcessing(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-[#121522] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-base">Add Customer Feedback</h2>
              <p className="text-xs text-slate-400">
                AI will extract sentiment, generate embeddings & connect to persistent memory
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {createdFeedback ? (
            /* Success & Memory Connection Reveal Card */
            <div className="space-y-4 animate-scale-up">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-emerald-300">
                    Feedback Ingested & Memory Linked!
                  </h4>
                  <p className="text-xs text-emerald-200/80">
                    "{createdFeedback.text}"
                  </p>
                </div>
              </div>

              {/* Memory Connection Result */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-cyan-500/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                  <BrainCircuit className="w-4 h-4 text-cyan-400" />
                  <span>Persistent Memory Connection</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase">Connected Issue</span>
                    <span className="font-semibold text-white text-sm">
                      {createdFeedback.issue_title || 'General Issue'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase">Sentiment & Polarity</span>
                    <span className={`font-semibold capitalize ${
                      createdFeedback.sentiment === 'positive'
                        ? 'text-emerald-400'
                        : createdFeedback.sentiment === 'negative'
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }`}>
                      {createdFeedback.sentiment} ({Math.round(createdFeedback.sentiment_score * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase">AI Extracted Summary</span>
                  <p className="text-slate-200 mt-0.5">{createdFeedback.summary}</p>
                </div>
              </div>

              <button
                onClick={handleResetAndClose}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <span>Done & View Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              {/* Feedback Text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Feedback Text <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setText("The new checkout is confusing and I can't find where to enter my card.")}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Insert Demo Text
                  </button>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  placeholder="e.g. The new checkout is really confusing and I can't find where to enter my card..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-cyan-400 focus:outline-none text-sm text-slate-200 placeholder:text-slate-500 transition-all"
                />
              </div>

              {/* Channel & Product */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Channel</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                  >
                    {CHANNELS.map((ch) => (
                      <option key={ch} value={ch} className="bg-[#121522]">
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product</label>
                  <input
                    type="text"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Feature & Customer ID */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Feature Area</label>
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => setFeature(e.target.value)}
                    placeholder="e.g. Checkout, Payment, Login"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Customer ID (Optional)</label>
                  <input
                    type="text"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="e.g. cust_9021"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 hover:opacity-90 shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Analyzing & Vector Linking...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Submit & Analyze</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
