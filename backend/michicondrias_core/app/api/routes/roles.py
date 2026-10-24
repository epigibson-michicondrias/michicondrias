from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.role import RoleCreate, RoleUpdate, RoleResponse
from app.models.user import User

router = APIRouter()

# Los permisos de todos los servicios y de la app van por NOMBRE de rol: borrar o renombrar uno de estos rompe accesos.
SYSTEM_ROLES = {
    "consumidor", "veterinario", "admin", "paseador", "cuidador", "vendedor", "patrocinador", "establecimiento",
    "clinica", "refugio", "hogar_temporal", "funeraria", "laboratorio", "aseguradora", "entrenador", "estilista",
    "transportista", "hospital",
}


def _users_count(db: Session, role_id: str) -> int:
    return db.query(func.count(User.id)).filter(User.role_id == role_id).scalar() or 0


@router.get("/", response_model=List[RoleResponse])
def read_roles(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve roles, con cuántos usuarios tiene cada uno y si es rol del sistema.
    """
    roles = crud.crud_role.get_roles(db, skip=skip, limit=limit)
    counts = dict(db.query(User.role_id, func.count(User.id)).group_by(User.role_id).all())
    return [
        {
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "users_count": counts.get(r.id, 0),
            "is_system": r.name in SYSTEM_ROLES,
        }
        for r in roles
    ]

@router.post("/", response_model=RoleResponse)
def create_role(
    *,
    db: Session = Depends(get_db),
    role_in: RoleCreate,
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """
    Create new role.
    """
    role = crud.crud_role.get_role_by_name(db, name=role_in.name)
    if role:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un rol con ese nombre.",
        )
    role = crud.crud_role.create_role(db=db, role=role_in)
    return role

@router.put("/{role_id}", response_model=RoleResponse)
def update_role(
    *,
    db: Session = Depends(get_db),
    role_id: str,
    role_in: RoleUpdate,
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """
    Update a role. Los roles del sistema solo cambian de descripción.
    """
    role = crud.crud_role.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    if role_in.name is not None and role_in.name != role.name:
        if role.name in SYSTEM_ROLES:
            raise HTTPException(status_code=400, detail="Los roles del sistema no se pueden renombrar: los permisos van por su nombre.")
        if crud.crud_role.get_role_by_name(db, name=role_in.name):
            raise HTTPException(status_code=400, detail="Ya existe un rol con ese nombre.")
    role = crud.crud_role.update_role(db=db, db_role=role, role_update=role_in)
    return role

@router.delete("/{role_id}", response_model=RoleResponse)
def delete_role(
    *,
    db: Session = Depends(get_db),
    role_id: str,
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """
    Delete a role. Rechaza roles del sistema y roles que todavía tienen usuarios.
    """
    role = crud.crud_role.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    if role.name in SYSTEM_ROLES:
        raise HTTPException(status_code=400, detail="Los roles del sistema no se pueden eliminar.")
    in_use = _users_count(db, role_id)
    if in_use:
        raise HTTPException(status_code=400, detail=f"El rol tiene {in_use} usuario(s). Cámbialos de rol antes de eliminarlo.")
    role = crud.crud_role.remove_role(db=db, role_id=role_id)
    return role
