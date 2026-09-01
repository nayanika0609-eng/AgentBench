import re

from app.evaluators.base import BaseEvaluator


class RAGCitationCoverageEvaluator(BaseEvaluator):

    SOURCE_PATTERN = re.compile(
        r"\[Source\s+(\d+)(?:\s*,\s*Chunk:\s*\d+)?\]",
        re.IGNORECASE
    )

    def evaluate(
        self,
        response="",
        source_count=0,
        **kwargs
    ):

        if not response.strip() or source_count <= 0:
            return {
                "citation_coverage_score": None
            }

        # ---------------------------------
        # Find all citations in the answer
        # ---------------------------------

        matches = self.SOURCE_PATTERN.findall(
            response
        )

        valid_sources = {
            int(number)
            for number in matches
            if 1 <= int(number) <= source_count
        }

        # ---------------------------------
        # No citation at all
        # ---------------------------------

        if not valid_sources:

            return {
                "citation_coverage_score": 0
            }

        # ---------------------------------
        # Citation coverage
        #
        # The answer only needs to cite the
        # evidence it actually uses.
        #
        # We therefore reward the presence
        # of valid citations rather than
        # requiring every retrieved source
        # to be cited.
        # ---------------------------------

        return {
            "citation_coverage_score": 100
        }