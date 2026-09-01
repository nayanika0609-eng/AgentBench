from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.auth.hashing import hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserRegister


def create_user(
    db: Session,
    user: UserRegister,
):
    # Check email
    existing_email = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_email:
        raise ValueError("Email already registered")

    # Check username
    existing_username = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if existing_username:
        raise ValueError("Username already taken")

    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password),
    )

    try:

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

    except IntegrityError:

        db.rollback()

        raise ValueError(
            "Username or email already exists"
        )

    return new_user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
):
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        return None

    if not verify_password(
        password,
        user.password_hash
    ):
        return None

    return user