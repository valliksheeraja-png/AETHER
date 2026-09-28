from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.models.models import Feedback, Issue
from backend.services.memory_service import memory_service

router = APIRouter(prefix="/api/memory", tags=["Memory"])

@router.get("/similar/{feedback_id}")
def get_similar_feedback(feedback_id: int, n_results: int = Query(5, ge=1, le=20), db: Session = Depends(get_db)):
    """
    Retrieves semantically similar historical feedback for a given feedback item.
    Demonstrates persistent AI memory across channels and time.
    """
    target = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Feedback not found")

    matches = memory_service.get_similar_for_feedback_id(feedback_id, n_results=n_results)

    results = []
    for m in matches:
        fb_item = db.query(Feedback).filter(Feedback.id == m["feedback_id"]).first()
        results.append({
            "feedback_id": m["feedback_id"],
            "text": m["text"],
            "similarity_score": m["similarity"],
            "channel": fb_item.channel if fb_item else m["metadata"].get("channel", "Unknown"),
            "date": fb_item.date.strftime("%Y-%m-%d") if fb_item else m["metadata"].get("date", ""),
            "sentiment": fb_item.sentiment if fb_item else m["metadata"].get("sentiment", "neutral"),
            "issue_title": fb_item.issue.title if (fb_item and fb_item.issue) else m["metadata"].get("issue_title"),
            "feature": fb_item.feature if fb_item else m["metadata"].get("feature", "General")
        })

    return {
        "target_feedback_id": feedback_id,
        "target_text": target.text,
        "similar_feedback": results
    }

@router.get("/graph")
def get_memory_graph(limit_issues: int = Query(8, ge=2, le=20), db: Session = Depends(get_db)):
    """
    Returns the node-link graph showing:
    Feedback -> Related Feedback -> Issue -> Channel
    for the Visual Memory Explorer page.
    """
    return memory_service.get_memory_graph_data(db, limit_issues=limit_issues)
