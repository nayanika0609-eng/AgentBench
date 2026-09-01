from sentence_transformers import SentenceTransformer


class EmbeddingService:

    model = SentenceTransformer(
        "all-MiniLM-L6-v2"
    )

    @classmethod
    def embed_text(cls, text: str):

        return cls.model.encode(
            text,
            convert_to_numpy=True,
            normalize_embeddings=False,
            show_progress_bar=False,
        )