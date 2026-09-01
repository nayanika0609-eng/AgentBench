from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.rag import RAGRequest

from app.services.rag_service import RAGService

from app.auth.dependencies import get_current_user

from app.models.user import User


router = APIRouter(
    prefix="/rag",
    tags=["RAG"]
)


@router.post("/ask")
def ask(
    request: RAGRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    try:

        return RAGService.ask(
            db=db,

            project_id=request.project_id,

            question=request.question,

            model=request.model,

            top_k=request.top_k,

            owner_id=current_user.id,
        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e),
        )