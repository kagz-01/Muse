"""
Production Configuration Management for Muse AI Engine

Centralizes all configuration with sensible defaults, validation, and documentation.
"""

import os
import logging
from typing import Optional, Literal
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class EnvironmentType(str, Enum):
    """Environment types."""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

class NLPEngineType(str, Enum):
    """Available NLP engine types."""
    LOCAL = "local"  # Fast local NLP (free, instant)
    GROQ_ENRICHED = "groq_enriched"  # Local + Groq API (fast, diverse)

@dataclass
class NLPConfig:
    """NLP Engine Configuration."""
    engine_type: NLPEngineType
    groq_api_key: Optional[str]
    cache_ttl_minutes: int
    max_cache_size: int
    enable_spacy: bool
    enable_textblob: bool
    max_text_length: int  # Max chars to analyze
    
    @classmethod
    def from_env(cls):
        """Load from environment variables."""
        engine_type = os.getenv("NLP_ENGINE_TYPE", "groq_enriched").lower()
        
        try:
            engine = NLPEngineType(engine_type)
        except ValueError:
            logger.warning(f"Invalid NLP_ENGINE_TYPE: {engine_type}, using groq_enriched")
            engine = NLPEngineType.GROQ_ENRICHED
        
        return cls(
            engine_type=engine,
            groq_api_key=os.getenv("GROQ_API_KEY"),
            cache_ttl_minutes=int(os.getenv("NLP_CACHE_TTL_MINUTES", "60")),
            max_cache_size=int(os.getenv("NLP_MAX_CACHE_SIZE", "1000")),
            enable_spacy=os.getenv("NLP_ENABLE_SPACY", "true").lower() == "true",
            enable_textblob=os.getenv("NLP_ENABLE_TEXTBLOB", "true").lower() == "true",
            max_text_length=int(os.getenv("NLP_MAX_TEXT_LENGTH", "10000")),
        )

@dataclass
class SynthesisConfig:
    """Synthesis Engine Configuration."""
    model: str  # e.g., "gpt-4o", "gpt-4-turbo"
    temperature: float
    max_tokens: int
    timeout_seconds: int
    use_groq_for_synthesis: bool
    
    @classmethod
    def from_env(cls):
        """Load from environment variables."""
        return cls(
            model=os.getenv("SYNTHESIS_MODEL", "gpt-4o"),
            temperature=float(os.getenv("SYNTHESIS_TEMPERATURE", "0.4")),
            max_tokens=int(os.getenv("SYNTHESIS_MAX_TOKENS", "1000")),
            timeout_seconds=int(os.getenv("SYNTHESIS_TIMEOUT_SECONDS", "30")),
            use_groq_for_synthesis=os.getenv("SYNTHESIS_USE_GROQ", "false").lower() == "true",
        )

@dataclass
class APIConfig:
    """API Configuration."""
    host: str
    port: int
    log_level: str
    enable_metrics: bool
    enable_health_check: bool
    
    @classmethod
    def from_env(cls):
        """Load from environment variables."""
        return cls(
            host=os.getenv("API_HOST", "0.0.0.0"),
            port=int(os.getenv("API_PORT", "8000")),
            log_level=os.getenv("LOG_LEVEL", "INFO"),
            enable_metrics=os.getenv("ENABLE_METRICS", "true").lower() == "true",
            enable_health_check=os.getenv("ENABLE_HEALTH_CHECK", "true").lower() == "true",
        )

@dataclass
class DatabaseConfig:
    """Database Configuration."""
    url: str
    pool_size: int
    max_overflow: int
    echo: bool
    
    @classmethod
    def from_env(cls):
        """Load from environment variables."""
        return cls(
            url=os.getenv("DATABASE_URL", "postgresql://user:password@localhost/muse"),
            pool_size=int(os.getenv("DATABASE_POOL_SIZE", "10")),
            max_overflow=int(os.getenv("DATABASE_MAX_OVERFLOW", "20")),
            echo=os.getenv("DATABASE_ECHO", "false").lower() == "true",
        )

class Config:
    """Master configuration class."""
    
    env: EnvironmentType
    nlp: NLPConfig
    synthesis: SynthesisConfig
    api: APIConfig
    database: DatabaseConfig
    
    def __init__(self):
        """Initialize all configuration from environment."""
        env_str = os.getenv("ENVIRONMENT", "development").lower()
        try:
            self.env = EnvironmentType(env_str)
        except ValueError:
            logger.warning(f"Invalid ENVIRONMENT: {env_str}, using development")
            self.env = EnvironmentType.DEVELOPMENT
        
        self.nlp = NLPConfig.from_env()
        self.synthesis = SynthesisConfig.from_env()
        self.api = APIConfig.from_env()
        self.database = DatabaseConfig.from_env()
        
        self._log_config()
    
    def _log_config(self):
        """Log configuration (without sensitive data)."""
        logger.info(f"Environment: {self.env.value}")
        logger.info(f"NLP Engine: {self.nlp.engine_type.value}")
        logger.info(f"Synthesis Model: {self.synthesis.model}")
        logger.info(f"API: {self.api.host}:{self.api.port}")
        logger.info(f"Database: {self.database.url.split('@')[0]}...@{self.database.url.split('@')[1] if '@' in self.database.url else 'unknown'}")
    
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.env == EnvironmentType.PRODUCTION
    
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.env == EnvironmentType.DEVELOPMENT

# Global configuration instance
_config: Optional[Config] = None

def get_config() -> Config:
    """Get global configuration instance."""
    global _config
    if _config is None:
        _config = Config()
    return _config

def reload_config():
    """Reload configuration (useful for testing)."""
    global _config
    _config = None
    return get_config()
