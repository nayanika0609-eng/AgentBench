from sqlalchemy import Column, Integer, Text, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class BenchmarkRun(Base):

    __tablename__ = "benchmark_runs"

    id = Column(Integer, primary_key=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.id")
    )

    prompt = Column(Text)

    status = Column(
        String(50),
        default="PENDING"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    responses = relationship(
        "LLMResponse",
        back_populates="benchmark",
        cascade="all, delete-orphan"
    )