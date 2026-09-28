import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Plus,
  Calendar,
  Tag,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { Release } from '../types';

export const ReleasesPage: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New release form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [featuresStr, setFeaturesStr] = useState('Checkout, Payment Gateway');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadReleases();
  }, []);

  const loadReleases = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReleases();
      setReleases(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const features = featuresStr.split(',').map((f) => f.trim()).filter(Boolean);
      await api.createRelease({
        name,
        description,
        release_date: new Date(releaseDate).toISOString(),
        features,
      });
      setIsAddOpen(false);
      setName('');
      setDescription('');
      loadReleases();
    } catch (err: any) {
      alert(err.message || 'Failed to create release');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Product Release Correlation</h2>
          <p className="text-xs text-slate-400">
            Compare customer sentiment before vs after product releases to evaluate potential correlations
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 shadow-md shadow-cyan-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Release</span>
        </button>
      </div>

      {/* Cautious Correlation Disclaimer */}
      <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-2.5 text-xs text-indigo-300">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
        <p className="leading-relaxed">
          <strong>Methodology Note:</strong> Correlation analysis compares 14-day pre-release vs 14-day post-release customer feedback.
          Statistical spikes reflect temporal correlation and possible relationships rather than proven sole causation.
        </p>
      </div>

      {/* Add Release Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#121522] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-200">
            <h3 className="font-semibold text-base text-white">Register Product Release</h3>

            <form onSubmit={handleCreateRelease} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Release Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. v2.5 - Checkout Redesign & One-Click Pay"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Release Date</label>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Features Modified (comma separated)</label>
                <input
                  type="text"
                  value={featuresStr}
                  onChange={(e) => setFeaturesStr(e.target.value)}
                  placeholder="e.g. Checkout, Payment Gateway, One-Click Pay"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Key release highlights..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Calculating Impact...' : 'Save & Calculate Impact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Releases List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>Calculating release correlations...</span>
          </div>
        ) : releases.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#121522] border border-white/10 text-center space-y-2">
            <Rocket className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No Releases Registered</h4>
            <p className="text-xs text-slate-500">Register a release to compare feedback before and after.</p>
          </div>
        ) : (
          releases.map((rel) => {
            const hasSpike = rel.volume_change_percentage >= 25.0 && rel.negative_rate_after > rel.negative_rate_before;
            return (
              <div
                key={rel.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#121522] border border-white/10 space-y-4 shadow-lg hover:border-white/20 transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
                      <Rocket className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-white">{rel.name}</h3>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-emerald-400" />
                        Released on {new Date(rel.release_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {hasSpike && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 self-start sm:self-auto">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Possible Feedback Spike Detected</span>
                    </span>
                  )}
                </div>

                {rel.description && (
                  <p className="text-xs text-slate-300 max-w-2xl">{rel.description}</p>
                )}

                {/* Features Tagged */}
                {rel.features && rel.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rel.features.map((f, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5 flex items-center gap-1"
                      >
                        <Tag className="w-2.5 h-2.5 text-cyan-400" />
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                {/* Comparison Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-white/5">
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase">Pre-Release (14d)</span>
                    <span className="font-mono font-bold text-slate-200 text-sm block">
                      {rel.pre_release_count} items
                    </span>
                    <span className="text-[10px] text-slate-500">{rel.negative_rate_before}% negative</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase">Post-Release (14d)</span>
                    <span className="font-mono font-bold text-white text-sm block">
                      {rel.post_release_count} items
                    </span>
                    <span className="text-[10px] text-rose-400 font-semibold">{rel.negative_rate_after}% negative</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase">Volume Shift</span>
                    <span
                      className={`font-mono font-bold text-sm block ${
                        rel.volume_change_percentage > 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {rel.volume_change_percentage > 0 ? `+${rel.volume_change_percentage}%` : `${rel.volume_change_percentage}%`}
                    </span>
                    <span className="text-[10px] text-slate-500">Mentions delta</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase">Top Friction Area</span>
                    <span className="font-semibold text-cyan-300 text-sm block truncate">
                      {rel.top_affected_features[0]?.feature || 'None'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {rel.top_affected_features[0]?.count || 0} post-release reports
                    </span>
                  </div>
                </div>

                {/* AI Correlation Insight */}
                {rel.correlation_insight && (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{rel.correlation_insight}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
