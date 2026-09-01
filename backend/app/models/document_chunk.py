from sqlalchemy import (
    Column,
    Integer,
    Text,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database.connection import Base


class DocumentChunk(Base):

    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True)

    document_id = Column(
        Integer,
        ForeignKey("documents.id")
    )

    chunk_index = Column(Integer)

    content = Column(Text)

    document = relationship(
        "Document",
        backref="chunks"
    )