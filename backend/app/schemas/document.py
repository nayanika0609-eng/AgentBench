from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    filename: str
    filepath: str
    filetype: str
    uploaded_at: datetime


class DocumentListItem(BaseModel):
    """Document row augmented with derived RAG-indexing info.

    Not a change to backend business logic - purely additive so the
    frontend Knowledge Base view can render real indexed-chunk counts.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    filename: str
    filetype: str
    uploaded_at: datetime
    chunk_count: int