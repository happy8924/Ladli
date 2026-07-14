from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # Database URL – defaults to SQLite for local dev; can be overridden via .env
    database_url: str = Field(default="sqlite:///./ladli.db", env="DATABASE_URL")
    # JWT secret key
    jwt_secret_key: str = Field(default="change-me", env="JWT_SECRET_KEY")
    # JWT algorithm
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    # CORS allowed origins – can be comma‑separated in .env
    cors_origins: str = Field(default="http://localhost:5173,http://127.0.0.1:5173", env="CORS_ORIGINS")

    class Config:
        extra = "allow"
        env_file_encoding = "utf-8"

settings = Settings()
