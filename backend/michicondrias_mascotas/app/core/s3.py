import boto3
from typing import Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def get_s3_client():
    if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SECRET_ACCESS_KEY:
        logger.warning("AWS credentials not fully configured in environment.")
        return None
        
    return boto3.client(
        's3',
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        aws_session_token=settings.AWS_SESSION_TOKEN
    )

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
