from app.evaluators.base import BaseEvaluator
from app.services.ollama_service import OllamaService

from app.evaluators.rag_utils import (
    parse_evaluator_response,
    normalize_score
)


class RAGAnswerRelevanceEvaluator(BaseEvaluator):

    def evaluate(
        self,
        question="",
        response="",
        **kwargs
    ):

        print("=" * 60)
        print("ANSWER RELEVANCE EVALUATOR STARTED")
        print("=" * 60)

        if not question or not response:
            print("Missing question or response")

            return {
                "answer_relevance_score": None
            }

        prompt = f"""
You are an evaluation judge inside AgentBench.

Your ONLY task is to determine whether the ANSWER directly
answers the QUESTION.

Do NOT evaluate:
- factual correctness
- citation quality
- faithfulness to sources
- writing quality
- completeness of the source documents
- whether every retrieved source was used

Evaluate ONLY whether the answer responds to what the user asked.

QUESTION:
{question}

ANSWER:
{response}

SCORING RULES:

100:
The answer directly answers the question.
The main information requested by the user is provided.
Minor missing details do NOT reduce the score.

90:
The answer directly answers the question but omits a small
non-essential detail.

75:
The answer addresses the question but misses an important
part of what was asked.

50:
The answer only partially answers the question.

25:
The answer is mostly unrelated to the question.

0:
The answer does not answer the question at all.

IMPORTANT:

If the question asks for a specific fact and the answer
provides that fact directly, give 100.

If the question asks "What is the goal of Phase 4?" and the
answer states the goal of Phase 4, that is a direct answer
and should receive 100 even if the answer is short.

Do NOT penalize an answer simply because it is concise.

Return ONLY valid JSON.

Do not use markdown.
Do not add explanations outside the JSON.

Required format:

{{
    "score": 100,
    "reason": "The answer directly addresses the question."
}}
"""

        print("Calling Ollama for answer relevance...")

        try:

            raw_response = OllamaService.generate(
                model="llama3.1:8b",
                prompt=prompt
            )

        except Exception as ex:

            print(
                "ANSWER RELEVANCE OLLAMA ERROR:",
                ex
            )

            return {
                "answer_relevance_score": None
            }

        print("=" * 60)
        print("RAG ANSWER RELEVANCE RAW RESPONSE")
        print(raw_response)
        print("=" * 60)

        parsed = parse_evaluator_response(
            raw_response
        )

        print(
            "PARSED ANSWER:",
            parsed
        )

        if parsed is None:

            print(
                "ANSWER RELEVANCE JSON PARSE FAILED"
            )

            return {
                "answer_relevance_score": None
            }

        score = normalize_score(
            parsed.get("score")
        )

        print(
            "ANSWER RELEVANCE SCORE:",
            score
        )

        return {
            "answer_relevance_score": score
        }