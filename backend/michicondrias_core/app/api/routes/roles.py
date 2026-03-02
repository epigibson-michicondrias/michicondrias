from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.role import RoleCreate, RoleUpdate, RoleResponse
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[RoleResponse])
def read_roles(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve roles.
    """
    roles = crud.crud_role.get_roles(db, skip=skip, limit=limit)
    return roles

@router.post("/", response_model=RoleResponse)
def create_role(
    *,
    db: Session = Depends(get_db),
    role_in: RoleCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new role.
    """
    role = crud.crud_role.get_role_by_name(db, name=role_in.name)
    if role:
        raise HTTPException(
            status_code=400,
            detail="The role with this name already exists in the system.",
        )
    role = crud.crud_role.create_role(db=db, role=role_in)
    return role

@router.put("/{role_id}", response_model=RoleResponse)
def update_role(
    *,
    db: Session = Depends(get_db),
    role_id: str,
    role_in: RoleUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a role.
    """
    role = crud.crud_role.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    # Only superadmin should be able to do this ideally, but for now we rely on active user
    role = crud.crud_role.update_role(db=db, db_role=role, role_update=role_in)
    return role

@router.delete("/{role_id}", response_model=RoleResponse)
def delete_role(
    *,
    db: Session = Depends(get_db),
    role_id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a role.
    """
    role = crud.crud_role.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    role = crud.crud_role.remove_role(db=db, role_id=role_id)
    return role
