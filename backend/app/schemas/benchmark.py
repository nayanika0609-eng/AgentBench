from datetime import datetime

from pydantic import BaseModel, Field


class BenchmarkCreate(BaseModel):

    prompt: str

    models: list[str]

    use_rag: bool = False

    top_k: int = Field(
        default=5,
        ge=1,
        le=20
    )


class BenchmarkResponse(BaseModel):

    id: int

    project_id: int

    prompt: str

    status: str

    created_at: datetime

    model_config = {
        "from_attributes": True
    }