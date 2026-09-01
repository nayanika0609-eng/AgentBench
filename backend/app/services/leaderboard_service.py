from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.evaluation import Evaluation
from app.models.llm_response import LLMResponse


def get_leaderboard(db: Session):

    leaderboard = (

        db.query(

            LLMResponse.model_name.label("model_name"),

            func.avg(Evaluation.overall_score).label("average_score"),

            func.avg(Evaluation.latency).label("average_latency"),

            func.count(LLMResponse.id).label("total_responses"),

        )

        .join(
            Evaluation,
            Evaluation.response_id == LLMResponse.id,
        )

        .group_by(
            LLMResponse.model_name
        )

        .order_by(
            func.avg(Evaluation.overall_score).desc()
        )

        .all()

    )

    return [
    {
        "model_name": row.model_name,
        "average_score": round(float(row.average_score or 0), 2),
        "average_latency": round(float(row.average_latency or 0), 2),
        "total_responses": row.total_responses,
    }
    for row in leaderboard
]