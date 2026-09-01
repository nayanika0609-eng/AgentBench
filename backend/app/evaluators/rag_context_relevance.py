from app.evaluators.base import BaseEvaluator
from app.services.ollama_service import OllamaService

from app.evaluators.rag_utils import (
    parse_evaluator_response,
    normalize_score
)


class RAGContextRelevanceEvaluator(BaseEvaluator):

    def evaluate(
        self,
        question="",
        context="",
        **kwargs
    ):

        print("=" * 60)
        print("CONTEXT RELEVANCE EVALUATOR STARTED")
        print("=" * 60)

        if not question or not context:
            print("Missing question or context")

            return {
                "context_relevance_score": None
            }

        prompt = f"""
You are evaluating the relevance of retrieved context
for a RAG system.

Question:
{question}

Retrieved Context:
{context}

Determine whether the retrieved context contains
information useful for answering the question.

Judge ONLY retrieval relevance.

Do not require the context to contain the complete
answer.

Scoring:

100 = directly contains the information needed
75 = mostly relevant
50 = partially relevant
25 = weakly related
0 = completely irrelevant

Return ONLY valid JSON.
Do not use markdown.
Do not add text outside the JSON.

Example:

{{
    "score": 75,
    "reason": "The retrieved context contains relevant information."
}}
"""

        print("Calling Ollama for context relevance...")

        try:

            raw_response = OllamaService.generate(
                model="llama3.1:8b",
                prompt=prompt
            )

        except Exception as ex:

            print(
                "CONTEXT RELEVANCE OLLAMA ERROR:",
                ex
            )

            return {
                "context_relevance_score": None
            }

        print("=" * 60)
        print("RAG CONTEXT RELEVANCE RAW RESPONSE")
        print(raw_response)
        print("=" * 60)

        parsed = parse_evaluator_response(
            raw_response
        )

        print(
            "PARSED CONTEXT:",
            parsed
        )

        if parsed is None:

            print(
                "CONTEXT RELEVANCE JSON PARSE FAILED"
            )

            return {
                "context_relevance_score": None
            }

        score = normalize_score(
            parsed.get("score")
        )

        print(
            "CONTEXT RELEVANCE SCORE:",
            score
        )

        return {
            "context_relevance_score": score
        }