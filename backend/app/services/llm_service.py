from sqlalchemy.orm import Session

from app.models.llm_response import LLMResponse


def save_response(
    db: Session,
    benchmark_id: int,
    model_name: str,
    response: str,
    latency_ms: float = None,
    tokens_used: int = None,
    cost: float = None,
):

    llm = LLMResponse(
    benchmark_id=benchmark_id,
    model_name=model_name,
    response=response,
    latency_ms=latency_ms,
    tokens_used=tokens_used,
    cost=cost,
)
    db.add(llm)
    db.commit()
    db.refresh(llm)

    return llm