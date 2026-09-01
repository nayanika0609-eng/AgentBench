from app.evaluators.base import BaseEvaluator
from app.services.ollama_service import OllamaService

from app.evaluators.rag_utils import (
    parse_evaluator_response,
    normalize_score
)


class RAGQualityEvaluator(BaseEvaluator):

    def evaluate(
        self,
        question="",
        response="",
        context="",
        **kwargs
    ):

        if not question or not response or not context:
            return {
                "faithfulness_score": None,
                "answer_relevance_score": None,
            }

        prompt = f"""
You are an evaluation judge inside AgentBench.

Evaluate the answer using the question and retrieved
context below.

QUESTION:
{question}

RETRIEVED CONTEXT:
{context}

ANSWER:
{response}

Evaluate TWO things.

1. FAITHFULNESS

Determine whether factual claims in the answer are
supported by the retrieved context.

100 = all factual claims are supported
75 = most claims are supported
50 = some claims are supported
25 = very little support
0 = claims are unsupported or contradicted

Do not penalize concise answers.

2. ANSWER RELEVANCE

Determine whether the answer directly answers the question.

100 = directly answers the question
75 = answers it but misses important detail
50 = partially answers it
25 = mostly unrelated
0 = does not answer the question

Do not penalize concise answers.

Return ONLY valid JSON.

Required format:

{{
    "faithfulness": 100,
    "answer_relevance": 100
}}

Do not use markdown.
Do not add any text outside the JSON.
"""

        try:

            raw_response = OllamaService.generate(
                model="llama3.1:8b",
                prompt=prompt
            )

        except Exception as ex:

            print(
                "RAG QUALITY OLLAMA ERROR:",
                ex
            )

            return {
                "faithfulness_score": None,
                "answer_relevance_score": None,
            }

        print("=" * 60)
        print("RAG QUALITY RAW RESPONSE")
        print(raw_response)
        print("=" * 60)

        parsed = parse_evaluator_response(
            raw_response
        )

        if parsed is None:

            print(
                "RAG QUALITY JSON PARSE FAILED"
            )

            return {
                "faithfulness_score": None,
                "answer_relevance_score": None,
            }

        faithfulness = normalize_score(
            parsed.get("faithfulness")
        )

        answer_relevance = normalize_score(
            parsed.get("answer_relevance")
        )

        print(
            "FAITHFULNESS:",
            faithfulness
        )

        print(
            "ANSWER RELEVANCE:",
            answer_relevance
        )

        return {
            "faithfulness_score": faithfulness,
            "answer_relevance_score": answer_relevance,
        }