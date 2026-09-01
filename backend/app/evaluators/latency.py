from typing import Dict, Any

from app.evaluators.base import BaseEvaluator


class LatencyEvaluator(BaseEvaluator):

    name = "Latency"

    def evaluate(
        self,
        start_time: float,
        end_time: float,
        **kwargs,
    ) -> Dict[str, Any]:

       latency_ms = round((end_time - start_time) * 1000, 2)

       return {
       "latency": latency_ms
        }