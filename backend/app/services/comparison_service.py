from sqlalchemy.orm import Session

from app.models.benchmark_run import BenchmarkRun
from app.models.project import Project


def compare_benchmark(
    db: Session,
    benchmark_id: int,
    owner_id: int,
):

    benchmark = (
        db.query(BenchmarkRun)
        .join(Project)
        .filter(
            BenchmarkRun.id == benchmark_id,
            Project.owner_id == owner_id,
        )
        .first()
    )

    if benchmark is None:

        raise ValueError(
            "Benchmark not found"
        )

    models = []

    for response in benchmark.responses:

        evaluation = response.evaluation

        models.append(
            {
                "model_name":
                    response.model_name,

                "response":
                    response.response,

                "overall_score":
                    (
                        evaluation.overall_score
                        if evaluation
                        else None
                    ),

                "latency":
                    (
                        evaluation.latency
                        if evaluation
                        else None
                    ),

                "readability_score":
                    (
                        evaluation.readability_score
                        if evaluation
                        else None
                    ),

                "keyword_score":
                    (
                        evaluation.keyword_score
                        if evaluation
                        else None
                    ),

                "prompt_adherence":
                    (
                        evaluation.prompt_adherence
                        if evaluation
                        else None
                    ),

                "completeness_score":
                    (
                        evaluation.completeness_score
                        if evaluation
                        else None
                    ),

                "context_relevance_score":
                    (
                        evaluation.context_relevance_score
                        if evaluation
                        else None
                    ),

                "faithfulness_score":
                    (
                        evaluation.faithfulness_score
                        if evaluation
                        else None
                    ),

                "answer_relevance_score":
                    (
                        evaluation.answer_relevance_score
                        if evaluation
                        else None
                    ),

                "citation_coverage_score":
                    (
                        evaluation.citation_coverage_score
                        if evaluation
                        else None
                    ),

                "rag_score":
                    (
                        evaluation.rag_score
                        if evaluation
                        else None
                    ),
            }
        )

    return {
        "benchmark_id": benchmark.id,

        "prompt": benchmark.prompt,

        "models": models,
    }