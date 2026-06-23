from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./firstfront.db"
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    supabase_url: str = ""
    supabase_key: str = ""
    otp_expire_minutes: int = 5
    resend_api_key: str = ""
    from_email: str = "support@firstfront.in"
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    s3_endpoint: str = ""
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_bucket_name: str = "firstfront-files"
    ai_provider: str = "groq"
    groq_api_key: str = ""
    openai_api_key: str = ""
    openrouter_api_key: str = ""
    ai_model: str = "llama-3.1-70b-versatile"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
