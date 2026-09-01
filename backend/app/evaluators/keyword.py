from typing import Dict, Any

from app.evaluators.base import BaseEvaluator


class KeywordEvaluator(BaseEvaluator):

    name = "Keyword"

    def evaluate(
        self,
        prompt: str,
        response: str,
        **kwargs,
    ) -> Dict[str, Any]:

        prompt_words = set(
            word.lower().strip(".,!?")
            for word in prompt.split()
        )

        response_words = set(
            word.lower().strip(".,!?")
            for word in response.split()
        )

        if not prompt_words:

            return {
                "keyword_score": 0,
                "matched_keywords": [],
            }

        matched = sorted(
            prompt_words.intersection(response_words)
        )

        score = round(
            len(matched) / len(prompt_words) * 100,
            2,
        )

        return {
            "keyword_score": score,
            "matched_keywords": matched,
        }