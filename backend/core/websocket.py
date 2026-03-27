from fastapi import WebSocket
from typing import Dict, List


class ConnectionManager:
    def __init__(self):
        self.rooms: Dict[str, List[dict]] = {}

    async def connect(self, room_id: str, websocket: WebSocket, lang: str):
        self.rooms.setdefault(room_id, []).append({
            "ws": websocket,
            "lang": lang
        })

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.rooms:
            self.rooms[room_id] = [
                c for c in self.rooms[room_id]
                if c["ws"] != websocket
            ]

    async def broadcast(
        self,
        room_id: str,
        sender_id: str,
        sender_name: str,
        original_text: str,
        source_lang: str,
        message_id: str,
        translate_fn,  # async translate_if_needed
    ):
        connections = self.rooms.get(room_id, [])
        if not connections:
            return

        async def process_translation_and_send(conn):
            target_lang = conn["lang"]
            
            # If languages match, no translation needed
            if target_lang == source_lang:
                text = original_text
            else:
                # Call async translation function
                text = await translate_fn(
                    message_id=message_id,
                    original_text=original_text,
                    source_lang=source_lang,
                    target_lang=target_lang,
                )

            await conn["ws"].send_json({
                "type": "message",
                "sender_id": sender_id,
                "sender_name": sender_name,
                "text": text,
                "room_id": room_id,
                "language": target_lang,
            })

        # Run all translations and sends in parallel
        import asyncio
        await asyncio.gather(*(process_translation_and_send(c) for c in connections))


manager = ConnectionManager()
