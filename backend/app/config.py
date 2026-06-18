from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite+aiosqlite:///./firstfront.db"
    
    # Auth / JWT
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    # OTP
    otp_expire_minutes: int = 5
    resend_api_key: str = ""
    from_email: str = "support@firstfront.in"
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""

    # Supabase (optional — used for storage)
    supabase_url: str = ""
    supabase_key: str = ""

    # File Storage — S3-compatible (Supabase Storage or MinIO)
    s3_endpoint: str = ""
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_bucket_name: str = "firstfront-files"

    # AI — Pluggable via OpenRouter
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    ai_model: str = "meta-llama/llama-3.1-8b-instruct:free"

    # Frontend URL(s) for CORS — comma-separated to allow multiple origins
    # e.g. "https://clever-dusk-256fb7.netlify.app,http://localhost:5173"
    frontend_url: str = "https://clever-dusk-256fb7.netlify.app,http://localhost:5173,http://localhost:3000"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
