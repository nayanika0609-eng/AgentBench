from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.projects import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
)
from app.services.project_service import (
    create_project,
    get_projects,
    get_project,
    update_project,
    delete_project,
)

router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)
@router.post(
    "",
    response_model=ProjectResponse,
    status_code=201,
)
def create_new_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return create_project(
        db,
        project,
        current_user.id,
    )
@router.get(
    "",
    response_model=list[ProjectResponse],
)
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return get_projects(
        db,
        current_user.id,
    )
@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
)
def get_single_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    project = get_project(
        db,
        project_id,
        current_user.id,
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return project
@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
)
def edit_project(
    project_id: int,
    updated: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    project = get_project(
        db,
        project_id,
        current_user.id,
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return update_project(
        db,
        project,
        updated,
    )
@router.delete("/{project_id}")
def remove_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    project = get_project(
        db,
        project_id,
        current_user.id,
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    delete_project(
        db,
        project,
    )

    return {
        "message": "Project deleted successfully"
    }
