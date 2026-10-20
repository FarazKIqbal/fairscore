"""Shared AI client supporting Google Gemini and OpenAI-compatible endpoints."""

from __future__ import annotations

import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)


def _get_env_var(name: str, fallback: Optional[str] = None) -> Optional[str]:
    """Read environment variable, falling back to another env var name."""
    value = os.environ.get(name) or os.environ.get(fallback or name)
    return value.strip() if value else None


def _extract_json_object(text: str) -> dict:
    """Extract first JSON object from text (works for Gemini and OpenAI)."""
    import json
    cleaned = text.strip()
    if not cleaned:
        return {}
    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json", "").replace("```", "").strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return {}
    try:
        parsed = json.loads(cleaned[start:end + 1])
        return parsed if isinstance(parsed, dict) else {}
    except Exception:
        return {}


def _extract_json_array(text: str) -> list:
    """Extract first JSON array from text (works for Gemini and OpenAI)."""
    import json
    cleaned = text.strip()
    if not cleaned:
        return []
    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json", "").replace("```", "").strip()
    start = cleaned.find("[")
    end = cleaned.rfind("]")
    if start == -1 or end == -1 or end <= start:
        return []
    try:
        parsed = json.loads(cleaned[start:end + 1])
        return parsed if isinstance(parsed, list) else []
    except Exception:
        return []


class AIRequestError(Exception):
    """Raised when the AI API returns an error."""
    def __init__(self, status_code: Optional[int], message: str):
        self.status_code = status_code
        super().__init__(message)


class AIClient:
    """
    Unified AI client supporting:
    - Google Gemini (GEMINI_API_KEY)
    - OpenAI-compatible endpoints (OPENAI_API_KEY + OPENAI_BASE_URL)

    Provider selection:
    - Set AI_PROVIDER=gemini or AI_PROVIDER=openai to force a specific provider
    - If not set, auto-detects based on available API keys (Gemini > OpenAI)
    """

    @staticmethod
    def get_active_provider():
        """Return active provider and config based on env config."""
        # Explicit provider selection via env var
        forced_provider = _get_env_var("AI_PROVIDER")
        if forced_provider:
            forced_provider = forced_provider.lower()
            if forced_provider == "gemini":
                gemini_key = _get_env_var("GEMINI_API_KEY")
                if gemini_key:
                    return "gemini", {"api_key": gemini_key}
                else:
                    logger.warning("AI_PROVIDER=gemini set but GEMINI_API_KEY not found")
            elif forced_provider == "openai":
                openai_key = _get_env_var("OPENAI_API_KEY")
                if openai_key:
                    base_url = _get_env_var("OPENAI_BASE_URL", "https://api.openai.com/v1")
                    return "openai", {
                        "api_key": openai_key,
                        "base_url": base_url.rstrip("/")
                    }
                else:
                    logger.warning("AI_PROVIDER=openai set but OPENAI_API_KEY not found")
            else:
                logger.warning(f"Unknown AI_PROVIDER={forced_provider}, falling back to auto-detect")

        # Auto-detect: Gemini > OpenAI
        gemini_key = _get_env_var("GEMINI_API_KEY")
        if gemini_key:
            return "gemini", {"api_key": gemini_key}

        openai_key = _get_env_var("OPENAI_API_KEY")
        if openai_key:
            base_url = _get_env_var("OPENAI_BASE_URL", "https://api.openai.com/v1")
            return "openai", {
                "api_key": openai_key,
                "base_url": base_url.rstrip("/")
            }

        return None, None


def _call_gemini(prompt: str, model: str = "gemini-1.5-flash") -> tuple[str, bool]:
    """Call Google Gemini API. Returns (text, success)."""
    try:
        import google.generativeai as genai
        gemini_key = _get_env_var("GEMINI_API_KEY")
        if not gemini_key:
            raise AIRequestError(401, "No GEMINI_API_KEY found in environment")

        genai.configure(api_key=gemini_key)
        model_obj = genai.GenerativeModel(model)
        response = model_obj.generate_content(prompt)
        return response.text if hasattr(response, "text") else str(response), True
    except AIRequestError:
        raise
    except Exception as exc:
        raise AIRequestError(None, str(exc))


def _call_openai(prompt: str, model: str = "gpt-3.5-turbo") -> tuple[str, bool]:
    """Call OpenAI-compatible API. Returns (text, success)."""
    try:
        from openai import OpenAI
        openai_key = _get_env_var("OPENAI_API_KEY")
        if not openai_key:
            raise AIRequestError(401, "No OPENAI_API_KEY found in environment")

        base_url = _get_env_var("OPENAI_BASE_URL", "https://api.openai.com/v1")
        client = OpenAI(
            api_key=openai_key,
            base_url=base_url.rstrip("/")
        )
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        return response.choices[0].message.content, True
    except AIRequestError:
        raise
    except Exception as exc:
        raise AIRequestError(None, str(exc))


def call_ai(prompt: str, model: Optional[str] = None, provider: Optional[str] = None) -> tuple[str, bool]:
    """
    Call AI with configurable provider selection.

    Args:
        prompt: The prompt to send
        model: Optional model name (auto-selected if not provided)
        provider: Optional 'gemini' or 'openai' to force provider (overrides AI_PROVIDER env)

    Returns:
        (response_text, success)
    """
    # Provider priority: explicit param > AI_PROVIDER env > auto-detect
    if provider:
        active_provider = provider.lower()
    else:
        active_provider, _ = AIClient.get_active_provider()
        if not active_provider:
            logger.warning("No AI provider configured (set GEMINI_API_KEY or OPENAI_API_KEY)")
            raise AIRequestError(401, "No AI provider configured")

    # Select default model based on provider
    if model is None:
        if active_provider == "gemini":
            # Allow override via env
            model = _get_env_var("GEMINI_MODEL", "gemini-1.5-flash")
        else:
            model = _get_env_var("OPENAI_MODEL", "gpt-3.5-turbo")

    try:
        if active_provider == "gemini":
            return _call_gemini(prompt, model)
        elif active_provider == "openai":
            return _call_openai(prompt, model)
        else:
            raise AIRequestError(401, f"Unknown provider: {active_provider}")
    except AIRequestError:
        raise
    except Exception as exc:
        logger.warning("AI call failed: %s", exc)
        raise AIRequestError(None, str(exc))