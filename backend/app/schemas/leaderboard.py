from pydantic import BaseModel


class LeaderboardEntry(BaseModel):

    model_name: str

    average_score: float

    average_latency: float

    total_responses: int