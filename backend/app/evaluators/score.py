from typing import Dict


class ScoreCalculator:

    def __init__(self):

        self.weights = {
            "semantic_similarity": 0.30,
            "keyword_score": 0.20,
            "readability_score": 0.15,
            "prompt_adherence": 0.15,
            "completeness_score": 0.10,
            "latency": 0.05,
            "json_valid": 0.05,
        }

    @staticmethod
    def latency_to_score(latency_ms: float) -> float:

        if latency_ms <= 100:
            return 100

        if latency_ms <= 300:
            return 90

        if latency_ms <= 500:
            return 80

        if latency_ms <= 1000:
            return 60

        return 40

    def calculate(self, results: Dict) -> float:

        weighted_score = 0.0
        total_weight = 0.0

        for metric, weight in self.weights.items():

            value = results.get(metric)

            # Metric was not applicable
            if value is None:
                continue

            # Convert latency into a 0-100 score
            if metric == "latency":

                value = self.latency_to_score(
                    float(value)
                )

            # Convert boolean to 0/100
            elif isinstance(value, bool):

                value = 100 if value else 0

            try:

                value = float(value)

            except (TypeError, ValueError):

                continue

            value = max(
                0,
                min(100, value)
            )

            weighted_score += value * weight

            total_weight += weight

        if total_weight == 0:

            return 0.0

        return round(
            weighted_score / total_weight,
            2
        )