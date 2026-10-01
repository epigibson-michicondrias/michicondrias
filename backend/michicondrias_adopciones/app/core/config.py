from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Michicondrias Adopciones API"
    API_V1_STR: str = "/api/v1"
    
    # Database Connection
    DATABASE_URL: str | None = None
    
    # Postgres local default (same db shared with core)
    POSTGRES_USER: str = "user"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "michicondrias_db"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5433"
    
    SECRET_KEY: str = "super_secreto_cambiar_en_produccion" 
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    # API Gateway Configuration
    # IN AWS: Set this via API_GATEWAY_URL env var
    API_GATEWAY_URL: str = "http://localhost:8000"
    
    # S3 Credentials
    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None
    AWS_SESSION_TOKEN: str | None = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "michicondrias-storage-1"

    # Storage (S3 o compatible). Vacío = AWS S3. En Oracle Object Storage:
    #   S3_ENDPOINT_URL=https://<namespace>.compat.objectstorage.<region>.oraclecloud.com
    #   S3_ADDRESSING_STYLE=path
    #   STORAGE_PUBLIC_BASE_URL=https://objectstorage.<region>.oraclecloud.com/n/<namespace>/b/<bucket>/o
    S3_ENDPOINT_URL: str | None = None
    S3_ADDRESSING_STYLE: str = "virtual"
    STORAGE_PUBLIC_BASE_URL: str | None = None

    @property
    def STORAGE_BASE_URL(self) -> str:
        if self.STORAGE_PUBLIC_BASE_URL:
            return self.STORAGE_PUBLIC_BASE_URL.rstrip("/")
        return f"https://{self.S3_BUCKET_NAME}.s3.{self.AWS_REGION}.amazonaws.com"
    
    @property
    def CORE_SERVICE_URL(self) -> str:
        return f"{self.API_GATEWAY_URL}/core"

    @property
    def MASCOTAS_SERVICE_URL(self) -> str:
        return f"{self.API_GATEWAY_URL}/mascotas"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    class Config:
        case_sensitive = True

settings = Settings()
