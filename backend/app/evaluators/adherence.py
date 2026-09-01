from typing import Dict, Any

from app.evaluators.base import BaseEvaluator
from app.evaluators.utils import extract_number_from_prompt


class AdherenceEvaluator(BaseEvaluator):

    name = "PromptAdherence"

    def evaluate(
        self,
        prompt: str,
        response: str,
        **kwargs,
    ) -> Dict[str, Any]:

        score = 100

        feedback = []

        expected_words = extract_number_from_prompt(prompt)

        if expected_words:

            actual = len(response.split())

            if actual > expected_words * 1.20:

                score -= 25

                feedback.append(
                    "Response exceeds requested length."
                )

            elif actual < expected_words * 0.80:

                score -= 25

                feedback.append(
                    "Response shorter than requested."
                )

        if "bullet" in prompt.lower():

            if "-" not in response and "*" not in response:

                score -= 20

                feedback.append(
                    "Bullet points requested."
                )

        if "json" in prompt.lower():

            if not response.strip().startswith("{"):

                score -= 20

                feedback.append(
                    "JSON format requested."
                )

        return {

            "prompt_adherence": max(score, 0),

            "adherence_feedback": feedback,
        }