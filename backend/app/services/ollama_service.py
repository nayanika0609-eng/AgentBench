import requests


OLLAMA_URL = "http://127.0.0.1:11434/api/generate"


class OllamaService:

    @staticmethod
    def generate(
        model: str,
        prompt: str,
        temperature: float = 0.2,
    ):

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "keep_alive": "10m",
                "options": {
                    "temperature": temperature,
                    "num_predict": 256,
                },
            },
            timeout=180,
        )

        response.raise_for_status()

        return response.json()["response"]