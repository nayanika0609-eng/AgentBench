from typing import Dict, Any

from app.evaluators.base import BaseEvaluator


class ReadabilityEvaluator(BaseEvaluator):

    name = "Readability"

    def evaluate(
        self,
        response: str,
        **kwargs,
    ) -> Dict[str, Any]:

        words = response.split()

        sentences = [
            sentence
            for sentence in response.replace("?", ".").replace("!", ".").split(".")
            if sentence.strip()
        ]

        total_words = max(len(words), 1)
        total_sentences = max(len(sentences), 1)

        average = total_words / total_sentences

        score = max(0, min(100, round(100 - average, 2)))

        return {
            "readability_score": score,
            "average_sentence_length": round(average, 2),
        }