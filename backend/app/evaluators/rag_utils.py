import json
import re


def parse_evaluator_response(response: str):

    if not response:
        return None

    response = response.strip()

    # ---------------------------------
    # Remove Markdown code fences
    # ---------------------------------

    response = re.sub(
        r"^```(?:json)?\s*",
        "",
        response,
        flags=re.IGNORECASE
    )

    response = re.sub(
        r"\s*```$",
        "",
        response
    )

    response = response.strip()

    # ---------------------------------
    # Try normal JSON
    # ---------------------------------

    try:
        return json.loads(response)

    except json.JSONDecodeError:
        pass

    # ---------------------------------
    # Extract JSON object from
    # additional text
    # ---------------------------------

    match = re.search(
        r"\{.*\}",
        response,
        re.DOTALL
    )

    if match:

        try:
            return json.loads(
                match.group(0)
            )

        except json.JSONDecodeError:
            pass

    return None


def normalize_score(value):

    try:

        score = float(value)

        return max(
            0,
            min(
                100,
                score
            )
        )

    except (
        TypeError,
        ValueError
    ):

        return None