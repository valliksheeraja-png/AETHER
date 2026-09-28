import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Feedback Schemas
class FeedbackCreate(BaseModel):
    text: str = Field(..., description="Customer feedback verbatim")
    channel: str = Field(..., description="Channel: Customer Review, Support Ticket, Survey, Email, Social Media, App Feedback, Interview")
    customer_id: Optional[str] = None
    product: Optional[str] = "ShopApp"
    feature: Optional[str] = "General"
    date: Optional[datetime.datetime] = None

class FeedbackResponse(BaseModel):
    id: int
    text: str
    channel: str
    customer_id: Optional[str] = None
    product: str
    feature: str
    date: datetime.datetime
    sentiment: str
    sentiment_score: float
    topic: str
    product_area: str
    issue_id: Optional[int] = None
    issue_title: Optional[str] = None
    severity: str
    intent: str
    keywords: List[str] = []
    summary: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Issue Schemas
class IssueResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: str
    severity: str
    status: str
    total_mentions: int
    first_detected: datetime.datetime
    last_detected: datetime.datetime
    trend_percentage: float
    created_at: datetime.datetime
    updated_at: datetime.datetime
    channels: Optional[Dict[str, int]] = None

    class Config:
        from_attributes = True

class IssueDetailResponse(IssueResponse):
    timeline: List[Dict[str, Any]] = []
    representative_feedback: List[FeedbackResponse] = []
    channel_distribution: Dict[str, int] = {}
    related_features: List[str] = []
    previous_period_mentions: int = 0
    current_period_mentions: int = 0
    growth_rate: float = 0.0

# Release Schemas
class ReleaseCreate(BaseModel):
    name: str
    description: Optional[str] = None
    release_date: datetime.datetime
    features: List[str] = []

class ReleaseResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    release_date: datetime.datetime
    features: List[str] = []
    created_at: datetime.datetime
    pre_release_count: int = 0
    post_release_count: int = 0
    volume_change_percentage: float = 0.0
    negative_rate_before: float = 0.0
    negative_rate_after: float = 0.0
    correlation_insight: str = ""
    top_affected_features: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True

# AI Analysis
class AIAnalysisRequest(BaseModel):
    text: str
    channel: Optional[str] = "Customer Review"
    product: Optional[str] = "ShopApp"
    feature: Optional[str] = "General"

class AIAnalysisResponse(BaseModel):
    sentiment: str
    sentiment_score: float
    topic: str
    product_area: str
    feature: str
    issue: str
    severity: str
    intent: str
    keywords: List[str]
    summary: str
    is_demo_mode: bool = False

# AI Chat & Evidence
class AIChatRequest(BaseModel):
    query: str
    conversation_history: Optional[List[Dict[str, str]]] = None

class FeedbackEvidence(BaseModel):
    id: int
    text: str
    channel: str
    date: str
    sentiment: str
    issue_title: Optional[str] = None
    feature: Optional[str] = None
    similarity_score: Optional[float] = None

class AIChatResponse(BaseModel):
    answer: str
    metrics: Dict[str, Any] = {}
    evidence: List[FeedbackEvidence] = []
    suggested_followups: List[str] = []
    is_demo_mode: bool = False

# Dashboard Schemas
class DashboardStatsResponse(BaseModel):
    total_feedback: int
    active_issues: int
    emerging_issues: int
    positive_percentage: float
    negative_percentage: float
    neutral_percentage: float
    total_positive: int
    total_negative: int
    total_neutral: int
    is_demo_mode: bool

class EmergingIssueItem(BaseModel):
    id: int
    title: str
    severity: str
    total_mentions: int
    current_mentions: int
    previous_mentions: int
    growth_percentage: float
    channels: List[str]
    sample_quote: str

class TopThemeItem(BaseModel):
    name: str
    count: int
    sentiment_score: float
    trend: str

class SentimentTrendPoint(BaseModel):
    date: str
    positive: int
    neutral: int
    negative: int
    total: int

class MemoryNode(BaseModel):
    id: str
    label: str
    type: str  # feedback, issue, feature, channel
    details: Optional[Dict[str, Any]] = None

class MemoryLink(BaseModel):
    source: str
    target: str
    similarity: float
    relationship: str
