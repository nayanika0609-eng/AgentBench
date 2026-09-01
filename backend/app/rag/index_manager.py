from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.rag.embeddings import EmbeddingService
from app.rag.vector_store import VectorStore

import os


class IndexManager:

    @staticmethod
    def rebuild_project_index(
        db: Session,
        project_id: int
    ):

        # Delete existing index files
        index_file = f"vector_indexes/project_{project_id}.index"
        mapping_file = f"vector_indexes/project_{project_id}.npy"

        if os.path.exists(index_file):
            os.remove(index_file)

        if os.path.exists(mapping_file):
            os.remove(mapping_file)

        # Create a fresh vector store
        store = VectorStore(project_id)

        chunks = (
            db.query(DocumentChunk)
            .join(
                Document,
                Document.id == DocumentChunk.document_id
            )
            .filter(
                Document.project_id == project_id
            )
            .order_by(
                DocumentChunk.id
            )
            .all()
        )

        for chunk in chunks:

            embedding = EmbeddingService.embed_text(
                chunk.content
            )

            store.add(
                chunk.id,
                embedding
            )

        store.save()

        print(
            f"Project {project_id} index rebuilt with {store.index.ntotal} vectors."
        )