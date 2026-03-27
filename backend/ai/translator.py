import os
from dotenv import load_dotenv
from google import genai

# Load environment variables from .env
load_dotenv()

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the Gemini API client using GEMINI_API_KEY from .env
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

async def translate(text: str, source_lang: str, target_lang: str) -> str:
    """Translates text using Gemini API asynchronously."""
    if not text or source_lang == target_lang:
        return text

    if not api_key:
        logger.warning("GEMINI_API_KEY not found. Skipping translation.")
        return text

    prompt = (
        f"You are a professional translation engine.\n"
        f"Translate the following text from {source_lang} to {target_lang}.\n"
        f"Output ONLY the translated text. No explanations, no extra words.\n\n"
        f"Text to translate:\n{text}"
    )

    try:
        # Note: google-genai client's generate_content is synchronous in some versions, 
        # but we should ideally use async if supported or run in thread.
        # Assuming we want to keep it simple and use the synchronous call for now 
        # but wrapped in an async def for the pipeline.
        
        response = client.models.generate_content(
            model='gemma-3-4b-it',
            contents=prompt,
        )
        
        if not response or not response.text:
            logger.warning("Empty response from Gemini API.")
            return text
            
        return response.text.strip()
    except Exception as e:
        logger.error(f"Translation error: {e}")
        return text  # Fallback to original text