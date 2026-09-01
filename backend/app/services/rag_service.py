import time

from sqlalchemy.orm import Session

from app.rag.retriever import Retriever
from app.rag.vector_store import VectorStore

from app.services.ollama_service import OllamaService

from app.rag.context_builder import ContextBuilder

from app.models.project import Project


class RAGService:

    @staticmethod
    def ask(
        db: Session,
        project_id: int,
        question: str,
        model: str = "llama3.1:8b",
        top_k: int = 5,
        owner_id: int = None,
    ):

        # ---------------------------------
        # Project ownership check
        # ---------------------------------

        project = (
            db.query(Project)
            .filter(
                Project.id == project_id,
                Project.owner_id == owner_id,
            )
            .first()
        )

        if project is None:

            raise ValueError(
                "Project not found"
            )

        # ---------------------------------
        # Start timing
        # ---------------------------------

        total_start = time.perf_counter()

        # ---------------------------------
        # Vector store
        # ---------------------------------

        store = VectorStore(
            project_id
        )

        if store.index.ntotal == 0:

            return {
                "success": False,
                "message": (
                    "No documents have been indexed "
                    "for this project."
                )
            }

        # ---------------------------------
        # Retrieval
        # ---------------------------------

        retrieval_start = time.perf_counter()

        retriever = Retriever(
            store
        )

        retrieved = retriever.retrieve(
            db=db,
            question=question,
            top_k=top_k
        )

        retrieval_time_ms = (
            time.perf_counter()
            - retrieval_start
        ) * 1000

        if not retrieved:

            return {
                "success": False,
                "message": (
                    "No relevant information "
                    "was found."
                )
            }

        # ---------------------------------
        # Context
        # ---------------------------------

        context = ContextBuilder.build(
            retrieved
        )

        prompt = ContextBuilder.build_prompt(
            question,
            context
        )

        # ---------------------------------
        # Generation
        # ---------------------------------

        generation_start = time.perf_counter()

        answer = OllamaService.generate(
            model=model,
            prompt=prompt
        )

        generation_time_ms = (
            time.perf_counter()
            - generation_start
        ) * 1000

        total_time_ms = (
            time.perf_counter()
            - total_start
        ) * 1000

        # ---------------------------------
        # Sources
        # ---------------------------------

        sources = []

        for item in retrieved:

            sources.append(
                {
                    "rank": item["rank"],

                    "document_id":
                        item["document_id"],

                    "filename":
                        item["filename"],

                    "chunk_id":
                        item["chunk_id"],

                    "chunk_index":
                        item["chunk_index"],

                    "distance":
                        round(
                            item["distance"],
                            6
                        ),
                }
            )

        # ---------------------------------
        # Final response
        # ---------------------------------

        return {

            "success": True,

            "question": question,

            "answer": answer,

            "model": model,

            "chunks_used": len(
                retrieved
            ),

            "sources": sources,

            "metrics": {

                "retrieval_time_ms":
                    round(
                        retrieval_time_ms,
                        2
                    ),

                "generation_time_ms":
                    round(
                        generation_time_ms,
                        2
                    ),

                "total_time_ms":
                    round(
                        total_time_ms,
                        2
                    ),
            },
        }