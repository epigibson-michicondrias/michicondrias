import boto3
from botocore.exceptions import NoCredentialsError, ClientError
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def get_s3_client():
    if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
        client_kwargs = {
            'aws_access_key_id': settings.AWS_ACCESS_KEY_ID,
            'aws_secret_access_key': settings.AWS_SECRET_ACCESS_KEY,
            'region_name': settings.AWS_REGION
        }
        if settings.AWS_SESSION_TOKEN:
            client_kwargs['aws_session_token'] = settings.AWS_SESSION_TOKEN
            
        return boto3.client('s3', **client_kwargs)
        
    # If no credentials, try to use IAM role (for Lambda natively)
    return boto3.client('s3', region_name=settings.AWS_REGION)

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
        url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{object_name}"
        return url
    except ClientError as e:
        logger.error(f"Error uploading to S3: {e}")
        return None
    except NoCredentialsError:
        logger.error("AWS Credentials not available")
        return None

def generate_presigned_url(object_name: str, expiration=3600) -> str | None:
    """
    Generate a presigned URL to share an S3 object
    """
    s3_client = get_s3_client()
    try:
        response = s3_client.generate_presigned_url(
            'put_object',
            Params={'Bucket': settings.S3_BUCKET_NAME, 'Key': object_name},
            ExpiresIn=expiration
        )
    except ClientError as e:
        logger.error(f"Error generating presigned URL: {e}")
        return None
    except NoCredentialsError:
        logger.error("AWS Credentials not available")
        return None
    return response
