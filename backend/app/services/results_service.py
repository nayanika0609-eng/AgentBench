from sqlalchemy.orm import Session

from app.models.benchmark_run import BenchmarkRun
from app.models.project import Project


def get_benchmark_results(
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
        raise ValueError("Benchmark not found")

    results = []

    for response in benchmark.responses:

        evaluation = response.evaluation

        results.append(
            {
                "id": response.id,

                "benchmark_id": response.benchmark_id,

                "model_name": response.model_name,

                "response": response.response,

                "latency_ms": response.latency_ms,

                "tokens_used": response.tokens_used,

                "cost": response.cost,

                "created_at": response.created_at,

                "evaluation": (
                    {
                        "overall_score": evaluation.overall_score,

                        "semantic_similarity": (
                            evaluation.similarity_score
                        ),

                        "hallucination_score": (
                            evaluation.hallucination_score
                        ),

                        "toxicity_score": (
                            evaluation.toxicity_score
                        ),

                        "json_valid": (
                            evaluation.json_valid
                        ),

                        "latency": evaluation.latency,

                        "readability_score": (
                            evaluation.readability_score
                        ),

                        "keyword_score": (
                            evaluation.keyword_score
                        ),

                        "prompt_adherence": (
                            evaluation.prompt_adherence
                        ),

                        "completeness_score": (
                            evaluation.completeness_score
                        ),

                        "context_relevance_score": (
                            evaluation.context_relevance_score
                        ),

                        "faithfulness_score": (
                            evaluation.faithfulness_score
                        ),

                        "answer_relevance_score": (
                            evaluation.answer_relevance_score
                        ),

                        "citation_coverage_score": (
                            evaluation.citation_coverage_score
                        ),

                        "rag_score": (
                            evaluation.rag_score
                        ),
                    }
                    if evaluation
                    else None
                ),
            }
        )

    return results