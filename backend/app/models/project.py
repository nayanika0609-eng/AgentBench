from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class Project(Base):

    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)

    owner_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    name = Column(String(255))

    description = Column(String(1000))

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    owner = relationship(
        "User",
        backref="projects"
    )