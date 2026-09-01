from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.projects import ProjectCreate, ProjectUpdate


def create_project(
    db: Session,
    project: ProjectCreate,
    owner_id: int,
):

    new_project = Project(
        name=project.name,
        description=project.description,
        owner_id=owner_id,
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


def get_projects(
    db: Session,
    owner_id: int,
):

    return (
        db.query(Project)
        .filter(Project.owner_id == owner_id)
        .all()
    )


def get_project(
    db: Session,
    project_id: int,
    owner_id: int,
):

    return (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == owner_id,
        )
        .first()
    )


def update_project(
    db: Session,
    db_project: Project,
    project: ProjectUpdate,
):

    db_project.name = project.name
    db_project.description = project.description

    db.commit()
    db.refresh(db_project)

    return db_project


def delete_project(
    db: Session,
    db_project: Project,
):

    db.delete(db_project)
    db.commit()