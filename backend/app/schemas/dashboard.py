from pydantic import BaseModel


class DashboardStats(BaseModel):

    total_projects: int

    total_benchmarks: int

    total_responses: int

    average_score: float

    best_model: str | None

    fastest_model: str | None