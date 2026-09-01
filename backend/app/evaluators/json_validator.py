import json

from typing import Dict, Any

from app.evaluators.base import BaseEvaluator


class JsonValidator(BaseEvaluator):

    name = "JSONValidator"

    def evaluate(
        self,
        prompt: str = "",
        response: str = "",
        **kwargs,
    ) -> Dict[str, Any]:

        # JSON is only relevant when the prompt
        # actually requests JSON.
        if "json" not in prompt.lower():

            return {
                "valid_json": None,
                "json_type": None,
            }

        try:

            parsed = json.loads(response)

            return {
                "valid_json": True,
                "json_type": type(parsed).__name__,
            }

        except Exception as ex:

            return {
                "valid_json": False,
                "json_type": None,
                "json_error": str(ex),
            }