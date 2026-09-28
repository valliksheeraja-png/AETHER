import io
import csv
import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.database.db import get_db
from backend.models.models import Feedback, Issue, FeedbackIssueRelationship
from backend.schemas.schemas import FeedbackCreate, FeedbackResponse
from backend.services.ai_service import ai_service
from backend.services.memory_service import memory_service
from backend.services.trend_service import trend_service

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackResponse)
async def create_feedback(payload: FeedbackCreate, db: Session = Depends(get_db)):
    """
    1. Analyze feedback with Gemini / Demo AI.
    2. Extract structured information.
    3. Generate embedding.
    4. Search vector memory.
    5. Find similar feedback.
    6. Determine related issue (link or create).
    7. Store feedback and relationship.
    8. Update dashboard statistics.
    """
    fb_date = payload.date or datetime.datetime.utcnow()

    # Step 1 & 2: AI Analysis
    ai_result = await ai_service.analyze_feedback(
        text=payload.text,
        channel=payload.channel,
        product=payload.product or "ShopApp",
        feature=payload.feature or "General"
    )

    # Step 3: Generate Embedding
    embedding = await ai_service.generate_embedding(payload.text)

    # Create temporary feedback model
    feedback = Feedback(
        text=payload.text,
        channel=payload.channel,
        customer_id=payload.customer_id,
        product=payload.product or "ShopApp",
        feature=ai_result.get("feature") or payload.feature or "General",
        date=fb_date,
        sentiment=ai_result.get("sentiment", "neutral"),
        sentiment_score=ai_result.get("sentiment_score", 0.5),
        topic=ai_result.get("topic", "General"),
        product_area=ai_result.get("product_area", "Core"),
        severity=ai_result.get("severity", "medium"),
        intent=ai_result.get("intent", "complaint"),
        keywords=json.dumps(ai_result.get("keywords", [])),
        summary=ai_result.get("summary", ""),
        created_at=datetime.datetime.utcnow()
    )
    db.add(feedback)
    db.flush()

    # Step 4, 5, 6: Connect with Persistent Vector Memory
    related_issue, similarity_score, similar_items = memory_service.determine_related_issue(
        feedback_id=feedback.id,
        feedback_text=feedback.text,
        embedding=embedding,
        ai_extracted=ai_result,
        db=db
    )

    if related_issue:
        feedback.issue_id = related_issue.id

    # Persist vector embedding in memory engine
    memory_service.add_vector(
        feedback_id=feedback.id,
        text=feedback.text,
        embedding=embedding,
        metadata={
            "issue_id": feedback.issue_id,
            "issue_title": related_issue.title if related_issue else None,
            "channel": feedback.channel,
            "sentiment": feedback.sentiment,
            "date": feedback.date.isoformat(),
            "feature": feedback.feature
        }
    )

    db.commit()
    db.refresh(feedback)

    # Step 8: Recalculate trends
    trend_service.recalculate_all_trends(db)

    # Prepare response
    keywords_list = json.loads(feedback.keywords) if feedback.keywords else []
    return FeedbackResponse(
        id=feedback.id,
        text=feedback.text,
        channel=feedback.channel,
        customer_id=feedback.customer_id,
        product=feedback.product,
        feature=feedback.feature,
        date=feedback.date,
        sentiment=feedback.sentiment,
        sentiment_score=feedback.sentiment_score,
        topic=feedback.topic,
        product_area=feedback.product_area,
        issue_id=feedback.issue_id,
        issue_title=related_issue.title if related_issue else None,
        severity=feedback.severity,
        intent=feedback.intent,
        keywords=keywords_list,
        summary=feedback.summary,
        created_at=feedback.created_at
    )

@router.get("", response_model=List[FeedbackResponse])
def list_feedback(
    channel: Optional[str] = None,
    sentiment: Optional[str] = None,
    issue_id: Optional[int] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Feedback)

    if channel and channel != "All":
        query = query.filter(Feedback.channel == channel)
    if sentiment and sentiment != "All":
        query = query.filter(Feedback.sentiment == sentiment.lower())
    if issue_id:
        query = query.filter(Feedback.issue_id == issue_id)
    if search:
        query = query.filter(Feedback.text.ilike(f"%{search}%"))

    items = query.order_by(desc(Feedback.date)).offset(offset).limit(limit).all()

    results = []
    for fb in items:
        kw = json.loads(fb.keywords) if fb.keywords else []
        results.append(FeedbackResponse(
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
            issue_title=fb.issue.title if fb.issue else None,
            severity=fb.severity,
            intent=fb.intent,
            keywords=kw,
            summary=fb.summary,
            created_at=fb.created_at
        ))
    return results

@router.get("/{feedback_id}", response_model=FeedbackResponse)
def get_feedback(feedback_id: int, db: Session = Depends(get_db)):
    fb = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")

    kw = json.loads(fb.keywords) if fb.keywords else []
    return FeedbackResponse(
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
        issue_title=fb.issue.title if fb.issue else None,
        severity=fb.severity,
        intent=fb.intent,
        keywords=kw,
        summary=fb.summary,
        created_at=fb.created_at
    )

@router.delete("/{feedback_id}")
def delete_feedback(feedback_id: int, db: Session = Depends(get_db)):
    fb = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")

    issue = fb.issue
    if issue and issue.total_mentions:
        issue.total_mentions = max(0, issue.total_mentions - 1)

    db.delete(fb)
    db.commit()

    memory_service.remove_vector(feedback_id)
    return {"message": "Feedback deleted successfully", "id": feedback_id}

@router.post("/upload")
async def upload_feedback_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    CSV feedback bulk ingestion:
    Expected columns: feedback, channel, date, product, customer_id, feature
    Validates, extracts AI properties, embeds, creates issue relationships and updates trends.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    content = await file.read()
    decoded = content.decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(decoded))

    required_cols = {"feedback"}
    if not reader.fieldnames or not required_cols.issubset(set(col.strip().lower() for col in reader.fieldnames)):
        raise HTTPException(status_code=400, detail="CSV must contain at least a 'feedback' column.")

    created_count = 0
    vector_batch = []

    for row in reader:
        # Standardize keys to lowercase
        normalized = {k.strip().lower(): v.strip() for k, v in row.items() if k}
        text = normalized.get("feedback")
        if not text:
            continue

        channel = normalized.get("channel") or "Customer Review"
        product = normalized.get("product") or "ShopApp"
        feature = normalized.get("feature") or "General"
        cust_id = normalized.get("customer_id")
        date_str = normalized.get("date")

        try:
            fb_date = datetime.datetime.fromisoformat(date_str) if date_str else datetime.datetime.utcnow()
        except Exception:
            fb_date = datetime.datetime.utcnow()

        ai_res = await ai_service.analyze_feedback(text=text, channel=channel, product=product, feature=feature)
        embedding = await ai_service.generate_embedding(text)

        fb = Feedback(
            text=text,
            channel=channel,
            customer_id=cust_id,
            product=product,
            feature=ai_res.get("feature") or feature,
            date=fb_date,
            sentiment=ai_res.get("sentiment", "neutral"),
            sentiment_score=ai_res.get("sentiment_score", 0.5),
            topic=ai_res.get("topic", "General"),
            product_area=ai_res.get("product_area", "Core"),
            severity=ai_res.get("severity", "medium"),
            intent=ai_res.get("intent", "complaint"),
            keywords=json.dumps(ai_res.get("keywords", [])),
            summary=ai_res.get("summary", ""),
            created_at=datetime.datetime.utcnow()
        )
        db.add(fb)
        db.flush()

        related_issue, sim_score, _ = memory_service.determine_related_issue(
            feedback_id=fb.id,
            feedback_text=text,
            embedding=embedding,
            ai_extracted=ai_res,
            db=db
        )
        if related_issue:
            fb.issue_id = related_issue.id

        vector_batch.append({
            "feedback_id": fb.id,
            "text": text,
            "embedding": embedding,
            "metadata": {
                "issue_id": fb.issue_id,
                "issue_title": related_issue.title if related_issue else None,
                "channel": channel,
                "sentiment": fb.sentiment,
                "date": fb.date.isoformat(),
                "feature": fb.feature
            }
        })
        created_count += 1

    memory_service.batch_add_vectors(vector_batch)
    db.commit()
    trend_service.recalculate_all_trends(db)

    return {
        "message": f"Successfully processed and embedded {created_count} feedback records.",
        "processed_count": created_count
    }
