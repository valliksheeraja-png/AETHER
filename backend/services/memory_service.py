import json
import os
import math
import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session

from backend.config import VECTOR_STORE_PATH
from backend.models.models import Issue, Feedback, FeedbackIssueRelationship

class MemoryService:
    def __init__(self, storage_path: str = VECTOR_STORE_PATH):
        self.storage_path = Path(storage_path)
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        self.vectors: Dict[str, Dict[str, Any]] = {}  # feedback_id -> {text, embedding, metadata}
        self._load()

    def _load(self):
        if self.storage_path.exists():
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    self.vectors = json.load(f)
            except Exception as e:
                print(f"[MemoryService] Warning loading vector store: {e}")
                self.vectors = {}

    def _persist(self):
        try:
            with open(self.storage_path, "w", encoding="utf-8") as f:
                json.dump(self.vectors, f, indent=2)
        except Exception as e:
            print(f"[MemoryService] Warning persisting vector store: {e}")

    def add_vector(self, feedback_id: int, text: str, embedding: List[float], metadata: Optional[Dict[str, Any]] = None):
        """Stores a feedback embedding vector into persistent memory."""
        str_id = str(feedback_id)
        self.vectors[str_id] = {
            "feedback_id": feedback_id,
            "text": text,
            "embedding": embedding,
            "metadata": metadata or {}
        }
        self._persist()

    def batch_add_vectors(self, items: List[Dict[str, Any]]):
        """Batch insert for fast CSV seeding and bulk ingestion."""
        for item in items:
            str_id = str(item["feedback_id"])
            self.vectors[str_id] = {
                "feedback_id": item["feedback_id"],
                "text": item["text"],
                "embedding": item["embedding"],
                "metadata": item.get("metadata", {})
            }
        self._persist()

    def remove_vector(self, feedback_id: int):
        str_id = str(feedback_id)
        if str_id in self.vectors:
            del self.vectors[str_id]
            self._persist()

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot = sum(a * b for a, b in zip(v1, v2))
        norm1 = math.sqrt(sum(a * a for a in v1))
        norm2 = math.sqrt(sum(b * b for b in v2))
        if norm1 == 0 or norm2 == 0:
            return 0.0
        sim = dot / (norm1 * norm2)
        return max(0.0, min(1.0, float(sim)))

    def query(self, query_embedding: List[float], n_results: int = 5, min_similarity: float = 0.50, exclude_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Retrieves top semantically similar feedback items from vector memory.
        """
        results = []
        exclude_str = str(exclude_id) if exclude_id is not None else None

        for str_id, item in self.vectors.items():
            if exclude_str and str_id == exclude_str:
                continue
            sim = self.cosine_similarity(query_embedding, item["embedding"])
            if sim >= min_similarity:
                results.append({
                    "feedback_id": item["feedback_id"],
                    "text": item["text"],
                    "similarity": round(sim, 4),
                    "metadata": item.get("metadata", {})
                })

        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:n_results]

    def get_similar_for_feedback_id(self, feedback_id: int, n_results: int = 5) -> List[Dict[str, Any]]:
        str_id = str(feedback_id)
        if str_id not in self.vectors:
            return []
        target_vec = self.vectors[str_id]["embedding"]
        return self.query(target_vec, n_results=n_results, exclude_id=feedback_id)

    def determine_related_issue(
        self,
        feedback_id: int,
        feedback_text: str,
        embedding: List[float],
        ai_extracted: Dict[str, Any],
        db: Session,
        similarity_threshold: float = 0.65
    ) -> Tuple[Optional[Issue], float, List[Dict[str, Any]]]:
        """
        Core Semantic Memory Engine:
        Connects new feedback to persistent memory.
        1. Searches historical vector memory for semantically similar feedback.
        2. Determines whether it belongs to an existing issue.
        3. If yes, updates issue stats. If no, creates a new issue or maps to candidate issue.
        4. Establishes FeedbackIssueRelationship.
        """
        # Step 1: Query vector memory for similar historical feedback
        similar_items = self.query(embedding, n_results=8, min_similarity=0.60, exclude_id=feedback_id)

        target_issue = None
        best_similarity = 0.0

        # Step 2: Check if top similar items already belong to an issue
        issue_scores: Dict[int, float] = {}
        for item in similar_items:
            iss_id = item["metadata"].get("issue_id")
            if iss_id:
                issue_scores[iss_id] = max(issue_scores.get(iss_id, 0.0), item["similarity"])

        if issue_scores:
            best_issue_id, best_similarity = max(issue_scores.items(), key=lambda kv: kv[1])
            if best_similarity >= similarity_threshold:
                target_issue = db.query(Issue).filter(Issue.id == best_issue_id).first()

        # Step 3: If not matched by vector memory, match by title extracted by AI or create new
        ai_issue_title = ai_extracted.get("issue") or "Unclassified Issue"
        if not target_issue:
            # Check if an issue with similar title already exists
            existing_by_title = db.query(Issue).filter(Issue.title.ilike(f"%{ai_issue_title}%")).first()
            if existing_by_title:
                target_issue = existing_by_title
                best_similarity = 0.75
            else:
                # Create a new issue
                target_issue = Issue(
                    title=ai_issue_title,
                    description=ai_extracted.get("summary", ""),
                    category=ai_extracted.get("topic", "General"),
                    severity=ai_extracted.get("severity", "medium"),
                    status="New",
                    total_mentions=0,
                    first_detected=datetime.datetime.utcnow(),
                    last_detected=datetime.datetime.utcnow(),
                    trend_percentage=0.0
                )
                db.add(target_issue)
                db.flush()
                best_similarity = 1.0

        # Step 4: Update issue mention counts and dates
        target_issue.total_mentions = (target_issue.total_mentions or 0) + 1
        target_issue.last_detected = datetime.datetime.utcnow()

        # Step 5: Create relationship record
        rel = FeedbackIssueRelationship(
            feedback_id=feedback_id,
            issue_id=target_issue.id,
            similarity_score=best_similarity,
            created_at=datetime.datetime.utcnow()
        )
        db.add(rel)

        return target_issue, best_similarity, similar_items

    def get_memory_graph_data(self, db: Session, limit_issues: int = 8, limit_feedbacks_per_issue: int = 5) -> Dict[str, Any]:
        """
        Builds the node-link graph data for the Visual Memory Explorer.
        Hierarchy: Issue -> Feedback -> Channel -> Feature
        """
        nodes = []
        links = []
        node_ids = set()

        issues = db.query(Issue).order_by(Issue.total_mentions.desc()).limit(limit_issues).all()

        for iss in issues:
            iss_node_id = f"issue_{iss.id}"
            if iss_node_id not in node_ids:
                node_ids.add(iss_node_id)
                nodes.append({
                    "id": iss_node_id,
                    "label": iss.title,
                    "type": "issue",
                    "status": iss.status,
                    "severity": iss.severity,
                    "mentions": iss.total_mentions,
                    "trend": iss.trend_percentage
                })

            # Retrieve feedbacks for this issue
            feedbacks = db.query(Feedback).filter(Feedback.issue_id == iss.id).order_by(Feedback.date.desc()).limit(limit_feedbacks_per_issue).all()
            for fb in feedbacks:
                fb_node_id = f"feedback_{fb.id}"
                if fb_node_id not in node_ids:
                    node_ids.add(fb_node_id)
                    nodes.append({
                        "id": fb_node_id,
                        "label": fb.text[:40] + ("..." if len(fb.text) > 40 else ""),
                        "type": "feedback",
                        "channel": fb.channel,
                        "sentiment": fb.sentiment,
                        "feature": fb.feature,
                        "date": fb.date.strftime("%Y-%m-%d")
                    })

                links.append({
                    "source": iss_node_id,
                    "target": fb_node_id,
                    "similarity": 0.85,
                    "relationship": "categorizes"
                })

                # Channel node
                ch_node_id = f"channel_{fb.channel}"
                if ch_node_id not in node_ids:
                    node_ids.add(ch_node_id)
                    nodes.append({
                        "id": ch_node_id,
                        "label": fb.channel,
                        "type": "channel"
                    })
                links.append({
                    "source": fb_node_id,
                    "target": ch_node_id,
                    "similarity": 0.90,
                    "relationship": "channel_source"
                })

        return {"nodes": nodes, "links": links}

memory_service = MemoryService()
