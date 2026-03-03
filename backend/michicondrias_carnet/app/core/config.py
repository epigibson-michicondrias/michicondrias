from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Michicondrias Carnet Medico"
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
