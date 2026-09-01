from app.evaluators.base import BaseEvaluator
from app.services.ollama_service import OllamaService

from app.evaluators.rag_utils import (
    parse_evaluator_response,
    normalize_score
)


class RAGFaithfulnessEvaluator(BaseEvaluator):

    def evaluate(
        self,
        question="",
        response="",
        context="",
        **kwargs
    ):

        if not response.strip() or not context.strip():

            return {
                "faithfulness_score": None
            }

        prompt = f"""
You are evaluating whether an answer is grounded
in retrieved evidence.

Question:
{question}

Retrieved Context:
{context}

Answer:
{response}

Identify whether the factual claims made in the
answer are supported by the retrieved context.

Important:

- Do NOT require the answer to mention every detail
  in the context.
- Do NOT penalize concise answers.
- Only judge claims that the answer actually makes.
- If the answer makes a factual claim and the context
  supports it, that claim is faithful.

Scoring:

100 = all factual claims are supported.
75 = most claims are supported.
50 = some claims are supported.
25 = very little support.
0 = claims are unsupported or contradicted.

Return ONLY valid JSON:

{{
    "score": 0,
    "reason": "short explanation"
}}
"""

        result = OllamaService.generate(
            model="llama3.1:8b",
            prompt=prompt
        )

        print("=" * 60)
        print("RAG FAITHFULNESS RAW RESPONSE")
        print(result)
        print("=" * 60)

        parsed = parse_evaluator_response(
            result
        )

        if parsed is None:

            return {
                "faithfulness_score": None
            }

        return {
            "faithfulness_score":
                normalize_score(
                    parsed.get("score")
                )
        }