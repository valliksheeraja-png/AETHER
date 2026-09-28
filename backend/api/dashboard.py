import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database.db import get_db
from backend.models.models import Feedback, Issue
from backend.schemas.schemas import (
    DashboardStatsResponse,
    EmergingIssueItem,
    TopThemeItem,
    SentimentTrendPoint
)
from backend.services.trend_service import trend_service
from backend.services.ai_service import ai_service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(Feedback.id)).scalar() or 0
    active_issues = db.query(func.count(Issue.id)).filter(Issue.status.in_(["New", "Emerging", "Recurring", "Active"])).scalar() or 0
    emerging_issues = db.query(func.count(Issue.id)).filter(Issue.status == "Emerging").scalar() or 0

    pos_count = db.query(func.count(Feedback.id)).filter(Feedback.sentiment == "positive").scalar() or 0
    neg_count = db.query(func.count(Feedback.id)).filter(Feedback.sentiment == "negative").scalar() or 0
    neu_count = db.query(func.count(Feedback.id)).filter(Feedback.sentiment == "neutral").scalar() or 0

    safe_total = max(total, 1)
    pos_pct = round((pos_count / safe_total) * 100.0, 1)
    neg_pct = round((neg_count / safe_total) * 100.0, 1)
    neu_pct = round((neu_count / safe_total) * 100.0, 1)

    return DashboardStatsResponse(
        total_feedback=total,
        active_issues=active_issues,
        emerging_issues=emerging_issues,
        positive_percentage=pos_pct,
        negative_percentage=neg_pct,
        neutral_percentage=neu_pct,
        total_positive=pos_count,
        total_negative=neg_count,
        total_neutral=neu_count,
        is_demo_mode=ai_service.is_demo_mode
    )

@router.get("/emerging-issues", response_model=List[EmergingIssueItem])
def get_emerging_issues(limit: int = 5, db: Session = Depends(get_db)):
    raw = trend_service.get_emerging_issues(db, limit=limit)
    return [
        EmergingIssueItem(
            id=item["id"],
            title=item["title"],
            severity=item["severity"],
            total_mentions=item["total_mentions"],
            current_mentions=item["current_mentions"],
            previous_mentions=item["previous_mentions"],
            growth_percentage=item["growth_percentage"],
            channels=item["channels"],
            sample_quote=item["sample_quote"]
        )
        for item in raw
    ]

@router.get("/trends", response_model=List[SentimentTrendPoint])
def get_sentiment_trends(days: int = 30, db: Session = Depends(get_db)):
    points = trend_service.get_sentiment_trends(db, days=days)
    return [
        SentimentTrendPoint(
            date=p["date"],
            positive=p["positive"],
            neutral=p["neutral"],
            negative=p["negative"],
            total=p["total"]
        )
        for p in points
    ]

@router.get("/top-themes", response_model=List[TopThemeItem])
def get_top_themes(limit: int = 6, db: Session = Depends(get_db)):
    themes = trend_service.get_top_themes(db, limit=limit)
    return [
        TopThemeItem(
            name=t["name"],
            count=t["count"],
            sentiment_score=t["sentiment_score"],
            trend=t["trend"]
        )
        for t in themes
    ]

@router.get("/insight")
def get_dashboard_insight(db: Session = Depends(get_db)):
    insight_text = trend_service.generate_ai_insight(db)
    return {
        "insight": insight_text,
        "is_demo_mode": ai_service.is_demo_mode,
        "generated_at": datetime.datetime.utcnow().isoformat()
    }
