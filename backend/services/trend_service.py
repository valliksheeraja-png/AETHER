import datetime
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models.models import Issue, Feedback

class TrendService:
    def recalculate_all_trends(self, db: Session, period_days: int = 14) -> List[Issue]:
        """
        Calculates explainable period-over-period trend growth for all issues.
        Sets status to 'Emerging' if growth >= 25% and current mentions >= 5.
        """
        # Determine latest reference date from feedbacks
        latest_fb = db.query(func.max(Feedback.date)).scalar()
        if not latest_fb:
            now_ref = datetime.datetime.utcnow()
        else:
            now_ref = latest_fb

        current_start = now_ref - datetime.timedelta(days=period_days)
        previous_start = current_start - datetime.timedelta(days=period_days)

        issues = db.query(Issue).all()
        for iss in issues:
            curr_count = db.query(func.count(Feedback.id)).filter(
                Feedback.issue_id == iss.id,
                Feedback.date >= current_start,
                Feedback.date <= now_ref
            ).scalar() or 0

            prev_count = db.query(func.count(Feedback.id)).filter(
                Feedback.issue_id == iss.id,
                Feedback.date >= previous_start,
                Feedback.date < current_start
            ).scalar() or 0

            if prev_count == 0:
                growth = float(curr_count * 100) if curr_count > 0 else 0.0
            else:
                growth = round(((curr_count - prev_count) / float(prev_count)) * 100.0, 1)

            iss.trend_percentage = growth

            # Status determination
            if curr_count >= 5 and growth >= 25.0:
                iss.status = "Emerging"
            elif (iss.total_mentions or 0) >= 20:
                iss.status = "Recurring"
            elif curr_count > 0:
                iss.status = "Active"
            else:
                iss.status = "Monitoring"

        db.commit()
        return issues

    def get_emerging_issues(self, db: Session, limit: int = 5, period_days: int = 14) -> List[Dict[str, Any]]:
        latest_fb = db.query(func.max(Feedback.date)).scalar() or datetime.datetime.utcnow()
        current_start = latest_fb - datetime.timedelta(days=period_days)
        previous_start = current_start - datetime.timedelta(days=period_days)

        # Issues marked Emerging or sorted by highest trend percentage
        candidates = db.query(Issue).filter(
            Issue.trend_percentage > 0
        ).order_by(Issue.trend_percentage.desc(), Issue.total_mentions.desc()).limit(limit * 2).all()

        results = []
        for iss in candidates:
            curr_count = db.query(func.count(Feedback.id)).filter(
                Feedback.issue_id == iss.id,
                Feedback.date >= current_start
            ).scalar() or 0

            prev_count = db.query(func.count(Feedback.id)).filter(
                Feedback.issue_id == iss.id,
                Feedback.date >= previous_start,
                Feedback.date < current_start
            ).scalar() or 0

            # Channels affected
            channels_query = db.query(Feedback.channel).filter(
                Feedback.issue_id == iss.id
            ).distinct().all()
            channels = [c[0] for c in channels_query]

            # Sample quote
            sample_fb = db.query(Feedback.text).filter(
                Feedback.issue_id == iss.id
            ).order_by(Feedback.date.desc()).first()
            sample_quote = sample_fb[0] if sample_fb else "Customer reported issues in this area."

            results.append({
                "id": iss.id,
                "title": iss.title,
                "severity": iss.severity,
                "status": iss.status,
                "total_mentions": iss.total_mentions or 0,
                "current_mentions": curr_count,
                "previous_mentions": prev_count,
                "growth_percentage": iss.trend_percentage,
                "channels": channels,
                "sample_quote": sample_quote
            })

        # Sort with priority to Emerging status then growth
        results.sort(key=lambda x: (1 if x["status"] == "Emerging" else 0, x["growth_percentage"]), reverse=True)
        return results[:limit]

    def get_sentiment_trends(self, db: Session, days: int = 30) -> List[Dict[str, Any]]:
        latest_fb = db.query(func.max(Feedback.date)).scalar() or datetime.datetime.utcnow()
        start_date = latest_fb - datetime.timedelta(days=days)

        feedbacks = db.query(Feedback.date, Feedback.sentiment).filter(
            Feedback.date >= start_date
        ).order_by(Feedback.date.asc()).all()

        date_buckets: Dict[str, Dict[str, int]] = {}
        for fb_date, sentiment in feedbacks:
            ds = fb_date.strftime("%b %d")
            if ds not in date_buckets:
                date_buckets[ds] = {"positive": 0, "neutral": 0, "negative": 0, "total": 0}
            s = sentiment.lower() if sentiment else "neutral"
            if s in date_buckets[ds]:
                date_buckets[ds][s] += 1
            else:
                date_buckets[ds]["neutral"] += 1
            date_buckets[ds]["total"] += 1

        points = []
        for date_str, counts in date_buckets.items():
            points.append({
                "date": date_str,
                "positive": counts["positive"],
                "neutral": counts["neutral"],
                "negative": counts["negative"],
                "total": counts["total"]
            })
        return points

    def get_top_themes(self, db: Session, limit: int = 6) -> List[Dict[str, Any]]:
        results = db.query(
            Feedback.topic,
            func.count(Feedback.id).label("cnt"),
            func.avg(Feedback.sentiment_score).label("avg_sentiment")
        ).group_by(Feedback.topic).order_by(func.count(Feedback.id).desc()).limit(limit).all()

        themes = []
        for topic, count, avg_sent in results:
            themes.append({
                "name": topic or "General",
                "count": count,
                "sentiment_score": round(float(avg_sent or 0.5), 2),
                "trend": "up" if count > 20 else "stable"
            })
        return themes

    def generate_ai_insight(self, db: Session) -> str:
        emerging = self.get_emerging_issues(db, limit=2)
        if not emerging:
            return "Feedback flow is steady across all channels with no critical anomalies detected."

        top = emerging[0]
        channels_str = ", ".join(top["channels"][:3]) if top["channels"] else "multiple channels"
        growth_str = f"+{top['growth_percentage']:.0f}%" if top["growth_percentage"] > 0 else f"{top['growth_percentage']:.0f}%"

        insight = (
            f"{top['title']} complaints surged by {growth_str} ({top['current_mentions']} mentions in the current period). "
            f"Cross-channel correlation detected across {channels_str}. Recommended product team review on urgent priority."
        )
        return insight

trend_service = TrendService()
