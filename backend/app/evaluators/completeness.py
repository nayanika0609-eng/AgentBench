from typing import Dict, Any

from app.evaluators.base import BaseEvaluator
from app.evaluators.utils import tokenize


class CompletenessEvaluator(BaseEvaluator):

    name = "Completeness"

    def evaluate(
        self,
        expected_keywords=None,
        response="",
        **kwargs,
    ) -> Dict[str, Any]:

        if not expected_keywords:

            return {
                "completeness_score": None,
                "covered_keywords": [],
            }

        response_words = set(
            tokenize(response)
        )

        expected = set(
            word.lower()
            for word in expected_keywords
        )

        matched = sorted(
            expected.intersection(response_words)
        )

        score = round(
            len(matched) / len(expected) * 100,
            2,
        )

        return {

            "completeness_score": score,

            "covered_keywords": matched,

            "missing_keywords": sorted(
                expected - set(matched)
            ),
        }