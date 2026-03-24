import redis
from .config import settings
import logging

logger = logging.getLogger(__name__)

class CacheService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CacheService, cls).__new__(cls)
            try:
                cls._instance.client = redis.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=2
                )
                logger.info("Redis cache initialized")
            except Exception as e:
                logger.error(f"Redis connection failed: {e}. Falling back to No-Op Cache.")
                cls._instance.client = None
        return cls._instance

    def set(self, key: str, value: str, expire: int = 3600):
        if self.client:
            try:
                self.client.set(key, value, ex=expire)
            except Exception:
                pass

    def get(self, key: str):
        if self.client:
            try:
                return self.client.get(key)
            except Exception:
                return None
        return None

cache = CacheService()
