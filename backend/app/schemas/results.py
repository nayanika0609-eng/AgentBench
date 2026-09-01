from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.services.results_service import (
    get_benchmark_results
)

from app.auth.dependencies import (
    get_current_user
)

from app.models.user import User


router = APIRouter(
    prefix="/results",
    tags=["Results"],
)


@router.get("/{benchmark_id}")
def results(
    benchmark_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    try:

        return get_benchmark_results(
            db=db,
            benchmark_id=benchmark_id,
            owner_id=current_user.id,
        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e),
        )