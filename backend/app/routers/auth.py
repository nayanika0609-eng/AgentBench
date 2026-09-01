from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.user import UserRegister, UserResponse
from app.services.user_service import create_user
from app.auth.jwt_handler import create_access_token
from app.schemas.user import UserLogin, Token
from app.services.user_service import authenticate_user
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201
)
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):

    try:
        return create_user(db, user)

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
from fastapi.security import OAuth2PasswordRequestForm

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    db_user = authenticate_user(
        db,
        form_data.username,   # username field will contain the email
        form_data.password,
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(
        {
            "sub": db_user.email,
            "user_id": db_user.id,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }