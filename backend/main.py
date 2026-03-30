from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging

from models.user import User
from models.message import Message
from core.database import SessionLocal, Base, engine
from core.websocket import manager
from core.security import decode_token
from services.language_service import detect_language
from services.translation_service import translate_if_needed

from api import auth, users, rooms, messages

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Multilingual Chat")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(rooms.router)
app.include_router(messages.router)


@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()

    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    payload = decode_token(token)
    if not payload or "sub" not in payload:
        await websocket.close(code=1008)
        return

    user_id = payload["sub"]
    client_lang = websocket.query_params.get("lang", "en")
    user_api_key = websocket.query_params.get("user_api_key", None) or None

    db = SessionLocal()

    try:
        user = db.query(User).filter(User.id == user_id).first()
        sender_name = user.email if user else user_id

        # ✅ store socket + language
        await manager.connect(room_id, websocket, client_lang)

        while True:
            text = await websocket.receive_text()
            logger.info(f"📨 Received message from {user_id}: {text}")

            source_lang = detect_language(text)
            logger.info(f"🌍 Detected language: {source_lang}")

            # ✅ persist message FIRST (critical)
            msg = Message(
                room_id=room_id,
                sender_id=user_id,
                original_text=text,
                original_language=source_lang,
            )
            db.add(msg)
            db.commit()
            db.refresh(msg)   # ✅ ensures msg.id exists
            logger.info(f"💾 Message saved to DB with ID: {msg.id}")

            # ✅ broadcast with message_id
            # Create async wrapper for translate_if_needed
            async def translate_wrapper(**kw):
                return await translate_if_needed(db=db, user_api_key=user_api_key, **kw)
            
            logger.info(f"🔊 Starting broadcast to room {room_id}")
            await manager.broadcast(
                room_id=room_id,
                sender_id=user_id,
                sender_name=sender_name,
                original_text=text,
                source_lang=source_lang,
                message_id=msg.id,
                translate_fn=translate_wrapper,
            )
            logger.info(f"✅ Broadcast complete for message {msg.id}")

    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)

    finally:
        db.close()
