import re

from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.document_chunk import DocumentChunk

from app.rag.embeddings import EmbeddingService
from app.rag.vector_store import VectorStore


class Retriever:

    def __init__(
        self,
        vector_store: VectorStore
    ):
        self.vector_store = vector_store

    @staticmethod
    def _tokenize(text: str) -> set[str]:

        return set(
            re.findall(
                r"\b[a-zA-Z0-9]{2,}\b",
                text.lower()
            )
        )

    @staticmethod
    def _lexical_score(
        question: str,
        content: str
    ) -> float:

        question_words = Retriever._tokenize(
            question
        )

        content_words = Retriever._tokenize(
            content
        )

        if not question_words:
            return 0.0

        overlap = (
            question_words &
            content_words
        )

        return len(overlap) / len(question_words)

    def retrieve(
        self,
        db: Session,
        question: str,
        top_k: int = 5
    ):

        query_embedding = (
            EmbeddingService.embed_text(
                question
            )
        )

        # Retrieve more candidates than we
        # ultimately return.
        candidate_k = max(
            top_k * 3,
            15
        )

        results = self.vector_store.search(
            query_embedding,
            candidate_k
        )

        if not results:
            return []

        chunk_ids = [
            item["chunk_id"]
            for item in results
        ]

        rows = (
            db.query(
                DocumentChunk,
                Document
            )
            .join(
                Document,
                Document.id ==
                DocumentChunk.document_id
            )
            .filter(
                DocumentChunk.id.in_(chunk_ids)
            )
            .all()
        )

        chunk_map = {
            chunk.id: (
                chunk,
                document
            )
            for chunk, document in rows
        }

        candidates = []

        for result in results:

            chunk_id = result["chunk_id"]

            if chunk_id not in chunk_map:
                continue

            chunk, document = chunk_map[
                chunk_id
            ]

            lexical_score = (
                self._lexical_score(
                    question,
                    chunk.content
                )
            )

            distance = result["distance"]

            # Convert smaller FAISS distance into
            # a larger semantic score.
            semantic_score = 1 / (
                1 + distance
            )

            combined_score = (
                semantic_score * 0.75
                +
                lexical_score * 0.25
            )

            candidates.append({

                "chunk_id": chunk.id,

                "document_id": document.id,

                "filename": document.filename,

                "chunk_index": chunk.chunk_index,

                "content": chunk.content,

                "distance": distance,

                "semantic_score":
                    semantic_score,

                "lexical_score":
                    lexical_score,

                "combined_score":
                    combined_score,

            })

        # Highest combined relevance first.
        candidates.sort(
            key=lambda x: x["combined_score"],
            reverse=True
        )

        selected = candidates[:top_k]

        retrieved = []

        for rank, item in enumerate(
            selected,
            start=1
        ):

            item["rank"] = rank

            retrieved.append(item)

        return retrieved