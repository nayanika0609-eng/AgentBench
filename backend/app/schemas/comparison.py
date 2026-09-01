from pydantic import BaseModel


class ModelComparison(BaseModel):

    model_name: str

    response: str

    # ---------------------------------
    # Standard metrics
    # ---------------------------------

    overall_score: float | None

    latency: float | None

    readability_score: float | None

    keyword_score: float | None

    prompt_adherence: float | None

    completeness_score: float | None

    # ---------------------------------
    # RAG metrics
    # ---------------------------------

    context_relevance_score: float | None

    faithfulness_score: float | None

    answer_relevance_score: float | None

    citation_coverage_score: float | None

    rag_score: float | None


class BenchmarkComparison(BaseModel):

    benchmark_id: int

    prompt: str

    models: list[ModelComparison]