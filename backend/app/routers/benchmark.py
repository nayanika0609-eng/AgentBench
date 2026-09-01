from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User

from app.schemas.benchmark import (
    BenchmarkCreate,
    BenchmarkResponse,
)

from app.services.benchmark_services import (
    create_benchmark,
    get_project_benchmarks,
    get_benchmark,
    delete_benchmark,
)

router = APIRouter(
    prefix="",
    tags=["Benchmarks"],
)
@router.post(
    "/projects/{project_id}/benchmarks",
    response_model=BenchmarkResponse,
    status_code=201,
)
def create(
    project_id: int,
    benchmark: BenchmarkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return create_benchmark(
            db,
            project_id,
            benchmark,
            current_user.id,
        )
    except ValueError as e:
        raise HTTPException(404, str(e))
@router.get(
    "/projects/{project_id}/benchmarks",
    response_model=list[BenchmarkResponse],
)
def list_project_benchmarks(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return get_project_benchmarks(
            db,
            project_id,
            current_user.id,
        )
    except ValueError as e:
        raise HTTPException(404, str(e))
@router.get(
    "/benchmarks/{benchmark_id}",
    response_model=BenchmarkResponse,
)
def get_one(
    benchmark_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return get_benchmark(
            db,
            benchmark_id,
            current_user.id,
        )
    except ValueError as e:
        raise HTTPException(404, str(e))
@router.delete(
    "/benchmarks/{benchmark_id}",
    status_code=204,
)
def delete(
    benchmark_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        delete_benchmark(
            db,
            benchmark_id,
            current_user.id,
        )
    except ValueError as e:
        raise HTTPException(404, str(e))