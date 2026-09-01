from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.services.comparison_service import (
    compare_benchmark
)

from app.schemas.comparison import (
    BenchmarkComparison
)

from app.auth.dependencies import (
    get_current_user
)

from app.models.user import User


router = APIRouter(
    prefix="/comparison",
    tags=["Comparison"],
)


@router.get(
    "/{benchmark_id}",
    response_model=BenchmarkComparison,
)
def comparison(
    benchmark_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    try:

        return compare_benchmark(
            db=db,
            benchmark_id=benchmark_id,
            owner_id=current_user.id,
        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e),
        )