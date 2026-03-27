import asyncio
from services.translation_service import translate_if_needed

async def main():
    print("Testing Translation with Gemini...")
    result = await translate_if_needed(
        db=None, 
        message_id=None, 
        original_text="Hallo wereld, hoe gaat het?", 
        source_lang="Dutch", 
        target_lang="English"
    )
    print(f"Result: {result}")

if __name__ == "__main__":
    asyncio.run(main())
