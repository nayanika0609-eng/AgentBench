from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from fastapi.responses import Response

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.services.export_service import ExportService

from app.auth.dependencies import get_current_user

from app.models.user import User


router = APIRouter(
    prefix="/export",
    tags=["Export"]
)


@router.get("/{benchmark_id}/json")
def export_json(

    benchmark_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    service = ExportService(
        db,
        current_user.id,
    )

    report = service.export_json(
        benchmark_id
    )

    if report is None:

        raise HTTPException(
            status_code=404,
            detail="Benchmark not found"
        )

    return Response(
        content=report,
        media_type="application/json"
    )


@router.get("/{benchmark_id}/csv")
def export_csv(

    benchmark_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    service = ExportService(
        db,
        current_user.id,
    )

    csv_data = service.export_csv(
        benchmark_id
    )

    if csv_data is None:

        raise HTTPException(
            status_code=404,
            detail="Benchmark not found"
        )

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition":
                f"attachment; "
                f"filename=benchmark_{benchmark_id}.csv"
        }
    )


@router.get("/{benchmark_id}/pdf")
def export_pdf(

    benchmark_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    service = ExportService(
        db,
        current_user.id,
    )

    pdf = service.export_pdf(
        benchmark_id
    )

    if pdf is None:

        raise HTTPException(
            status_code=404,
            detail="Benchmark not found"
        )

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f"attachment; "
                f"filename=benchmark_{benchmark_id}.pdf"
        }
    )