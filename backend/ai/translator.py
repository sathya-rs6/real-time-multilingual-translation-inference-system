import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv
from google import genai

# Load environment variables from .env
load_dotenv()

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Default system API key from .env
DEFAULT_API_KEY = os.getenv("GEMINI_API_KEY")
_default_client = genai.Client(api_key=DEFAULT_API_KEY) if DEFAULT_API_KEY else None

# Thread pool for blocking API calls (prevents blocking event loop)
executor = ThreadPoolExecutor(max_workers=5)


def _get_client(user_api_key: str | None = None):
    """Return a Gemini client. Prefers the user key; falls back to the default system key."""
    key = (user_api_key or "").strip()
    if key:
        return genai.Client(api_key=key), "user"
    if _default_client:
        return _default_client, "default"
    return None, None


def _translate_sync(
    text: str,
    source_lang: str,
    target_lang: str,
    user_api_key: str | None = None,
) -> str:
    """Synchronous translation call to Gemini API (runs in thread pool).

    Strategy:
        1. Try user-provided key (if any).
        2. On any error (quota, invalid key, etc.), fall back to the default system key.
        3. If the default key also fails, return the original text.
    """
    if not text or source_lang == target_lang:
        return text

    prompt = (
        f"You are a professional translation engine.\n"
        f"Translate the following text from {source_lang} to {target_lang}.\n"
        f"Output ONLY the translated text. No explanations, no extra words.\n\n"
        f"Text to translate:\n{text}"
    )

    # Build list of (client, label) to try in order
    clients_to_try: list[tuple] = []

    user_key = (user_api_key or "").strip()
    if user_key:
        clients_to_try.append((genai.Client(api_key=user_key), "user"))

    if _default_client:
        clients_to_try.append((_default_client, "default"))

    if not clients_to_try:
        logger.warning("No Gemini API key available. Returning original text.")
        return text

    for client, label in clients_to_try:
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            if not response or not response.text:
                logger.warning(f"Empty response from Gemini API ({label} key).")
                continue

            logger.info(f"Translation successful via {label} key: {source_lang} → {target_lang}")
            return response.text.strip()

        except Exception as e:
            err_str = str(e)
            # Detect quota / rate-limit errors to log helpfully
            if "429" in err_str or "quota" in err_str.lower() or "rate" in err_str.lower():
                logger.warning(f"Quota/rate-limit hit on {label} key. Trying next key…")
            else:
                logger.error(f"Translation error ({label} key): {e}")

    # All keys exhausted
    logger.error("All Gemini API keys failed. Returning original text.")
    return text


async def translate(
    text: str,
    source_lang: str,
    target_lang: str,
    user_api_key: str | None = None,
) -> str:
    """
    Asynchronous translation wrapper.
    Runs the blocking Gemini API call in a thread pool to avoid blocking the event loop.
    Accepts an optional user_api_key; falls back to the default system key on failure.
    """
    if not text or source_lang == target_lang:
        return text

    loop = asyncio.get_event_loop()
    try:
        return await loop.run_in_executor(
            executor,
            lambda: _translate_sync(text, source_lang, target_lang, user_api_key),
        )
    except Exception as e:
        logger.error(f"Async translation error: {e}")
        return text  # Fallback to original text