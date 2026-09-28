from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.schemas.schemas import (
    AIAnalysisRequest,
    AIAnalysisResponse,
    AIChatRequest,
    AIChatResponse
)
from backend.services.ai_service import ai_service
from backend.services.analyst_service import analyst_service

router = APIRouter(prefix="/api/ai", tags=["AI"])

@router.post("/analyze", response_model=AIAnalysisResponse)
async def analyze_text(payload: AIAnalysisRequest):
    result = await ai_service.analyze_feedback(
        text=payload.text,
        channel=payload.channel or "Customer Review",
        product=payload.product or "ShopApp",
        feature=payload.feature or "General"
    )
    return AIAnalysisResponse(
        sentiment=result.get("sentiment", "neutral"),
        sentiment_score=result.get("sentiment_score", 0.5),
        topic=result.get("topic", "General"),
        product_area=result.get("product_area", "Core"),
        feature=result.get("feature", "General"),
        issue=result.get("issue", "General Issue"),
        severity=result.get("severity", "medium"),
        intent=result.get("intent", "complaint"),
        keywords=result.get("keywords", []),
        summary=result.get("summary", ""),
        is_demo_mode=result.get("is_demo_mode", False)
    )

@router.post("/chat", response_model=AIChatResponse)
async def chat_analyst(payload: AIChatRequest, db: Session = Depends(get_db)):
    """
    ChatGPT-like interface for product managers.
    Answers queries grounded in real database records and persistent vector memory.
    Returns clear answer + metrics + supporting feedback evidence.
    """
    response_data = await analyst_service.chat(query=payload.query, db=db)
    return AIChatResponse(
        answer=response_data["answer"],
        metrics=response_data.get("metrics", {}),
        evidence=response_data.get("evidence", []),
        suggested_followups=response_data.get("suggested_followups", []),
        is_demo_mode=response_data.get("is_demo_mode", False)
    )
