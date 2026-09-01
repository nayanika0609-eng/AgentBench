from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Document(Base):

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False
    )

    filename = Column(
        String(255),
        nullable=False
    )

    filepath = Column(
        String(500),
        nullable=False
    )

    filetype = Column(
        String(30)
    )

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    project = relationship(
        "Project",
        backref="documents"
    )
    hash = Column(
    String(64),
    nullable=False
)