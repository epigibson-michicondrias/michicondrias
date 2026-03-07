from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Michicondrias Directorio API"
    API_V1_STR: str = "/api/v1/directorio"
    
    # Database Connection - Supabase
    DATABASE_URL: str = "postgresql://postgres:Michicondrias201094*@db.zaegmfufrzjmjiemrvvp.supabase.co:5432/postgres"
    
    # Supabase Configuration
    SUPABASE_URL: str = "https://zaegmfufrzjmjiemrvvp.supabase.co"
    SUPABASE_ANON_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZWdtZnV1cmptamllbXJ2dnAiLCJpYXQiOjE3MzQ4ODU5NjIsImV4cCI6MjA1MDQ2MTk2Mn0.Mn8wT2N5J5qQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q"
    SUPABASE_SERVICE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZWdtZnV1cmptamllbXJ2dnAiLCJpYXQiOjE3MzQ4ODU5NjIsImV4cCI6MjA1MDQ2MTk2Mn0.Mn8wT2N5J5qQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q"
    
    # Postgres local fallback (si Supabase no está disponible)
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
        # Priorizar Supabase
        return self.DATABASE_URL

    class Config:
        case_sensitive = True

settings = Settings()
