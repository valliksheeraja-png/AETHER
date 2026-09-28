import {
  Feedback,
  Issue,
  IssueDetail,
  Release,
  DashboardStats,
  EmergingIssue,
  TopTheme,
  SentimentTrendPoint,
  SimilarFeedbackItem
} from '../types';

const API_BASE = '/api';

export const api = {
  // System & Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getSystemStatus() {
    const res = await fetch(`${API_BASE}/system/status`);
    return res.json();
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  async getEmergingIssues(limit: number = 5): Promise<EmergingIssue[]> {
    const res = await fetch(`${API_BASE}/dashboard/emerging-issues?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch emerging issues');
    return res.json();
  },

  async getSentimentTrends(days: number = 30): Promise<SentimentTrendPoint[]> {
    const res = await fetch(`${API_BASE}/dashboard/trends?days=${days}`);
    if (!res.ok) throw new Error('Failed to fetch sentiment trends');
    return res.json();
  },

  async getTopThemes(limit: number = 6): Promise<TopTheme[]> {
    const res = await fetch(`${API_BASE}/dashboard/top-themes?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch top themes');
    return res.json();
  },

  async getDashboardInsight(): Promise<{ insight: string; is_demo_mode: boolean; generated_at: string }> {
    const res = await fetch(`${API_BASE}/dashboard/insight`);
    if (!res.ok) throw new Error('Failed to fetch dashboard insight');
    return res.json();
  },

  // Feedback
  async getFeedbacks(params?: {
    channel?: string;
    sentiment?: string;
    issue_id?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Feedback[]> {
    const query = new URLSearchParams();
    if (params?.channel && params.channel !== 'All') query.append('channel', params.channel);
    if (params?.sentiment && params.sentiment !== 'All') query.append('sentiment', params.sentiment);
    if (params?.issue_id) query.append('issue_id', params.issue_id.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    const res = await fetch(`${API_BASE}/feedback?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch feedbacks');
    return res.json();
  },

  async getFeedback(id: number): Promise<Feedback> {
    const res = await fetch(`${API_BASE}/feedback/${id}`);
    if (!res.ok) throw new Error('Failed to fetch feedback details');
    return res.json();
  },

  async createFeedback(payload: {
    text: string;
    channel: string;
    customer_id?: string;
    product?: string;
    feature?: string;
    date?: string;
  }): Promise<Feedback> {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to add feedback');
    return res.json();
  },

  async deleteFeedback(id: number): Promise<{ message: string; id: number }> {
    const res = await fetch(`${API_BASE}/feedback/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete feedback');
    return res.json();
  },

  async uploadCsv(file: File): Promise<{ message: string; processed_count: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/feedback/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to upload CSV');
    }
    return res.json();
  },

  // Issues
  async getIssues(params?: {
    status?: string;
    category?: string;
    sort_by?: string;
  }): Promise<Issue[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.sort_by) query.append('sort_by', params.sort_by);

    const res = await fetch(`${API_BASE}/issues?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch issues');
    return res.json();
  },

  async getIssueDetail(id: number): Promise<IssueDetail> {
    const res = await fetch(`${API_BASE}/issues/${id}`);
    if (!res.ok) throw new Error('Failed to fetch issue detail');
    return res.json();
  },

  // Memory
  async getSimilarFeedback(feedbackId: number, limit: number = 5): Promise<{
    target_feedback_id: number;
    target_text: string;
    similar_feedback: SimilarFeedbackItem[];
  }> {
    const res = await fetch(`${API_BASE}/memory/similar/${feedbackId}?n_results=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch similar feedback');
    return res.json();
  },

  async getMemoryGraph(limitIssues: number = 8) {
    const res = await fetch(`${API_BASE}/memory/graph?limit_issues=${limitIssues}`);
    if (!res.ok) throw new Error('Failed to fetch memory graph');
    return res.json();
  },

  // AI Analyst
  async chatWithAnalyst(query: string) {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Failed to generate analyst response');
    return res.json();
  },

  // Releases
  async getReleases(): Promise<Release[]> {
    const res = await fetch(`${API_BASE}/releases`);
    if (!res.ok) throw new Error('Failed to fetch releases');
    return res.json();
  },

  async createRelease(payload: {
    name: string;
    description?: string;
    release_date: string;
    features: string[];
  }): Promise<Release> {
    const res = await fetch(`${API_BASE}/releases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create release');
    return res.json();
  },

  // Seed / Reset Demo Data
  async reseedDemoData(force: boolean = true) {
    const res = await fetch(`${API_BASE}/seed/demo-data?force=${force}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reseed demo data');
    return res.json();
  }
};
