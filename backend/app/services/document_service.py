import os
import shutil

from fastapi import UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.project import Project

from app.rag.loader import DocumentLoader
from app.rag.chunker import TextChunker
from app.rag.index_manager import IndexManager

from app.utils.file_hash import FileHash


UPLOAD_FOLDER = "uploads"


class DocumentService:

    # ---------------------------------
    # Upload Document
    # ---------------------------------

    def upload_document(
        self,
        db: Session,
        project_id: int,
        file: UploadFile,
        owner_id: int,
    ):

        # ---------------------------------
        # Verify project ownership
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
        # Prepare upload folder
        # ---------------------------------

        os.makedirs(
            UPLOAD_FOLDER,
            exist_ok=True
        )

        filepath = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        # ---------------------------------
        # Save file
        # ---------------------------------

        with open(
            filepath,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        try:

            # ---------------------------------
            # Calculate SHA-256 hash
            # ---------------------------------

            file_hash = FileHash.calculate(
                filepath
            )

            # ---------------------------------
            # Duplicate Detection
            # ---------------------------------

            existing = (
                db.query(Document)
                .filter(
                    Document.project_id == project_id,
                    Document.hash == file_hash
                )
                .first()
            )

            if existing:

                if os.path.exists(filepath):
                    os.remove(filepath)

                return existing

            # ---------------------------------
            # Save Document
            # ---------------------------------

            document = Document(
                project_id=project_id,
                filename=file.filename,
                filepath=filepath,
                filetype=file.filename.split(".")[-1],
                hash=file_hash
            )

            db.add(document)
            db.commit()
            db.refresh(document)

            # ---------------------------------
            # Extract Text
            # ---------------------------------

            text = DocumentLoader.load(
                filepath
            )

            # ---------------------------------
            # Chunk Text
            # ---------------------------------

            chunks = TextChunker.chunk(
                text
            )

            # ---------------------------------
            # Save Chunks
            # ---------------------------------

            for index, chunk in enumerate(chunks):

                db.add(
                    DocumentChunk(
                        document_id=document.id,
                        chunk_index=index,
                        content=chunk
                    )
                )

            db.commit()

            # ---------------------------------
            # Rebuild FAISS Index
            # ---------------------------------

            IndexManager.rebuild_project_index(
                db,
                project_id
            )

            return document

        except Exception:

            db.rollback()

            # Remove uploaded file if processing fails
            if os.path.exists(filepath):
                os.remove(filepath)

            raise

    # ---------------------------------
    # List Project Documents
    # ---------------------------------

    def list_documents(
        self,
        db: Session,
        project_id: int,
        owner_id: int,
    ):
        """
        List all documents for a project the user owns,
        along with the number of indexed chunks.
        """

        # ---------------------------------
        # Verify project ownership
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
        # Get documents + chunk counts
        # ---------------------------------

        rows = (
            db.query(
                Document,
                func.count(
                    DocumentChunk.id
                ).label("chunk_count"),
            )
            .outerjoin(
                DocumentChunk,
                DocumentChunk.document_id
                == Document.id,
            )
            .filter(
                Document.project_id
                == project_id
            )
            .group_by(
                Document.id
            )
            .order_by(
                Document.uploaded_at.desc()
            )
            .all()
        )

        results = []

        for document, chunk_count in rows:

            results.append(
                {
                    "id": document.id,
                    "project_id": document.project_id,
                    "filename": document.filename,
                    "filetype": document.filetype,
                    "uploaded_at": document.uploaded_at,
                    "chunk_count": chunk_count,
                }
            )

        return results

    # ---------------------------------
    # Delete Document
    # ---------------------------------

    def delete_document(
        self,
        db: Session,
        document_id: int,
        owner_id: int,
    ):
        """
        Delete a document owned by the current user.

        This removes:
        1. Document chunks
        2. Document database record
        3. Physical uploaded file
        4. Project FAISS index is rebuilt
        """

        # ---------------------------------
        # Find document + verify ownership
        # ---------------------------------

        document = (
            db.query(Document)
            .join(
                Project,
                Project.id == Document.project_id,
            )
            .filter(
                Document.id == document_id,
                Project.owner_id == owner_id,
            )
            .first()
        )

        if document is None:
            raise ValueError(
                "Document not found"
            )

        project_id = document.project_id
        filepath = document.filepath

        try:

            # ---------------------------------
            # Delete indexed chunks
            # ---------------------------------

            db.query(DocumentChunk).filter(
                DocumentChunk.document_id
                == document.id
            ).delete(
                synchronize_session=False
            )

            # ---------------------------------
            # Delete document database record
            # ---------------------------------

            db.delete(document)

            db.commit()

            # ---------------------------------
            # Delete physical file
            # ---------------------------------

            if (
                filepath
                and os.path.exists(filepath)
            ):
                os.remove(filepath)

            # ---------------------------------
            # Rebuild FAISS index
            # ---------------------------------

            IndexManager.rebuild_project_index(
                db,
                project_id
            )

            # ---------------------------------
            # Return success
            # ---------------------------------

            return {
                "success": True,
                "message": "Document deleted successfully",
                "document_id": document_id,
            }

        except Exception:

            db.rollback()

            raise