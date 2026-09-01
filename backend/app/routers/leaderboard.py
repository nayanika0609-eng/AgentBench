from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.auth.dependencies import get_current_user
from app.models.user import User

from app.services.leaderboard_service import get_leaderboard

from app.schemas.leaderboard import LeaderboardEntry


router = APIRouter(
    prefix="/leaderboard",
    tags=["Leaderboard"],
)


@router.get(
    "/",
    response_model=List[LeaderboardEntry],
)
def leaderboard(
    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    return get_leaderboard(db)