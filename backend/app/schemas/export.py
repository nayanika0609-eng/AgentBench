from pydantic import BaseModel
from typing import List, Optional


class ModelReport(BaseModel):

    model_name: str

    response: str

    overall_score: Optional[float] = None

    latency: Optional[float] = None

    readability_score: Optional[float] = None

    keyword_score: Optional[float] = None

    prompt_adherence: Optional[float] = None

    completeness_score: Optional[float] = None

    tokens_used: Optional[int] = None

    cost: Optional[float] = None

    word_count: int

    sentence_count: int

    character_count: int

    response_length: str

    strengths: List[str]

    weaknesses: List[str]


class BenchmarkReport(BaseModel):

    benchmark_id: int

    prompt: str

    total_models: int

    winner: Optional[str]

    average_score: Optional[float]

    average_latency: Optional[float]

    fastest_model: Optional[str]

    slowest_model: Optional[str]

    highest_readability: Optional[str]

    ranking: List[dict]

    models: List[ModelReport]