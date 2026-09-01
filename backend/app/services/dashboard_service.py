from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.benchmark_run import BenchmarkRun
from app.models.llm_response import LLMResponse
from app.models.evaluation import Evaluation


def get_dashboard(
    db: Session,
    owner_id: int,
):

    # ---------------------------------
    # User's projects
    # ---------------------------------

    total_projects = (
        db.query(Project)
        .filter(
            Project.owner_id == owner_id
        )
        .count()
    )

    # ---------------------------------
    # User's benchmarks
    # ---------------------------------

    total_benchmarks = (
        db.query(BenchmarkRun)
        .join(
            Project,
            BenchmarkRun.project_id == Project.id
        )
        .filter(
            Project.owner_id == owner_id
        )
        .count()
    )

    # ---------------------------------
    # User's responses
    # ---------------------------------

    total_responses = (
        db.query(LLMResponse)
        .join(
            BenchmarkRun,
            LLMResponse.benchmark_id
            == BenchmarkRun.id
        )
        .join(
            Project,
            BenchmarkRun.project_id
            == Project.id
        )
        .filter(
            Project.owner_id == owner_id
        )
        .count()
    )

    # ---------------------------------
    # Average score
    # ---------------------------------

    average_score = (
        db.query(
            func.avg(
                Evaluation.overall_score
            )
        )
        .join(
            LLMResponse,
            Evaluation.response_id
            == LLMResponse.id
        )
        .join(
            BenchmarkRun,
            LLMResponse.benchmark_id
            == BenchmarkRun.id
        )
        .join(
            Project,
            BenchmarkRun.project_id
            == Project.id
        )
        .filter(
            Project.owner_id == owner_id
        )
        .scalar()
        or 0
    )

    # ---------------------------------
    # Best model
    # ---------------------------------

    best_model = (
        db.query(
            LLMResponse.model_name,
            func.avg(
                Evaluation.overall_score
            ),
        )
        .join(
            Evaluation,
            Evaluation.response_id
            == LLMResponse.id
        )
        .join(
            BenchmarkRun,
            LLMResponse.benchmark_id
            == BenchmarkRun.id
        )
        .join(
            Project,
            BenchmarkRun.project_id
            == Project.id
        )
        .filter(
            Project.owner_id == owner_id
        )
        .group_by(
            LLMResponse.model_name
        )
        .order_by(
            func.avg(
                Evaluation.overall_score
            ).desc()
        )
        .first()
    )

    # ---------------------------------
    # Fastest model
    # ---------------------------------

    fastest_model = (
        db.query(
            LLMResponse.model_name,
            func.avg(
                Evaluation.latency
            ),
        )
        .join(
            Evaluation,
            Evaluation.response_id
            == LLMResponse.id
        )
        .join(
            BenchmarkRun,
            LLMResponse.benchmark_id
            == BenchmarkRun.id
        )
        .join(
            Project,
            BenchmarkRun.project_id
            == Project.id
        )
        .filter(
            Project.owner_id == owner_id
        )
        .group_by(
            LLMResponse.model_name
        )
        .order_by(
            func.avg(
                Evaluation.latency
            )
        )
        .first()
    )

    return {

        "total_projects":
            total_projects,

        "total_benchmarks":
            total_benchmarks,

        "total_responses":
            total_responses,

        "average_score":
            round(
                float(average_score),
                2
            ),

        "best_model":
            best_model[0]
            if best_model
            else None,

        "fastest_model":
            fastest_model[0]
            if fastest_model
            else None,
    }