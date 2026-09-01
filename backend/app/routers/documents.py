from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.services.document_service import DocumentService

from app.schemas.document import DocumentResponse

from app.auth.dependencies import get_current_user

from app.models.user import User


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


# ---------------------------------
# Upload Document
# ---------------------------------

@router.post(
    "/upload/{project_id}",
    response_model=DocumentResponse,
)
def upload_document(
    project_id: int,

    file: UploadFile = File(...),

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    try:

        return DocumentService().upload_document(

            db=db,

            project_id=project_id,

            file=file,

            owner_id=current_user.id,

        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


# ---------------------------------
# List Project Documents
# ---------------------------------

@router.get(
    "/project/{project_id}"
)
def list_documents(
    project_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    try:

        return DocumentService().list_documents(

            db=db,

            project_id=project_id,

            owner_id=current_user.id,

        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


# ---------------------------------
# Delete Document
# ---------------------------------

@router.delete(
    "/{document_id}"
)
def delete_document(
    document_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    try:

        return DocumentService().delete_document(

            db=db,

            document_id=document_id,

            owner_id=current_user.id,

        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e),
        )