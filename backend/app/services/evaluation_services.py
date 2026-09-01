from sqlalchemy.orm import Session

from app.evaluators.evaluator import EvaluationEngine
from app.models.evaluation import Evaluation
from app.models.llm_response import LLMResponse


class EvaluationService:

    def __init__(self):

        self.engine = EvaluationEngine()

    def evaluate_response(
        self,
        db: Session,
        llm_response: LLMResponse,
        prompt: str,
        expected_keywords=None,
        reference_answer=None,
        start_time=0,
        end_time=0,
        context=None,
        source_count=0,
    ):

        # ---------------------------------
        # Run evaluation engine
        # ---------------------------------

        results = self.engine.evaluate(

            question=prompt,

            response=llm_response.response,

            expected_keywords=expected_keywords,

            reference_answer=reference_answer,

            start_time=start_time,

            end_time=end_time,

            context=context,

            source_count=source_count,

        )

        # ---------------------------------
        # Create evaluation record
        # ---------------------------------

        evaluation = Evaluation(

            response_id=llm_response.id,

            # -----------------------------
            # Standard metrics
            # -----------------------------

            similarity_score=results.get(
                "semantic_similarity"
            ),

            hallucination_score=results.get(
                "hallucination_score"
            ),

            toxicity_score=results.get(
                "toxicity_score"
            ),

            json_valid=results.get(
                "valid_json"
            ),

            overall_score=results.get(
                "overall_score"
            ),

            latency=results.get(
                "latency"
            ),

            readability_score=results.get(
                "readability_score"
            ),

            keyword_score=results.get(
                "keyword_score"
            ),

            prompt_adherence=results.get(
                "prompt_adherence"
            ),

            completeness_score=results.get(
                "completeness_score"
            ),

            # -----------------------------
            # RAG metrics
            # -----------------------------

            context_relevance_score=results.get(
                "context_relevance_score"
            ),

            faithfulness_score=results.get(
                "faithfulness_score"
            ),

            answer_relevance_score=results.get(
                "answer_relevance_score"
            ),

            citation_coverage_score=results.get(
                "citation_coverage_score"
            ),

            rag_score=results.get(
                "rag_score"
            ),

        )

        # ---------------------------------
        # Save evaluation
        # ---------------------------------

        try:

            db.add(
                evaluation
            )

            db.commit()

            db.refresh(
                evaluation
            )

            return evaluation, results

        except Exception:

            db.rollback()

            raise