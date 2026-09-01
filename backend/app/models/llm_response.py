from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    ForeignKey,
    DateTime
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class LLMResponse(Base):

    __tablename__ = "llm_responses"

    id = Column(Integer, primary_key=True)

    benchmark_id = Column(
        Integer,
        ForeignKey("benchmark_runs.id"),
        nullable=False
    )

    model_name = Column(
        String(100),
        nullable=False
    )

    response = Column(
        Text,
        nullable=False
    )

    latency_ms = Column(Float)

    tokens_used = Column(Integer)

    cost = Column(Float)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    benchmark = relationship(
        "BenchmarkRun",
        back_populates="responses"
    )

    evaluation = relationship(
        "Evaluation",
        back_populates="response",
        uselist=False,
        cascade="all, delete-orphan"
    )