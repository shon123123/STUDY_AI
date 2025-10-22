from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Application
    app_name: str = "AI Study Assistant"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Database
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "study_assistant_db"
    
    # AI Model Configuration
    llama_model_name: str = "meta-llama/Llama-3.2-3B-Instruct"
    embedding_model: str = "all-MiniLM-L6-v2"
    max_tokens: int = 400
    temperature: float = 0.7
    device: str = "cuda"  # or "cpu"
    model_cache_dir: str = "./data/models"
    
    # Security
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()

def get_settings() -> Settings:
    return settings
