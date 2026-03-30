from fastapi import APIRouter, Depends, Query, Header
from sqlalchemy.orm import Session
from core.database import SessionLocal
from models.message import Message
from models.user import User
from schemas.message import MessageOut
from services.translation_service import translate_if_needed

router = APIRouter(prefix="/messages", tags=["Messages"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{room_id}", response_model=list[MessageOut])
async def get_room_messages(
    room_id: str,
    lang: str = Query("en"),
    x_user_api_key: str | None = Header(default=None, alias="X-User-Api-Key"),
    db: Session = Depends(get_db),
):
    messages = (
        db.query(Message)
        .filter(Message.room_id == room_id)
        .order_by(Message.created_at)
        .all()
    )

    response = []

    for m in messages:
        translated_text = await translate_if_needed(
            db=db,
            message_id=m.id,
            original_text=m.original_text,
            source_lang=m.original_language or "en",
            target_lang=lang,
            user_api_key=x_user_api_key,
        )

        user = db.query(User).filter(User.id == m.sender_id).first()

        response.append(
            MessageOut(
                id=m.id,
                sender_id=m.sender_id,
                sender_name=user.email if user else m.sender_id,
                content=translated_text,
                language=lang,
                created_at=m.created_at,
            )
        )

    return response
