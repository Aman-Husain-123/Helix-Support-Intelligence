import os

class Settings:
    PROJECT_NAME: str = "Helix Support Intelligence"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-jwt-keep-it-safe")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./helix.db")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    LLM_MODEL: str = "gpt-4o"

settings = Settings()
