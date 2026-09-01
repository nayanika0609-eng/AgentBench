import requests


OLLAMA_URL = "http://127.0.0.1:11434/api/generate"


def run_model(
    model_name: str,
    prompt: str,
) -> str:

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": model_name,
            "prompt": prompt,
            "stream": False,

            # Reduce unnecessary generation time
            "options": {
                "temperature": 0.1,
                "num_predict": 512,
            },

            # Keep the model loaded between benchmark runs
            "keep_alive": "10m",
        },
        timeout=180,
    )

    response.raise_for_status()

    data = response.json()

    return data["response"]