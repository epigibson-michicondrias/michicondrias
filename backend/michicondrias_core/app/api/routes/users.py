from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
import os

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.user import (
    UserCreate, 
    UserResponse, 
    UserMeResponse, 
    KYCPresignedUrlsResponse, 
    KYCPresignedUrl, 
    KYCFinalizeRequest
)
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
    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
        "role_name": role_name,
        "verification_status": current_user.verification_status,
        "id_front_url": current_user.id_front_url,
        "id_back_url": current_user.id_back_url,
        "proof_of_address_url": current_user.proof_of_address_url,
    }
    # Transform URLs for viewing
    return _add_kyc_presigned_urls(user_data)

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

@router.get("/me/kyc/presigned-urls", response_model=KYCPresignedUrlsResponse)
async def get_kyc_presigned_urls(
    current_user: User = Depends(deps.get_current_active_user),
    id_front_ext: str = "jpg",
    id_back_ext: str = "jpg",
    proof_ext: str = "jpg",
) -> Any:
    """
    Generate presigned URLs for KYC document uploads with specific extensions.
    """
    from app.core.s3 import generate_presigned_url
    import mimetypes
    
    mapping = {
        "id_front": id_front_ext,
        "id_back": id_back_ext,
        "proof_of_address": proof_ext
    }
    
    urls = []
    for key, ext in mapping.items():
        # Clean extension (remove leading dot if present)
        clean_ext = ext.replace(".", "")
        object_name = f"kyc/{current_user.id}/{key}.{clean_ext}"
        
        # Guess mimetype based on extension
        content_type, _ = mimetypes.guess_type(f"file.{clean_ext}")
        if not content_type:
            content_type = "image/jpeg" if clean_ext in ["jpg", "jpeg"] else "application/octet-stream"
            
        url = generate_presigned_url(object_name, content_type=content_type)
        if url:
            from app.core.config import settings
            public_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{object_name}"
            urls.append(KYCPresignedUrl(key=key, url=url, object_key=public_url))
            
    return KYCPresignedUrlsResponse(urls=urls)

@router.post("/me/kyc/finalize", response_model=UserResponse)
async def finalize_kyc(
    *,
    db: Session = Depends(get_db),
    req: KYCFinalizeRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Finalize KYC process after frontend has uploaded files to S3.
    """
    updated_user = crud.crud_user.update_user_kyc(
        db, 
        db_user=current_user,
        id_front=req.id_front_url,
        id_back=req.id_back_url,
        proof=req.proof_of_address_url
    )
    return _add_kyc_presigned_urls(updated_user)

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
    
    return _add_kyc_presigned_urls(updated_user)

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

def _add_kyc_presigned_urls(user_data: Any) -> dict:
    """Helper to transform static S3 URLs into temporary presigned GET URLs without modifying DB state."""
    from app.core.s3 import get_presigned_url
    
    # Handle both SQLAlchemy objects and dictionaries
    if hasattr(user_data, "__dict__"):
        # For SQLAlchemy objects, create a dict instead of modifying the object in place
        res = {
            "id": user_data.id,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "is_active": user_data.is_active,
            "verification_status": user_data.verification_status,
            "id_front_url": user_data.id_front_url,
            "id_back_url": user_data.id_back_url,
            "proof_of_address_url": user_data.proof_of_address_url,
            "role_id": getattr(user_data, "role_id", None),
            "role_name": getattr(user_data, "role_name", user_data.role.name if hasattr(user_data, "role") and user_data.role else None)
        }
    else:
        res = dict(user_data)
        
    for attr in ["id_front_url", "id_back_url", "proof_of_address_url"]:
        static_url = res.get(attr)
        if static_url and ".amazonaws.com/" in static_url:
            # Extract key: everything after the bucket domain
            key = static_url.split(".amazonaws.com/")[-1]
            presigned = get_presigned_url(key)
            if presigned:
                res[attr] = presigned
    return res

@router.get("/pending-verifications", response_model=List[UserResponse])
def read_pending_verifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """
    List all users with PENDING verification status. (Admin only)
    """
    users = db.query(User).filter(User.verification_status == "PENDING").all()
    # Transform URLs to be viewable by admin
    return [_add_kyc_presigned_urls(user) for user in users]

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
    return _add_kyc_presigned_urls(user)

@router.post("/{user_id}/toggle-status", response_model=UserResponse)
def toggle_user_status(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """
    Toggle user active/inactive status. (Admin only)
    """
    user = crud.crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    user.is_active = not user.is_active
    db.add(user)
    db.commit()
    db.refresh(user)
    return _add_kyc_presigned_urls(user)

@router.delete("/{user_id}", response_model=dict)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """
    Delete a user. (Admin only)
    """
    user = crud.crud_user.remove_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return {"message": "Usuario eliminado correctamente", "user_id": user_id}

@router.get("/stats/summary", response_model=dict)
def get_users_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """
    Get users statistics summary. (Admin only)
    """
    total_users = crud.crud_user.count_total_users(db)
    active_users = db.query(User).filter(User.is_active == True).count()
    
    # Count by roles
    from app.models.role import Role
    roles = db.query(Role).all()
    role_stats = {}
    for role in roles:
        role_stats[role.name] = crud.crud_user.count_users_by_role(db, role.id)
    
    # Count by verification status
    pending_verifications = crud.crud_user.count_users_by_status(db, "PENDING")
    verified_users = crud.crud_user.count_users_by_status(db, "VERIFIED")
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": total_users - active_users,
        "role_distribution": role_stats,
        "verification_status": {
            "pending": pending_verifications,
            "verified": verified_users,
            "rejected": crud.crud_user.count_users_by_status(db, "REJECTED")
        }
    }
