from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import logging

from core.database import SessionLocal
from core.security import get_current_user   # ✅ REQUIRED
from models.membership import RoomMember     # ✅ CORRECT MODEL
from models.room import Room
from models.user import User
from schemas.room import RoomCreate   
from fastapi import HTTPException       # ✅ REQUIRED

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/rooms",
    tags=["Rooms"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("")
def list_rooms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rooms = (
        db.query(Room)
        .join(RoomMember, Room.id == RoomMember.room_id)   # ✅ FIX
        .filter(RoomMember.user_id == current_user.id)     # ✅ FIX
        .all()
    )

    return [{"id": r.id, "name": r.name} for r in rooms]


@router.post("")
def create_room(
    data: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),        # optional but correct
):
    try:
        logger.info(f"📝 Creating room: {data.name} for user {current_user.id}")
        
        room = Room(name=data.name,
                    creator_id=current_user.id,)
        db.add(room)
        db.commit()
        db.refresh(room)
        logger.info(f"✅ Room created with ID: {room.id}")

        # (Optional but recommended) auto-join creator
        db.add(RoomMember(user_id=current_user.id, room_id=room.id))
        db.commit()
        logger.info(f"✅ Creator auto-joined room {room.id}")

        return {"id": room.id, "name": room.name}
    except Exception as e:
        logger.error(f"❌ Error creating room: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create room: {str(e)}")


@router.delete("/{room_id}")
def delete_room(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = db.query(Room).filter(Room.id == room_id).first()

    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # ✅ AUTHORIZATION CHECK
    if room.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to delete this room")

    # ✅ DELETE MEMBERSHIPS FIRST
    db.query(RoomMember).filter(RoomMember.room_id == room_id).delete()

    # ✅ DELETE ROOM
    db.delete(room)
    db.commit()

    return {"message": "Room deleted successfully"}