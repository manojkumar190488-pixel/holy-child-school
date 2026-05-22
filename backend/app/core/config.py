from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, field_validator
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    APP_NAME: str = "Job Intelligence Agent"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/jobagent"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATABASE_POOL_TIMEOUT: int = 30

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600  # 1 hour

    # JWT
    JWT_SECRET: str = "change-this-in-production-use-a-long-random-string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/callback"

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    OPENAI_CHAT_MODEL: str = "gpt-4o"
    OPENAI_EMBEDDING_DIMENSIONS: int = 1536

    # Anthropic
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"

    # SMTP / Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_USE_TLS: bool = True
    EMAIL_FROM: str = "noreply@jobintelligence.ai"
    EMAIL_FROM_NAME: str = "Job Intelligence Agent"

    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://app.jobintelligence.ai",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return [origin.strip() for origin in v.split(",")]
        return v

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Scraping
    SCRAPING_ENABLED: bool = True
    SCRAPING_RATE_LIMIT_DELAY: float = 2.0  # seconds between requests
    SCRAPING_MAX_RETRIES: int = 3
    SCRAPING_TIMEOUT: int = 30
    USER_AGENT_ROTATION: bool = True

    # LinkedIn (optional cookies/credentials for enhanced scraping)
    LINKEDIN_COOKIES: str = ""
    LINKEDIN_EMAIL: str = ""
    LINKEDIN_PASSWORD: str = ""

    # Scheduler
    SCHEDULER_TIMEZONE: str = "Asia/Kolkata"
    DAILY_DIGEST_HOUR: int = 8
    DAILY_DIGEST_MINUTE: int = 0
    REFRESH_JOBS_INTERVAL_HOURS: int = 6

    # Feature flags
    AI_SCORING_ENABLED: bool = True
    EMAIL_NOTIFICATIONS_ENABLED: bool = True
    TELEGRAM_NOTIFICATIONS_ENABLED: bool = True
    VECTOR_SEARCH_ENABLED: bool = True

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # File Storage
    UPLOAD_DIR: str = "/app/uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # Sentry (optional)
    SENTRY_DSN: str = ""

    # Application frontend URL
    FRONTEND_URL: str = "http://localhost:3000"


settings = Settings()
