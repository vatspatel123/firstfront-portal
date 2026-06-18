"""Pluggable AI service layer — currently supports OpenRouter (any model)."""

import httpx
from abc import ABC, abstractmethod
from typing import Optional
from app.config import get_settings


class AIProvider(ABC):
    """Base class for AI providers."""

    @abstractmethod
    async def generate(self, prompt: str, system: str = "", max_tokens: int = 1024) -> str:
        ...


class OpenRouterProvider(AIProvider):
    """OpenRouter API — supports hundreds of models including free ones."""

    def __init__(self, api_key: str, model: str, base_url: str = "https://openrouter.ai/api/v1"):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url

    async def generate(self, prompt: str, system: str = "", max_tokens: int = 1024) -> str:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://firstfront.in",
                    "X-Title": "First Front Portal",
                },
                json={
                    "model": self.model,
                    "messages": messages,
                    "max_tokens": max_tokens,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]


class StubProvider(AIProvider):
    """Fallback when no API key is configured."""

    async def generate(self, prompt: str, system: str = "", max_tokens: int = 1024) -> str:
        return (
            "AI features are not configured. "
            "Set OPENROUTER_API_KEY in your .env to enable AI-powered summaries and analysis."
        )


def get_ai_provider() -> AIProvider:
    """Factory — returns the configured AI provider or a stub."""
    settings = get_settings()
    if settings.openrouter_api_key:
        return OpenRouterProvider(
            api_key=settings.openrouter_api_key,
            model=settings.ai_model,
            base_url=settings.openrouter_base_url,
        )
    return StubProvider()
