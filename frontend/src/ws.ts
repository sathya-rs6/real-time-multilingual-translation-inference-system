import { state } from "./state";

export function connectWS(
  roomId: string,
  language: string,
  onMessage: (msg: any) => void
) {
  // Pass user API key as query param so the backend can use it for translation
  const userApiKey = state.userApiKey;
  const keyParam = userApiKey ? `&user_api_key=${encodeURIComponent(userApiKey)}` : "";

  const ws = new WebSocket(
    `ws://127.0.0.1:8000/ws/${roomId}?token=${state.token}&lang=${language}${keyParam}`
  );

  ws.onopen = () => {
    console.log("✅ WS connected");
  };

  ws.onclose = () => {
    console.log("❌ WS closed");
  };

  ws.onerror = () => {
    console.log("⚠️ WS error");
  };

  ws.onmessage = (e) => {
    console.log("📨 Received from WebSocket:", e.data);
    try {
      const data = JSON.parse(e.data);
      console.log("✅ Parsed message:", data);
      onMessage(data);
    } catch (err) {
      console.error("❌ Failed to parse message:", err);
    }
  };

  return ws;
}
