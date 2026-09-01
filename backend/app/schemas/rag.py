from pydantic import BaseModel, Field


class RAGRequest(BaseModel):

    project_id: int

    question: str = Field(
        min_length=1
    )

    model: str = "llama3.1:8b"

    top_k: int = Field(
        default=5,
        ge=1,
        le=20
    )