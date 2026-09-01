import re
from typing import List


def normalize_text(text: str) -> str:
    """
    Normalize text for comparison.
    """

    text = text.lower()

    text = re.sub(r"[^\w\s]", "", text)

    return text.strip()


def tokenize(text: str) -> List[str]:
    """
    Convert text into normalized tokens.
    """

    text = normalize_text(text)

    return text.split()


def extract_number_from_prompt(prompt: str):

    """
    Finds numbers inside prompts.

    Example:
    Explain in 100 words
    """

    numbers = re.findall(r"\d+", prompt)

    if numbers:
        return int(numbers[0])

    return None