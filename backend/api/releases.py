import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from backend.database.db import get_db
from backend.models.models import Release, Feedback
from backend.schemas.schemas import ReleaseCreate, ReleaseResponse

router = APIRouter(prefix="/api/releases", tags=["Releases"])

def calculate_release_impact(release: Release, db: Session, window_days: int = 14) -> dict:
    rel_date = release.release_date
    window = datetime.timedelta(days=window_days)

    pre_start = rel_date - window
    post_end = rel_date + window

    pre_count = db.query(func.count(Feedback.id)).filter(
        Feedback.date >= pre_start,
        Feedback.date < rel_date
    ).scalar() or 0

    post_count = db.query(func.count(Feedback.id)).filter(
        Feedback.date >= rel_date,
        Feedback.date <= post_end
    ).scalar() or 0

    pre_neg = db.query(func.count(Feedback.id)).filter(
        Feedback.date >= pre_start,
        Feedback.date < rel_date,
        Feedback.sentiment == "negative"
    ).scalar() or 0

    post_neg = db.query(func.count(Feedback.id)).filter(
        Feedback.date >= rel_date,
        Feedback.date <= post_end,
        Feedback.sentiment == "negative"
    ).scalar() or 0

    pre_neg_rate = round((pre_neg / max(pre_count, 1)) * 100.0, 1)
    post_neg_rate = round((post_neg / max(post_count, 1)) * 100.0, 1)

    diff = post_count - pre_count
    volume_change_pct = round((diff / max(pre_count, 1)) * 100.0, 1)

    # Top affected features in the post period
    top_features_q = db.query(
        Feedback.feature,
        func.count(Feedback.id).label("cnt")
    ).filter(
        Feedback.date >= rel_date,
        Feedback.date <= post_end
    ).group_by(Feedback.feature).order_by(desc("cnt")).limit(4).all()

    top_affected = [{"feature": f[0], "count": f[1]} for f in top_features_q if f[0]]

    # Correlation insight with non-causation phrasing
    if volume_change_pct >= 25.0 and post_neg_rate > pre_neg_rate:
        insight = (
            f"Possible feedback spike after this release. Incoming customer comments grew by {volume_change_pct:+.1f}%, "
            f"and negative sentiment proportion increased from {pre_neg_rate}% to {post_neg_rate}%. "
            f"Observed temporal alignment suggests a potential correlation with updated features."
        )
    elif post_neg_rate < pre_neg_rate:
        insight = (
            f"Positive stability post-release. Negative sentiment decreased from {pre_neg_rate}% to {post_neg_rate}%, "
            f"suggesting favorable reception of release changes."
        )
    else:
        insight = (
            f"Feedback volume remained consistent ({volume_change_pct:+.1f}% shift) within normal baseline variation."
        )

    features_list = json.loads(release.features) if release.features else []

    return {
        "id": release.id,
        "name": release.name,
        "description": release.description,
        "release_date": release.release_date,
        "features": features_list,
        "created_at": release.created_at,
        "pre_release_count": pre_count,
        "post_release_count": post_count,
        "volume_change_percentage": volume_change_pct,
        "negative_rate_before": pre_neg_rate,
        "negative_rate_after": post_neg_rate,
        "correlation_insight": insight,
        "top_affected_features": top_affected
    }

@router.post("", response_model=ReleaseResponse)
def create_release(payload: ReleaseCreate, db: Session = Depends(get_db)):
    rel = Release(
        name=payload.name,
        description=payload.description,
        release_date=payload.release_date,
        features=json.dumps(payload.features or []),
        created_at=datetime.datetime.utcnow()
    )
    db.add(rel)
    db.commit()
    db.refresh(rel)

    impact = calculate_release_impact(rel, db)
    return ReleaseResponse(**impact)

@router.get("", response_model=List[ReleaseResponse])
def list_releases(db: Session = Depends(get_db)):
    releases = db.query(Release).order_by(desc(Release.release_date)).all()
    results = []
    for rel in releases:
        impact = calculate_release_impact(rel, db)
        results.append(ReleaseResponse(**impact))
    return results

@router.get("/{release_id}", response_model=ReleaseResponse)
def get_release(release_id: int, db: Session = Depends(get_db)):
    rel = db.query(Release).filter(Release.id == release_id).first()
    if not rel:
        raise HTTPException(status_code=404, detail="Release not found")

    impact = calculate_release_impact(rel, db)
    return ReleaseResponse(**impact)
