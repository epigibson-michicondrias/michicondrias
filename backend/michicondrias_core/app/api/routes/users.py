from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
import os

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.user import (
    UserCreate, 
    UserUpdate,
    UserResponse, 
    UserMeResponse, 
    KYCPresignedUrlsResponse, 
    KYCPresignedUrl, 
    KYCFinalizeRequest,
    TwoFactorSetupResponse,
    TwoFactorVerifyRequest
)
import pyotp
from pydantic import BaseModel as PydanticBaseModel, EmailStr

from app.models.user import User
from app.models.role import Role

router = APIRouter()

class MeProfileResponse(UserMeResponse):
    """UserMeResponse + campos de perfil (schema propio del route: no se toca schemas/user.py)."""
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


@router.get("/me", response_model=MeProfileResponse)
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
        "is_two_factor_enabled": bool(current_user.is_two_factor_enabled),
        "phone": current_user.phone,
        "location": current_user.location,
        "bio": current_user.bio,
        "avatar_url": current_user.avatar_url,
    }
    # Transform URLs for viewing
    return _add_kyc_presigned_urls(user_data)

class ProfileUpdate(PydanticBaseModel):
    # Todos opcionales: solo se actualizan los campos enviados. Cadena vacía en phone/location/bio los borra.
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None


_PHONE_ALLOWED = set("0123456789 +-().")


@router.patch("/me", response_model=MeProfileResponse)
def update_user_me(
    body: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """El propio usuario edita nombre, teléfono, ubicación y bio. (Correo, rol y verificación no se pueden cambiar desde aquí.)"""
    data = body.model_dump(exclude_unset=True)
    if "full_name" in data:
        name = " ".join((data["full_name"] or "").split())
        if len(name) < 2 or len(name) > 120:
            raise HTTPException(status_code=422, detail="El nombre debe tener entre 2 y 120 caracteres")
        current_user.full_name = name
    if "phone" in data:
        phone = " ".join((data["phone"] or "").split())
        if phone:
            digits = sum(ch.isdigit() for ch in phone)
            if any(ch not in _PHONE_ALLOWED for ch in phone) or digits < 7 or digits > 15:
                raise HTTPException(status_code=422, detail="Ingresa un teléfono válido (7 a 15 dígitos)")
        current_user.phone = phone or None
    if "location" in data:
        location = " ".join((data["location"] or "").split())
        if len(location) > 120:
            raise HTTPException(status_code=422, detail="La ubicación no puede superar 120 caracteres")
        current_user.location = location or None
    if "bio" in data:
        bio = (data["bio"] or "").strip()
        if len(bio) > 500:
            raise HTTPException(status_code=422, detail="La bio no puede superar 500 caracteres")
        current_user.bio = bio or None
    db.commit()
    db.refresh(current_user)
    return read_user_me(current_user=current_user)


class DeleteAccountRequest(PydanticBaseModel):
    password: str
    totp_code: Optional[str] = None  # requerido solo si la cuenta tiene 2FA activo


# Estados que significan "todavía hay algo en curso" (los que no están aquí se consideran cerrados)
_ACTIVE_ORDER_STATUSES = ("paid", "confirmed", "shipped")
_CLOSED_RIDE_STATUSES = ("completed", "cancelled", "rejected")


def _scalar_or_none(db: Session, sql: str, params: dict):
    """Consulta a tablas de otros servicios (misma BD). Si la tabla aún no existe se ignora esa comprobación."""
    from sqlalchemy import text
    try:
        with db.begin_nested():
            return db.execute(text(sql), params).scalar()
    except Exception:
        return None


def _exec_optional(db: Session, sql: str, params: dict) -> None:
    from sqlalchemy import text
    try:
        with db.begin_nested():
            db.execute(text(sql), params)
    except Exception:
        pass


@router.delete("/me")
def delete_my_account(
    body: DeleteAccountRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Elimina la cuenta del propio usuario (requisito de Apple/Google).
    Exige la contraseña actual (y el código 2FA si lo tiene), rechaza si hay pedidos o viajes en curso,
    desactiva y anonimiza la cuenta y limpia datos personales en los servicios que comparten la BD.
    Los pedidos y donaciones se conservan sin datos personales por obligaciones contables."""
    from app.core import security
    import secrets

    if not security.verify_password(body.password, current_user.hashed_password):
        raise HTTPException(status_code=403, detail="La contraseña es incorrecta")
    if current_user.is_two_factor_enabled:
        code = (body.totp_code or "").strip()
        if not code or not pyotp.TOTP(current_user.two_factor_secret).verify(code, valid_window=1):
            raise HTTPException(status_code=403, detail="Código de verificación en dos pasos inválido o ausente")
    if current_user.role and current_user.role.name == "admin":
        raise HTTPException(status_code=400, detail="Una cuenta de administrador no se puede eliminar desde la app. Contacta a soporte.")

    uid = current_user.id
    blockers = []
    if _scalar_or_none(db, "SELECT COUNT(*) FROM orders WHERE user_id = :u AND status IN ('paid','confirmed','shipped')", {"u": uid}):
        blockers.append("tienes pedidos en curso (pagados o en camino). Espera a que se entreguen")
    if _scalar_or_none(db, """SELECT COUNT(*) FROM order_items oi JOIN products p ON p.id = oi.product_id
                               JOIN orders o ON o.id = oi.order_id
                               WHERE p.seller_id = :u AND o.status IN ('paid','confirmed','shipped')""", {"u": uid}):
        blockers.append("tienes pedidos de clientes por surtir o entregar como vendedor")
    if _scalar_or_none(db, """SELECT COUNT(*) FROM pet_rides r LEFT JOIN pets p ON p.id = r.pet_id
                               WHERE (r.driver_id = :u OR p.owner_id = :u)
                               AND r.status NOT IN ('completed','cancelled','rejected')""", {"u": uid}):
        blockers.append("tienes un viaje de transporte en curso")
    if _scalar_or_none(db, "SELECT COUNT(*) FROM pets WHERE owner_id = :u AND has_active_subscription = TRUE AND is_active IS NOT FALSE", {"u": uid}):
        blockers.append("tienes una suscripción Michi-Tracker Pro activa. Cancélala desde Facturación")
    if blockers:
        raise HTTPException(status_code=409, detail="No se puede eliminar la cuenta todavía: " + "; ".join(blockers) + ".")

    # --- Limpieza en otros servicios (misma BD; cada paso es opcional si la tabla no existe) ---
    _exec_optional(db, "UPDATE pets SET is_active = FALSE, photo_url = NULL, gallery = NULL, microchip_number = NULL WHERE owner_id = :u", {"u": uid})
    _exec_optional(db, "UPDATE lost_pets SET is_found = TRUE, contact_phone = '', image_url = NULL WHERE user_id = :u", {"u": uid})
    _exec_optional(db, "UPDATE donations SET user_id = NULL WHERE user_id = :u", {"u": uid})
    _exec_optional(db, "UPDATE products SET is_active = FALSE WHERE seller_id = :u", {"u": uid})
    _exec_optional(db, "DELETE FROM notifications WHERE user_id = :u", {"u": uid})

    # --- Anonimización de la cuenta (la fila se conserva para no romper referencias; el correo queda liberado) ---
    current_user.email = f"deleted-{uid}@deleted.michicondrias.com"
    current_user.full_name = "Usuario eliminado"
    current_user.hashed_password = security.get_password_hash(secrets.token_urlsafe(32))
    current_user.is_active = False
    current_user.avatar_url = None
    current_user.phone = None
    current_user.location = None
    current_user.bio = None
    current_user.id_front_url = None
    current_user.id_back_url = None
    current_user.proof_of_address_url = None
    current_user.verification_status = "UNVERIFIED"
    current_user.is_two_factor_enabled = False
    current_user.two_factor_secret = None
    db.commit()
    return {"deleted": True}  # JSON (no 204): el cliente móvil siempre parsea el cuerpo


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
    # Nunca se acepta el role_id que mande el cliente: el registro público siempre es "consumidor"
    user_in.role_id = consumidor_role.id if consumidor_role else None
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
    for u in users:  # la app muestra el rol por nombre; el ORM solo trae role_id
        setattr(u, "role_name", u.role.name if u.role else None)
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
    from app.core.s3 import generate_presigned_url, image_content_type, private_bucket_name, PRIVATE_SCHEME

    bucket = private_bucket_name()
    if not bucket:
        raise HTTPException(status_code=503, detail="El almacenamiento seguro de documentos no está configurado.")

    mapping = {
        "id_front": id_front_ext,
        "id_back": id_back_ext,
        "proof_of_address": proof_ext
    }

    urls = []
    for key, ext in mapping.items():
        try:
            clean_ext, content_type = image_content_type(ext)
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de imagen no permitido. Usa jpg, png, webp, gif o heic.")
        object_name = f"kyc/{current_user.id}/{key}.{clean_ext}"
        url = generate_presigned_url(object_name, content_type=content_type, bucket=bucket)
        if url:
            urls.append(KYCPresignedUrl(key=key, url=url, object_key=f"{PRIVATE_SCHEME}{object_name}"))

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
    from app.core.s3 import PRIVATE_SCHEME
    own_prefix = f"{PRIVATE_SCHEME}kyc/{current_user.id}/"
    for doc_url in (req.id_front_url, req.id_back_url, req.proof_of_address_url):
        if not doc_url.startswith(own_prefix) or ".." in doc_url:
            raise HTTPException(status_code=400, detail="Documento inválido: debe ser uno que subiste con tu cuenta.")
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
    from app.core.s3 import upload_file_to_s3, private_bucket_name

    bucket = private_bucket_name()
    if not bucket:
        raise HTTPException(status_code=503, detail="El almacenamiento seguro de documentos no está configurado.")

    allowed = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "application/pdf": "pdf"}
    max_bytes = 10 * 1024 * 1024
    files = [
        (id_front, "id_front"),
        (id_back, "id_back"),
        (proof_of_address, "proof_of_address")
    ]

    saved_urls = {}
    for file, key in files:
        ext = allowed.get(file.content_type or "")
        if not ext:
            raise HTTPException(status_code=400, detail=f"Formato no permitido en {key}. Usa jpg, png, webp, heic o pdf.")
        if file.size is not None and file.size > max_bytes:
            raise HTTPException(status_code=413, detail=f"{key} supera el máximo de 10 MB.")
        object_name = f"kyc/{current_user.id}/{key}.{ext}"

        url = upload_file_to_s3(file.file, object_name, content_type=file.content_type, bucket=bucket)
        if not url:
            raise HTTPException(status_code=500, detail=f"Error al subir {key}")

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

# --- Foto de perfil ---

class AvatarUpdate(PydanticBaseModel):
    object_key: str


@router.get("/me/avatar/presigned-url")
def get_avatar_presigned_url(
    ext: str = "jpg",
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """URL firmada para subir la foto de perfil (solo imágenes)."""
    import uuid
    from app.core.config import settings
    from app.core.s3 import generate_presigned_url, image_content_type

    try:
        clean_ext, content_type = image_content_type(ext)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de imagen no permitido. Usa jpg, png, webp, gif o heic.")
    object_name = f"avatars/{current_user.id}/{uuid.uuid4().hex}.{clean_ext}"
    url = generate_presigned_url(object_name, content_type=content_type)
    if not url:
        raise HTTPException(status_code=500, detail="No se pudo preparar la subida de la foto")
    return {"url": url, "object_key": object_name, "public_url": f"{settings.STORAGE_BASE_URL}/{object_name}"}


@router.put("/me/avatar")
def set_my_avatar(
    body: AvatarUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Guarda la foto de perfil. Solo acepta archivos subidos bajo la carpeta del propio usuario."""
    from app.core.config import settings

    key = body.object_key.strip()
    if not key.startswith(f"avatars/{current_user.id}/") or ".." in key:
        raise HTTPException(status_code=400, detail="La foto debe ser una que subiste con tu cuenta.")
    current_user.avatar_url = f"{settings.STORAGE_BASE_URL}/{key}"
    db.commit()
    return {"avatar_url": current_user.avatar_url}


@router.get("/me/avatar")
def get_my_avatar(current_user: User = Depends(deps.get_current_active_user)) -> Any:
    return {"avatar_url": current_user.avatar_url}


# Roles profesionales que un usuario puede solicitar tras tener su identidad (KYC) aprobada.
# 'admin' y 'consumidor' nunca se auto-asignan. 'clinica' se conserva por compatibilidad (la app usa 'hospital').
SELF_SERVICE_ROLES = [
    "veterinario", "hospital", "clinica", "refugio", "hogar_temporal", "vendedor",
    "paseador", "cuidador", "patrocinador", "establecimiento", "funeraria",
    "aseguradora", "laboratorio", "entrenador", "estilista", "transportista",
]


class RoleUpgradeResponse(UserResponse):
    """Usuario + token nuevo: el JWT lleva el rol, así que tras el cambio hay que emitir uno actualizado."""
    access_token: str
    token_type: str = "bearer"


class RefreshTokenResponse(PydanticBaseModel):
    access_token: str
    token_type: str = "bearer"
    role_name: str
    verification_status: str


def _issue_token_for(user: User) -> tuple[str, str]:
    from app.core import security
    role_name = user.role.name if user.role else "consumidor"
    return security.create_access_token(user.id, role=role_name), role_name


@router.post("/me/refresh-token", response_model=RefreshTokenResponse)
def refresh_my_token(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Emite un access token nuevo con el rol ACTUAL de la base de datos.
    Úsalo cuando el rol cambió (aprobación de rol, cambio hecho por un admin) sin cerrar sesión.
    """
    token, role_name = _issue_token_for(current_user)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role_name": role_name,
        "verification_status": current_user.verification_status or "UNVERIFIED",
    }


@router.post("/me/upgrade-role", response_model=RoleUpgradeResponse)
def upgrade_user_role(
    role_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    El usuario se convierte en Partner (p. ej. 'veterinario').
    Requiere que un admin ya haya aprobado la verificación de identidad (KYC).
    Devuelve un token nuevo con el rol actualizado (el JWT lleva el rol).
    """
    if role_name not in SELF_SERVICE_ROLES:
        raise HTTPException(status_code=400, detail="Rol de asociado inválido")

    # Los roles profesionales dan acceso a datos y funciones sensibles: antes cualquiera podía elegirlos sin verificación.
    if current_user.verification_status != "VERIFIED":
        raise HTTPException(
            status_code=403,
            detail="Primero verifica tu identidad y espera la aprobación de un administrador para tener una cuenta profesional.",
        )

    # Un admin no puede degradarse a sí mismo por esta vía.
    if current_user.role and current_user.role.name == "admin":
        raise HTTPException(status_code=400, detail="Una cuenta de administrador no puede cambiar a un rol de asociado")

    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        raise HTTPException(status_code=404, detail=f"El rol {role_name} no existe en la base de datos")

    current_user.role_id = role.id
    db.commit()
    db.refresh(current_user)

    setattr(current_user, "role_name", role.name)
    token, _ = _issue_token_for(current_user)
    data = _add_kyc_presigned_urls(current_user)
    data["access_token"] = token
    data["token_type"] = "bearer"
    return data

def _add_kyc_presigned_urls(user_data: Any) -> dict:
    """Helper to transform static S3 URLs into temporary presigned GET URLs without modifying DB state."""
    from app.core.s3 import get_presigned_url, key_from_url, private_bucket_name, PRIVATE_SCHEME
    
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
        if static_url and static_url.startswith(PRIVATE_SCHEME):
            presigned = get_presigned_url(static_url[len(PRIVATE_SCHEME):], bucket=private_bucket_name())
            if presigned:
                res[attr] = presigned
            continue
        key = key_from_url(static_url)  # documentos antiguos guardados en el bucket público
        if key:
            presigned = get_presigned_url(key)
            if presigned:
                res[attr] = presigned
    return res

class AdminUserUpdate(PydanticBaseModel):
    """Campos que un admin puede editar. Todos opcionales (antes role_id y password se ignoraban en silencio)."""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    role_id: Optional[str] = None
    password: Optional[str] = None
    verification_status: Optional[str] = None


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    *,
    db: Session = Depends(get_db),
    user_in: AdminUserUpdate,
    current_user: User = Depends(deps.require_role("admin")),
) -> Any:
    """
    Update a user. (Admin only). Puede cambiar nombre, correo, rol, estado, contraseña y verificación.
    El usuario afectado recibe el rol nuevo en su siguiente sincronización de sesión (POST /users/me/refresh-token).
    """
    user = crud.crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    data = user_in.model_dump(exclude_unset=True)

    if "role_id" in data and data["role_id"]:
        if not db.query(Role).filter(Role.id == data["role_id"]).first():
            raise HTTPException(status_code=400, detail="El rol indicado no existe")
        # Un admin no puede quitarse a sí mismo el rol de admin (evita quedarse sin acceso)
        if user.id == current_user.id and data["role_id"] != user.role_id:
            raise HTTPException(status_code=400, detail="No puedes cambiar tu propio rol")
    else:
        data.pop("role_id", None)

    if "email" in data and data["email"] and data["email"] != user.email:
        if crud.crud_user.get_user_by_email(db, email=data["email"]):
            raise HTTPException(status_code=400, detail="Ya existe un usuario con ese correo")

    if "verification_status" in data and data["verification_status"] not in (None, "UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"):
        raise HTTPException(status_code=400, detail="Estado de verificación inválido")

    if "is_active" in data and data["is_active"] is False and user.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes desactivar tu propia cuenta")

    password = data.pop("password", None)
    if password:
        if len(password) < 8:
            raise HTTPException(status_code=422, detail="La contraseña debe tener al menos 8 caracteres")
        from app.core.security import get_password_hash
        user.hashed_password = get_password_hash(password)

    for field, value in data.items():
        if value is None and field in ("email", "is_active"):
            continue
        setattr(user, field, value)

    db.add(user)
    db.commit()
    db.refresh(user)
    setattr(user, "role_name", user.role.name if user.role else None)
    return _add_kyc_presigned_urls(user)


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
    Notifica al usuario para que la app le muestre el siguiente paso (elegir su cuenta profesional).
    """
    status = (status or "").upper()
    if status not in ("VERIFIED", "REJECTED"):
        raise HTTPException(status_code=400, detail="status debe ser VERIFIED o REJECTED")
    user = crud.crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.verification_status = status
    db.add(user)
    db.commit()
    db.refresh(user)

    try:
        from app.schemas.notification import NotificationCreate
        from app.crud import crud_notification
        if status == "VERIFIED":
            title, message = "Identidad verificada", "Aprobamos tu identidad. Ya puedes activar tu cuenta profesional desde Más > Ser Profesional."
        else:
            title, message = "Verificación rechazada", "No pudimos aprobar tus documentos. Súbelos de nuevo con fotos claras desde Perfil > Seguridad y KYC."
        crud_notification.create_notification(db, NotificationCreate(user_id=user.id, title=title, message=message, type="kyc"))
    except Exception:  # la notificación nunca debe impedir la decisión del admin
        db.rollback()
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
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes desactivar tu propia cuenta")
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
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta")
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

@router.post("/me/2fa/setup", response_model=TwoFactorSetupResponse)
def setup_two_factor(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Generate a new TOTP secret for 2FA setup.
    Returns the secret and the otpauth URL for generating a QR code.
    """
    if current_user.is_two_factor_enabled:
        raise HTTPException(status_code=400, detail="2FA ya está habilitado para esta cuenta")
    
    # Generate random secret key
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    # Generate standard otpauth URL
    otpauth_url = totp.provisioning_uri(
        name=current_user.email,
        issuer_name="Michicondrias"
    )
    
    return {
        "secret": secret,
        "otpauth_url": otpauth_url
    }

@router.post("/me/2fa/enable", response_model=UserResponse)
def enable_two_factor(
    body: TwoFactorVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Enable 2FA for the account after verifying a code from the setup process.
    """
    if current_user.is_two_factor_enabled:
        raise HTTPException(status_code=400, detail="2FA ya está habilitado")
        
    # Verify the code using the secret provided
    totp = pyotp.TOTP(body.secret)
    if not totp.verify(body.code):
        raise HTTPException(status_code=400, detail="Código de verificación inválido")
        
    # Save to database
    user = crud.crud_user.enable_two_factor(db, db_user=current_user, secret=body.secret)
    return _add_kyc_presigned_urls(user)

@router.post("/me/2fa/disable", response_model=UserResponse)
def disable_two_factor(
    body: TwoFactorVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Disable 2FA for the account by verifying a code with the current active secret.
    """
    if not current_user.is_two_factor_enabled:
        raise HTTPException(status_code=400, detail="2FA no está habilitado")
        
    # Verify code using the stored secret
    totp = pyotp.TOTP(current_user.two_factor_secret)
    if not totp.verify(body.code):
        raise HTTPException(status_code=400, detail="Código de verificación inválido")
        
    # Disable in database
    user = crud.crud_user.disable_two_factor(db, db_user=current_user)
    return _add_kyc_presigned_urls(user)


