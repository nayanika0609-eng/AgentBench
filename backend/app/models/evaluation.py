from sqlalchemy import (
    Column,
    Integer,
    Float,
    Boolean,
    ForeignKey
)
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Evaluation(Base):

    __tablename__ = "evaluations"

    id = Column(
        Integer,
        primary_key=True
    )

    response_id = Column(
        Integer,
        ForeignKey("llm_responses.id"),
        nullable=False
    )

    # ---------------------------------
    # Standard evaluation metrics
    # ---------------------------------

    similarity_score = Column(Float)

    hallucination_score = Column(Float)

    toxicity_score = Column(Float)

    json_valid = Column(Boolean)

    overall_score = Column(Float)

    latency = Column(Float)

    readability_score = Column(Float)

    keyword_score = Column(Float)

    prompt_adherence = Column(Float)

    completeness_score = Column(Float)

    # ---------------------------------
    # RAG evaluation metrics
    # ---------------------------------

    context_relevance_score = Column(Float)

    faithfulness_score = Column(Float)

    answer_relevance_score = Column(Float)

    citation_coverage_score = Column(Float)

    rag_score = Column(Float)

    # ---------------------------------
    # Relationship
    # ---------------------------------

    response = relationship(
        "LLMResponse",
        back_populates="evaluation"
    )