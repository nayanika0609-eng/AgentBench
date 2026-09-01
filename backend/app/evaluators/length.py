from typing import Dict, Any

from app.evaluators.base import BaseEvaluator


class LengthEvaluator(BaseEvaluator):

    name = "Length"

    def evaluate(
        self,
        response: str,
        **kwargs,
    ) -> Dict[str, Any]:

        words = len(response.split())

        characters = len(response)

        return {
            "word_count": words,
            "character_count": characters,
        }