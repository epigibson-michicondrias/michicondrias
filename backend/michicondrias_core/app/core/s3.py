import boto3
from botocore.config import Config
from botocore.exceptions import NoCredentialsError, ClientError
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


def upload_file_to_s3(file_obj, object_name: str, content_type: str = "image/jpeg") -> str | None:
    """
    Uploads a file to an S3 bucket and returns the public URL.
    """
    s3_client = get_s3_client()
    try:
        s3_client.upload_fileobj(
            file_obj,
            settings.S3_BUCKET_NAME,
            object_name,
            ExtraArgs={'ContentType': content_type}
        )
        # Construct the URL
        url = f"{settings.STORAGE_BASE_URL}/{object_name}"
        return url
    except ClientError as e:
        logger.error(f"Error uploading to S3: {e}")
        return None
    except NoCredentialsError:
        logger.error("AWS Credentials not available")
        return None

def generate_presigned_url(object_name: str, expiration: int = 3600, content_type: str = "image/jpeg", method: str = 'put_object') -> str | None:
    """
    Generate a presigned URL to upload or download an object.
    """
    s3_client = get_s3_client()
    try:
        params = {
            'Bucket': settings.S3_BUCKET_NAME,
            'Key': object_name,
        }
        if method == 'put_object':
            params['ContentType'] = content_type
            
        response = s3_client.generate_presigned_url(
            ClientMethod=method,
            Params=params,
            ExpiresIn=expiration
        )
        return response
    except ClientError as e:
        logger.error(f"Error generating presigned URL ({method}): {e}")
        return None

def get_presigned_url(object_name: str, expiration: int = 3600) -> str | None:
    """
    Generate a presigned GET URL for viewing private files.
    """
    return generate_presigned_url(object_name, expiration=expiration, method='get_object')
