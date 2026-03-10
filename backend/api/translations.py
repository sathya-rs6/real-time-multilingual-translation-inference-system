from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import SessionLocal
from models.message import Message
from models.message_translation import MessageTranslation
from schemas.translation import TranslateRequest, TranslateResponse
from services.translation_service import translate_if_needed

router = APIRouter(prefix="/translations", tags=["Translations"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=TranslateResponse)
def translate_message(
    payload: TranslateRequest,
    db: Session = Depends(get_db),
):
    # 1️⃣ Fetch original message
    message = db.query(Message).filter(Message.id == payload.message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    # 2️⃣ Check cache
    existing = (
        db.query(MessageTranslation)
        .filter(
            MessageTranslation.message_id == payload.message_id,
            MessageTranslation.target_language == payload.target_language,
        )
        .first()
    )

    if existing:
        return TranslateResponse(
            message_id=payload.message_id,
            target_language=payload.target_language,
            translated_text=existing.translated_text,
        )

    # 3️⃣ Translate (stub for now)
    translated_text = translate_if_needed(
        message.original_text,
        payload.target_language,
    )

    # 4️⃣ Save translation
    translation = MessageTranslation(
        message_id=payload.message_id,
        target_language=payload.target_language,
        translated_text=translated_text,
    )
    db.add(translation)
    db.commit()

    return TranslateResponse(
        message_id=payload.message_id,
        target_language=payload.target_language,
        translated_text=translated_text,
    )
