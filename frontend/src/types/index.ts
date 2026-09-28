export interface Feedback {
  id: number;
  text: string;
  channel: string;
  customer_id?: string;
  product: string;
  feature: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentiment_score: number;
  topic: string;
  product_area: string;
  issue_id?: number;
  issue_title?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  intent: string;
  keywords: string[];
  summary?: string;
  created_at: string;
}

export interface Issue {
  id: number;
  title: string;
  description?: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'New' | 'Emerging' | 'Recurring' | 'Monitoring' | 'Resolved' | 'Active';
  total_mentions: number;
  first_detected: string;
  last_detected: string;
  trend_percentage: number;
  created_at: string;
  updated_at: string;
  channels?: Record<string, number>;
}

export interface IssueDetail extends Issue {
  timeline: { date: string; mentions: number }[];
  representative_feedback: Feedback[];
  channel_distribution: Record<string, number>;
  related_features: string[];
  previous_period_mentions: number;
  current_period_mentions: number;
  growth_rate: number;
}

export interface Release {
  id: number;
  name: string;
  description?: string;
  release_date: string;
  features: string[];
  created_at: string;
  pre_release_count: number;
  post_release_count: number;
  volume_change_percentage: number;
  negative_rate_before: number;
  negative_rate_after: number;
  correlation_insight: string;
  top_affected_features: { feature: string; count: number }[];
}

export interface DashboardStats {
  total_feedback: number;
  active_issues: number;
  emerging_issues: number;
  positive_percentage: number;
  negative_percentage: number;
  neutral_percentage: number;
  total_positive: number;
  total_negative: number;
  total_neutral: number;
  is_demo_mode: boolean;
}

export interface EmergingIssue {
  id: number;
  title: string;
  severity: string;
  total_mentions: number;
  current_mentions: number;
  previous_mentions: number;
  growth_percentage: number;
  channels: string[];
  sample_quote: string;
}

export interface TopTheme {
  name: string;
  count: number;
  sentiment_score: number;
  trend: string;
}

export interface SentimentTrendPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface FeedbackEvidence {
  id: number;
  text: string;
  channel: string;
  date: string;
  sentiment: string;
  issue_title?: string;
  feature?: string;
  similarity_score?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  metrics?: Record<string, any>;
  evidence?: FeedbackEvidence[];
  suggested_followups?: string[];
  timestamp: string;
  is_demo_mode?: boolean;
}

export interface SimilarFeedbackItem {
  feedback_id: number;
  text: string;
  similarity_score: number;
  channel: string;
  date: string;
  sentiment: string;
  issue_title?: string;
  feature: string;
}
