from pydantic import model_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Michicondrias Transporte"
    API_V1_STR: str = "/api/v1"

    # Database Connection
    DATABASE_URL: str | None = None
    
    # PostgreSQL config
    POSTGRES_USER: str = "user"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "michicondrias_db"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5433"

    SECRET_KEY: str = ""  # X8.2: sin default; se toma de la variable de entorno SECRET_KEY 
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # Tarifas y reglas de viaje (todas ajustables por entorno)
    RIDE_BASE_FARE: float = 50.0          # tarifa base (MXN)
    RIDE_PER_KM_RATE: float = 15.0        # por kilómetro
    RIDE_CARRIER_FEE: float = 20.0        # extra si el conductor aporta transportín
    RIDE_MIN_FARE: float = 60.0           # tarifa mínima
    RIDE_AVG_SPEED_KMH: float = 24.0      # velocidad media urbana (duración estimada)
    RIDE_MAX_DISTANCE_KM: float = 200.0   # distancia máxima aceptada
    RIDE_NEARBY_RADIUS_KM: float = 30.0   # radio por defecto para "solicitudes cercanas"
    RIDE_MAX_SCHEDULE_DAYS: int = 60      # máximo de días a futuro para programar

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

    

    @model_validator(mode="after")
    def _require_secret_key(self):
        """Fail-closed: sin SECRET_KEY no se pueden firmar JWT y el servicio no debe arrancar (X8.2)."""
        if not self.SECRET_KEY:
            raise ValueError(
                "Falta la variable de entorno SECRET_KEY. Sin ella no se pueden firmar ni verificar "
                "los JWT. Genera una con: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
            )
        return self

    class Config:
        case_sensitive = True

settings = Settings()
