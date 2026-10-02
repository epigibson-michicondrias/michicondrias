import boto3
from botocore.config import Config
from typing import Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


def get_s3_client():
    """Cliente S3 agnóstico al proveedor (AWS S3, Oracle Object Storage, MinIO...)."""
    kwargs = {
        "region_name": settings.AWS_REGION,
        "config": Config(
            signature_version="s3v4",
            s3={"addressing_style": settings.S3_ADDRESSING_STYLE},
        ),
    }
    if settings.S3_ENDPOINT_URL:
        kwargs["endpoint_url"] = settings.S3_ENDPOINT_URL
    if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
        kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
        kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY
        if settings.AWS_SESSION_TOKEN:
            kwargs["aws_session_token"] = settings.AWS_SESSION_TOKEN
    # Sin credenciales explícitas: boto3 usa su cadena por defecto (rol IAM en Lambda)
    return boto3.client("s3", **kwargs)


def public_url(object_name: str) -> str:
    return f"{settings.STORAGE_BASE_URL}/{object_name}"


def key_from_url(url: str | None) -> str | None:
    """Devuelve la key si la URL apunta a nuestro storage (actual o AWS legado); si no, None."""
    if not url:
        return None
    if ".amazonaws.com/" in url:
        return url.split(".amazonaws.com/")[-1].split("?")[0]
    base = settings.STORAGE_BASE_URL + "/"
    if url.startswith(base):
        return url[len(base):].split("?")[0]
    return None


def generate_presigned_url(object_name: str, expiration=3600, content_type="image/jpeg") -> Optional[str]:
    """Generate a presigned URL to upload a file to S3."""
    client = get_s3_client()
    if not client:
        return None

    try:
        response = client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': settings.S3_BUCKET_NAME,
                'Key': object_name,
                'ContentType': content_type
            },
            ExpiresIn=expiration
        )
        return response
    except Exception as e:
        logger.error(f"Error generating presigned URL: {str(e)}")
        return None


# Formatos de imagen permitidos para subir con URL firmada. Fijar el tipo MIME evita que alguien aloje HTML/SVG/ejecutables en el bucket público.
IMAGE_CONTENT_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp",
    "gif": "image/gif", "heic": "image/heic", "heif": "image/heif",
}


def image_content_type(ext: str) -> tuple[str, str]:
    """Devuelve (extensión limpia, tipo MIME) o lanza ValueError si el formato no está permitido."""
    clean = (ext or "").replace(".", "").lower()
    if clean not in IMAGE_CONTENT_TYPES:
        raise ValueError(f"Formato no permitido: {clean!r}")
    return clean, IMAGE_CONTENT_TYPES[clean]
