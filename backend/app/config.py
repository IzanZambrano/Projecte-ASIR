"""Configuración de la API, leída de variables de entorno o de backend/.env."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "alpha_db"
    postgres_user: str
    postgres_password: str

    ncbi_api_key: str | None = None

    # Prefijo con el que Nginx publica la API ("/api" en srv-web; vacío en local)
    api_root_path: str = ""

    # Búsqueda diaria en PubMed (app/ingesta/programador.py)
    ingesta_activa: bool = True
    ingesta_hora: int = Field(6, ge=0, le=23)
    ingesta_minuto: int = Field(0, ge=0, le=59)
    ingesta_zona_horaria: str = "Europe/Madrid"
    ingesta_max_resultados: int = Field(50, ge=1, le=500)


settings = Settings()
