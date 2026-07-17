from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # NOTE: not currently used anywhere — app/db/database.py builds its own
    # connection string from DB_USER/DB_PASSWORD/DB_HOST/DB_PORT/DB_NAME
    # (falling back to sqlite:///./ladli_v2.db). Kept here for reference only;
    # if you want this to actually control the DB connection, wire it into
    # db/database.py instead of editing this default.
    #
    # IMPORTANT: `Field(env=...)` is Pydantic v1 syntax. In pydantic-settings
    # v2 it is NOT a recognized parameter — it silently gets swallowed into
    # json_schema_extra and does nothing, so these fields always fell back to
    # their hardcoded defaults no matter what was in .env. Use
    # `validation_alias` instead, which is what actually binds to the env var.
    database_url: str = Field(default="sqlite:///./ladli_v2.db", validation_alias="DATABASE_URL")
    # JWT secret key — matches the SECRET_KEY var already used in .env
    jwt_secret_key: str = Field(default="change-me", validation_alias="SECRET_KEY")
    # JWT algorithm — matches the ALGORITHM var already used in .env
    jwt_algorithm: str = Field(default="HS256", validation_alias="ALGORITHM")
    # CORS allowed origins – can be comma-separated in .env
    # Supports both CORS_ORIGINS and BACKEND_CORS_ORIGINS for compatibility
    cors_origins: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
        alias="BACKEND_CORS_ORIGINS"
    )

    class Config:
        extra = "allow"
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Allow both the field name and alias to be used
        populate_by_name = True


settings = Settings()
