from sqlalchemy.orm import Session

from app.models.benchmark_run import BenchmarkRun
from app.models.project import Project


class ReportService:

    def __init__(self, db: Session):
        self.db = db

    def generate_report(
        self,
        benchmark_id: int,
        owner_id: int,
    ):

        benchmark = (
            self.db.query(BenchmarkRun)
            .join(
                Project,
                BenchmarkRun.project_id == Project.id
            )
            .filter(
                BenchmarkRun.id == benchmark_id,
                Project.owner_id == owner_id,
            )
            .first()
        )

        if not benchmark:
            return None

        models = []
        scores = []
        latencies = []
        ranking = []

        fastest_model = None
        slowest_model = None
        highest_readability = None

        fastest_latency = float("inf")
        slowest_latency = 0
        highest_readability_score = -1

        winner = None
        best_score = -1

        for response in benchmark.responses:

            evaluation = response.evaluation

            score = (
                evaluation.overall_score
                if evaluation
                else None
            )

            latency = (
                evaluation.latency
                if evaluation
                else None
            )

            readability = (
                evaluation.readability_score
                if evaluation
                else None
            )

            text = response.response

            words = len(text.split())

            sentences = sum(
                text.count(x)
                for x in ".!?"
            )

            characters = len(text)

            if words < 100:
                length = "Short"
            elif words < 250:
                length = "Medium"
            else:
                length = "Long"

            strengths = []
            weaknesses = []

            if readability is not None:

                if readability >= 80:
                    strengths.append(
                        "Easy to understand"
                    )

                elif readability < 50:
                    weaknesses.append(
                        "Difficult to read"
                    )

            if score is not None:

                scores.append(score)

                ranking.append({
                    "model": response.model_name,
                    "score": score
                })

                if score > best_score:
                    best_score = score
                    winner = response.model_name

            if latency is not None:

                latencies.append(latency)

                if latency < fastest_latency:
                    fastest_latency = latency
                    fastest_model = response.model_name

                if latency > slowest_latency:
                    slowest_latency = latency
                    slowest_model = response.model_name

            if readability is not None:

                if readability > highest_readability_score:
                    highest_readability_score = readability
                    highest_readability = response.model_name

            if words > 250:
                strengths.append(
                    "Comprehensive explanation"
                )
            else:
                weaknesses.append(
                    "Could be more detailed"
                )

            if (
                evaluation
                and evaluation.keyword_score is not None
            ):

                if evaluation.keyword_score < 70:
                    weaknesses.append(
                        "Missed expected keywords"
                    )

            models.append({

                "model_name":
                    response.model_name,

                "response":
                    text,

                "overall_score":
                    score,

                "latency":
                    latency,

                "readability_score":
                    readability,

                "keyword_score":
                    evaluation.keyword_score
                    if evaluation
                    else None,

                "prompt_adherence":
                    evaluation.prompt_adherence
                    if evaluation
                    else None,

                "completeness_score":
                    evaluation.completeness_score
                    if evaluation
                    else None,

                "tokens_used":
                    response.tokens_used,

                "cost":
                    response.cost,

                "word_count":
                    words,

                "sentence_count":
                    sentences,

                "character_count":
                    characters,

                "response_length":
                    length,

                "strengths":
                    strengths,

                "weaknesses":
                    weaknesses
            })

        ranking.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        for i, row in enumerate(ranking):
            row["rank"] = i + 1

        average_score = (
            round(
                sum(scores) / len(scores),
                2
            )
            if scores
            else None
        )

        average_latency = (
            round(
                sum(latencies) / len(latencies),
                2
            )
            if latencies
            else None
        )

        return {

            "benchmark_id":
                benchmark.id,

            "prompt":
                benchmark.prompt,

            "total_models":
                len(models),

            "winner":
                winner,

            "average_score":
                average_score,

            "average_latency":
                average_latency,

            "fastest_model":
                fastest_model,

            "slowest_model":
                slowest_model,

            "highest_readability":
                highest_readability,

            "ranking":
                ranking,

            "models":
                models
        }