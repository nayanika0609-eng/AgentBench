from typing import Dict, Any

from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

from app.evaluators.base import BaseEvaluator


class SemanticSimilarityEvaluator(BaseEvaluator):
    """
    Measures semantic similarity between
    a reference answer and a candidate response.
    """

    name = "SemanticSimilarity"

    # Load once when the application starts
    model = SentenceTransformer("all-MiniLM-L6-v2")

    def evaluate(
        self,
        reference_answer: str = "",
        response: str = "",
        **kwargs,
    ) -> Dict[str, Any]:

        if not reference_answer or not reference_answer.strip():

            return {
                "semantic_similarity": None,
                "semantic_feedback": "Reference answer not provided."
            }

        if not response or not response.strip():

            return {
                "semantic_similarity": 0.0,
                "semantic_feedback": "Empty response."
            }

        reference_embedding = self.model.encode(
            [reference_answer]
        )

        response_embedding = self.model.encode(
            [response]
        )

        similarity = cosine_similarity(
            reference_embedding,
            response_embedding
        )[0][0]

        similarity_percentage = round(
            similarity * 100,
            2
        )

        if similarity_percentage >= 90:
            feedback = "Excellent semantic match."

        elif similarity_percentage >= 75:
            feedback = "Good semantic similarity."

        elif similarity_percentage >= 60:
            feedback = "Moderate similarity."

        else:
            feedback = "Low semantic similarity."

        return {

            "semantic_similarity": similarity_percentage,

            "semantic_feedback": feedback
        }