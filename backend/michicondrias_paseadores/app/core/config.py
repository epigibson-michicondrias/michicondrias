from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Michicondrias Paseadores"
    API_V1_STR: str = "/api/v1"

    # Database Connection
    DATABASE_URL: str | None = None

    # PostgreSQL config
    POSTGRES_USER: str = "user"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "michicondrias_db"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5433"

    SECRET_KEY: str = "super_secreto_cambiar_en_produccion"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # API Gateway Configuration
    API_GATEWAY_URL: str = "http://localhost:8000"

    # AWS S3 Configuration
    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None
    AWS_SESSION_TOKEN: str | None = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "michicondrias-storage-1"

    @property
    def CORE_SERVICE_URL(self) -> str:
        return f"{self.API_GATEWAY_URL}/core"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    class Config:
        case_sensitive = True


settings = Settings()
