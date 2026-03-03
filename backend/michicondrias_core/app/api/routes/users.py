from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
import os

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.user import UserCreate, UserResponse, UserMeResponse
from app.models.user import User
from app.models.role import Role

router = APIRouter()

@router.get("/me", response_model=UserMeResponse)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user profile including role.
    """
    role_name = current_user.role.name if current_user.role else "consumidor"
    return UserMeResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        role_name=role_name,
        verification_status=current_user.verification_status,
        id_front_url=current_user.id_front_url,
        id_back_url=current_user.id_back_url,
        proof_of_address_url=current_user.proof_of_address_url,
    )

@router.post("/register", response_model=UserResponse)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Public registration - assigns 'consumidor' role by default.
    """
    user = crud.crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un usuario con este correo electrónico.",
        )
    # Assign consumidor role by default
    consumidor_role = db.query(Role).filter(Role.name == "consumidor").first()
    if consumidor_role:
        user_in.role_id = consumidor_role.id
    user = crud.crud_user.create_user(db=db, user=user_in)
    return user

@router.get("/", response_model=List[UserResponse])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """
    Retrieve users. (Admin only)
    """
    users = crud.crud_user.get_users(db, skip=skip, limit=limit)
    return users

@router.post("/", response_model=UserResponse)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """
    Create new user with any role. (Admin only)
    """
    user = crud.crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = crud.crud_user.create_user(db=db, user=user_in)
    return user

@router.post("/me/kyc", response_model=UserResponse)
async def upload_kyc_docs(
    *,
    db: Session = Depends(get_db),
    id_front: UploadFile = File(...),
    id_back: UploadFile = File(...),
    proof_of_address: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload KYC documents (ID front, ID back, proof of address) to S3.
    """
    from app.core.s3 import upload_file_to_s3
    
    # Map files for S3 upload
    files = [
        (id_front, "id_front"),
        (id_back, "id_back"),
        (proof_of_address, "proof_of_address")
    ]
    
    saved_urls = {}
    for file, key in files:
        ext = os.path.splitext(file.filename)[1]
        object_name = f"kyc/{current_user.id}/{key}{ext}"
        
        # Upload to S3
        url = upload_file_to_s3(file.file, object_name, content_type=file.content_type)
        if not url:
            raise HTTPException(status_code=500, detail=f"Error al subir {key} a S3")
            
        saved_urls[key] = url

    # Update user in DB
    updated_user = crud.crud_user.update_user_kyc(
        db, 
        db_user=current_user,
        id_front=saved_urls["id_front"],
        id_back=saved_urls["id_back"],
        proof=saved_urls["proof_of_address"]
    )
    
    return updated_user

@router.post("/me/upgrade-role", response_model=UserResponse)
def upgrade_user_role(
    role_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    User self-upgrades to a Partner role (e.g., 'veterinario').
    In a real system, this might require manual admin approval or Stripe subscription.
    For this MVP, we grant the requested role directly if valid.
    """
    valid_roles = ["veterinario", "paseador", "vendedor", "refugio"]
    if role_name not in valid_roles:
        raise HTTPException(status_code=400, detail="Rol de asociado inválido")
    
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        raise HTTPException(status_code=404, detail=f"El rol {role_name} no existe en la base de datos")

    current_user.role_id = role.id
    db.commit()
    db.refresh(current_user)
    
    # We must also return the joined role_name conceptually. The schema might need manual population
    setattr(current_user, "role_name", role.name)

    return current_user

@router.get("/pending-verifications", response_model=List[UserResponse])
def read_pending_verifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """
    List all users with PENDING verification status. (Admin only)
    """
    users = db.query(User).filter(User.verification_status == "PENDING").all()
    return users

@router.post("/{user_id}/verify", response_model=UserResponse)
def verify_user_kyc(
    user_id: str,
    status: str, # VERIFIED or REJECTED
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """
    Approve or reject a user's KYC verification. (Admin only)
    """
    user = crud.crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    user.verification_status = status
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
