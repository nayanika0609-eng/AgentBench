import time
from typing import Dict, Any

from app.evaluators.length import LengthEvaluator
from app.evaluators.latency import LatencyEvaluator
from app.evaluators.readability import ReadabilityEvaluator
from app.evaluators.keyword import KeywordEvaluator
from app.evaluators.adherence import AdherenceEvaluator
from app.evaluators.completeness import CompletenessEvaluator
from app.evaluators.json_validator import JsonValidator
from app.evaluators.semantic_similarity import SemanticSimilarityEvaluator
from app.evaluators.score import ScoreCalculator

from app.evaluators.rag_context_relevance import (
    RAGContextRelevanceEvaluator
)

from app.evaluators.rag_citation_coverage import (
    RAGCitationCoverageEvaluator
)

from app.evaluators.rag_quality import (
    RAGQualityEvaluator
)


class EvaluationEngine:

    def __init__(self):

        # ---------------------------------
        # Standard evaluators
        # ---------------------------------

        self.standard_evaluators = [
            LengthEvaluator(),
            LatencyEvaluator(),
            ReadabilityEvaluator(),
            KeywordEvaluator(),
            AdherenceEvaluator(),
            CompletenessEvaluator(),
            JsonValidator(),
            SemanticSimilarityEvaluator(),
        ]

        # ---------------------------------
        # RAG evaluators
        # ---------------------------------

        self.context_relevance_evaluator = (
            RAGContextRelevanceEvaluator()
        )

        self.citation_coverage_evaluator = (
            RAGCitationCoverageEvaluator()
        )

        self.rag_quality_evaluator = (
            RAGQualityEvaluator()
        )

        self.score_calculator = ScoreCalculator()

    def evaluate(
        self,
        question=None,
        **kwargs
    ) -> Dict[str, Any]:

        results = {}

        # ---------------------------------
        # Make question available to
        # all evaluators
        # ---------------------------------

        kwargs["question"] = question

        # ---------------------------------
        # Standard evaluators
        # ---------------------------------

        for evaluator in self.standard_evaluators:

            try:

                result = evaluator.evaluate(
                    prompt=question,
                    **{
                        key: value
                        for key, value in kwargs.items()
                        if key != "prompt"
                    }
                )

                if result:
                    results.update(result)

            except Exception as ex:

                results[
                    f"{evaluator.__class__.__name__}_error"
                ] = str(ex)

        # ---------------------------------
        # RAG evaluators
        # ---------------------------------

        context = kwargs.get("context")

        if context:

            print("=" * 60)
            print("RUNNING RAG EVALUATORS")
            print("=" * 60)

            # ---------------------------------
            # Context relevance
            # ---------------------------------

            start = time.time()

            print(
                "Running:",
                "RAGContextRelevanceEvaluator"
            )

            try:

                result = (
                    self.context_relevance_evaluator.evaluate(
                        **kwargs
                    )
                )

                if result:
                    results.update(result)

            except Exception as ex:

                print(
                    "ERROR:",
                    "RAGContextRelevanceEvaluator",
                    ex
                )

                results[
                    "RAGContextRelevanceEvaluator_error"
                ] = str(ex)

            print(
                f"Context relevance time: "
                f"{time.time() - start:.2f}s"
            )

            # ---------------------------------
            # Citation coverage
            # ---------------------------------

            start = time.time()

            print(
                "Running:",
                "RAGCitationCoverageEvaluator"
            )

            try:

                result = (
                    self.citation_coverage_evaluator.evaluate(
                        **kwargs
                    )
                )

                if result:
                    results.update(result)

            except Exception as ex:

                print(
                    "ERROR:",
                    "RAGCitationCoverageEvaluator",
                    ex
                )

                results[
                    "RAGCitationCoverageEvaluator_error"
                ] = str(ex)

            print(
                f"Citation coverage time: "
                f"{time.time() - start:.2f}s"
            )

            # ---------------------------------
            # Faithfulness + Answer Relevance
            # ONE Ollama call
            # ---------------------------------

            start = time.time()

            print(
                "Running:",
                "RAGQualityEvaluator"
            )

            try:

                result = (
                    self.rag_quality_evaluator.evaluate(
                        **kwargs
                    )
                )

                if result:
                    results.update(result)

            except Exception as ex:

                print(
                    "ERROR:",
                    "RAGQualityEvaluator",
                    ex
                )

                results[
                    "RAGQualityEvaluator_error"
                ] = str(ex)

            print(
                f"RAG quality time: "
                f"{time.time() - start:.2f}s"
            )

        # ---------------------------------
        # Overall score
        # ---------------------------------

        results["overall_score"] = (
            self.score_calculator.calculate(
                results
            )
        )

        # ---------------------------------
        # RAG score
        # ---------------------------------

        rag_scores = [
            results.get(
                "context_relevance_score"
            ),
            results.get(
                "faithfulness_score"
            ),
            results.get(
                "answer_relevance_score"
            ),
            results.get(
                "citation_coverage_score"
            ),
        ]

        rag_scores = [
            float(score)
            for score in rag_scores
            if score is not None
        ]

        if rag_scores:

            results["rag_score"] = round(
                sum(rag_scores) / len(rag_scores),
                2
            )

        else:

            results["rag_score"] = None

        return results