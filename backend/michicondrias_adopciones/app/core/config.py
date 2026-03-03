from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Michicondrias Adopciones API"
    API_V1_STR: str = "/api/v1/adopciones"
    
    # Database Connection
    DATABASE_URL: str | None = None
    
    # Postgres local default (same db shared with core)
    POSTGRES_USER: str = "user"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "michicondrias_db"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5433"

    # API Gateway Configuration
    # IN AWS: Set this via API_GATEWAY_URL env var
    API_GATEWAY_URL: str = "http://localhost:8000"
    
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
