from sqlalchemy.orm import Session
from models.message_translation import MessageTranslation
from ai.translator import translate

def translate_if_needed(
    db: Session,
    message_id: str | None,   # ✅ allow None
    original_text: str,
    source_lang: str,
    target_lang: str,
):
    # 1️⃣ No translation needed
    if source_lang == target_lang:
        return original_text

    # 2️⃣ LIVE WEBSOCKET CASE (no message_id yet) → DO NOT CACHE
    if message_id is None:
        return translate(
            text=original_text,
            source_lang=source_lang,
            target_lang=target_lang,
        )

    # 3️⃣ HISTORY / REST CASE → check cache
    cached = (
        db.query(MessageTranslation)
        .filter(
            MessageTranslation.message_id == message_id,
            MessageTranslation.target_language == target_lang,
        )
        .first()
    )

    if cached:
        return cached.translated_text

    # 4️⃣ Translate + persist
    translated = translate(
        text=original_text,
        source_lang=source_lang,
        target_lang=target_lang,
    )

    db.add(
        MessageTranslation(
            message_id=message_id,
            target_language=target_lang,
            translated_text=translated,
        )
    )
    db.commit()

    return translated
