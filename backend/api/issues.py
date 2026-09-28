import datetime
import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from backend.database.db import get_db
from backend.models.models import Issue, Feedback, FeedbackIssueRelationship
from backend.schemas.schemas import IssueResponse, IssueDetailResponse, FeedbackResponse
from backend.services.trend_service import trend_service

router = APIRouter(prefix="/api/issues", tags=["Issues"])

@router.get("", response_model=List[IssueResponse])
def list_issues(
    status: Optional[str] = None,
    category: Optional[str] = None,
    sort_by: Optional[str] = "mentions",  # mentions, growth, recent
    db: Session = Depends(get_db)
):
    query = db.query(Issue)

    if status and status != "All":
        query = query.filter(Issue.status == status)
    if category and category != "All":
        query = query.filter(Issue.category == category)

    if sort_by == "growth":
        query = query.order_by(desc(Issue.trend_percentage))
    elif sort_by == "recent":
        query = query.order_by(desc(Issue.last_detected))
    else:
        query = query.order_by(desc(Issue.total_mentions))

    issues = query.all()

    results = []
    for iss in issues:
        # Channel breakdown
        ch_counts = db.query(
            Feedback.channel,
            func.count(Feedback.id)
        ).filter(Feedback.issue_id == iss.id).group_by(Feedback.channel).all()
        channels_dict = {c[0]: c[1] for c in ch_counts}

        results.append(IssueResponse(
            id=iss.id,
            title=iss.title,
            description=iss.description,
            category=iss.category,
            severity=iss.severity,
            status=iss.status,
            total_mentions=iss.total_mentions or 0,
            first_detected=iss.first_detected,
            last_detected=iss.last_detected,
            trend_percentage=iss.trend_percentage or 0.0,
            created_at=iss.created_at,
            updated_at=iss.updated_at,
            channels=channels_dict
        ))
    return results

@router.get("/{issue_id}", response_model=IssueDetailResponse)
def get_issue_detail(issue_id: int, db: Session = Depends(get_db)):
    iss = db.query(Issue).filter(Issue.id == issue_id).first()
    if not iss:
        raise HTTPException(status_code=404, detail="Issue not found")

    # Channel distribution
    ch_counts = db.query(
        Feedback.channel,
        func.count(Feedback.id)
    ).filter(Feedback.issue_id == iss.id).group_by(Feedback.channel).all()
    channel_distribution = {c[0]: c[1] for c in ch_counts}

    # Timeline (group mentions by date)
    feedbacks = db.query(Feedback).filter(Feedback.issue_id == iss.id).order_by(Feedback.date.asc()).all()

    timeline_buckets: Dict[str, int] = {}
    for fb in feedbacks:
        ds = fb.date.strftime("%b %d")
        timeline_buckets[ds] = timeline_buckets.get(ds, 0) + 1

    timeline = [{"date": k, "mentions": v} for k, v in timeline_buckets.items()]

    # Representative feedback (up to 8, sorted by sentiment_score/date)
    rep_feedbacks = []
    for fb in sorted(feedbacks, key=lambda x: (x.sentiment == "negative", x.sentiment_score), reverse=True)[:8]:
        kw = json.loads(fb.keywords) if fb.keywords else []
        rep_feedbacks.append(FeedbackResponse(
            id=fb.id,
            text=fb.text,
            channel=fb.channel,
            customer_id=fb.customer_id,
            product=fb.product,
            feature=fb.feature,
            date=fb.date,
            sentiment=fb.sentiment,
            sentiment_score=fb.sentiment_score,
            topic=fb.topic,
            product_area=fb.product_area,
            issue_id=fb.issue_id,
            issue_title=iss.title,
            severity=fb.severity,
            intent=fb.intent,
            keywords=kw,
            summary=fb.summary,
            created_at=fb.created_at
        ))

    # Related features
    features_query = db.query(Feedback.feature).filter(Feedback.issue_id == iss.id).distinct().all()
    related_features = [f[0] for f in features_query if f[0]]

    # Period-over-period mentions
    latest_fb = db.query(func.max(Feedback.date)).scalar() or datetime.datetime.utcnow()
    current_start = latest_fb - datetime.timedelta(days=14)
    previous_start = current_start - datetime.timedelta(days=14)

    curr_m = db.query(func.count(Feedback.id)).filter(
        Feedback.issue_id == iss.id,
        Feedback.date >= current_start
    ).scalar() or 0

    prev_m = db.query(func.count(Feedback.id)).filter(
        Feedback.issue_id == iss.id,
        Feedback.date >= previous_start,
        Feedback.date < current_start
    ).scalar() or 0

    return IssueDetailResponse(
        id=iss.id,
        title=iss.title,
        description=iss.description,
        category=iss.category,
        severity=iss.severity,
        status=iss.status,
        total_mentions=iss.total_mentions or 0,
        first_detected=iss.first_detected,
        last_detected=iss.last_detected,
        trend_percentage=iss.trend_percentage or 0.0,
        created_at=iss.created_at,
        updated_at=iss.updated_at,
        timeline=timeline,
        representative_feedback=rep_feedbacks,
        channel_distribution=channel_distribution,
        related_features=related_features,
        previous_period_mentions=prev_m,
        current_period_mentions=curr_m,
        growth_rate=iss.trend_percentage or 0.0
    )
