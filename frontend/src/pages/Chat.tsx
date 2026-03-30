import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { state } from "../state";
import { connectWS } from "../ws";
import { languages } from "../utils/languages";

type Message = {
  senderId: string;
  senderName: string;
  content: string;
};

export default function Chat() {
  const { roomId } = useParams<{ roomId: string }>();
function getRandomColor(seed: string | undefined | null) {
  if (!seed || typeof seed !== "string" || seed.length === 0) {
    // fallback color if seed is invalid
    return "#e0e7ef";
  }
  // Simple hash from string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Generate pastel color
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 85%)`;
}

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("en");

  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  // Map senderId to color for consistent coloring
  const [userColors, setUserColors] = useState<{ [id: string]: string }>({});

  /* 1️⃣ Load message history */
  useEffect(() => {
    if (!roomId) return;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${state.token}`,
    };
    if (state.userApiKey) {
      headers["X-User-Api-Key"] = state.userApiKey;
    }

    fetch(`http://127.0.0.1:8000/messages/${roomId}?lang=${targetLanguage}`, {
      headers,
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        setMessages(
          data.map((m: any) => ({
            senderId: m.sender,
            senderName: m.sender_name ?? m.sender,
            content: m.content,
          }))
        );
      })
      .catch(console.error);
  }, [roomId, targetLanguage]);

  /* 2️⃣ WebSocket connection */
  useEffect(() => {
    if (!roomId || !state.userId) return;

    wsRef.current?.close();

    wsRef.current = connectWS(roomId, targetLanguage, (data: any) => {
      console.log("📩 Chat.tsx received message:", data);
      
      if (data.type !== "message") {
        console.warn("⚠️ Unexpected message type:", data.type);
        return;
      }

      setMessages((prev) => {
        const newMsg = {
          senderId: data.sender_id,
          senderName: data.sender_name ?? data.sender_id,
          content: data.text,
        };
        console.log("✅ Adding message to state:", newMsg);
        
        if (newMsg.senderId !== state.userId) {
          setUserColors((prevColors) => {
            if (!prevColors[newMsg.senderId]) {
              return {
                ...prevColors,
                [newMsg.senderId]: getRandomColor(newMsg.senderId),
              };
            }
            return prevColors;
          });
        }
        return [...prev, newMsg];
      });
    });

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [roomId, targetLanguage]);

  /* 3️⃣ Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* 4️⃣ Send message */
  function send() {
    if (!text.trim()) return;
    console.log("📤 Sending message:", text);
    wsRef.current?.send(text);
    setText("");
  }

  return (
    <div style={styles.page}>
      {/* ===== HEADER ===== */}
      <div style={styles.header}>
        <div>
          <div style={styles.roomLabel}>Room</div>
          <div style={styles.roomId}>{roomId}</div>
        </div>

        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          style={styles.languageSelect}
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* ===== MESSAGES ===== */}
      <div style={styles.messages}>
        {messages.map((m, i) => {
          const isMe = m.senderId === state.userId;
          const bgColor = isMe
            ? "#2563eb"
            : userColors[m.senderId] || getRandomColor(m.senderId);
          const color = isMe ? "#ffffff" : "#111827";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: isMe ? "flex-end" : "flex-start",
              }}
            >
              {!isMe && <div style={{ flex: 1 }} />}
              <div
                style={{
                  ...styles.message,
                  background: bgColor,
                  color,
                  borderTopRightRadius: isMe ? 4 : 14,
                  borderTopLeftRadius: isMe ? 14 : 4,
                  textAlign: isMe ? "right" : "left",
                }}
              >
                <div
                  style={{
                    ...styles.sender,
                    textAlign: isMe ? "right" : "left",
                  }}
                >
                  {m.senderName}
                </div>
                <div>{m.content}</div>
              </div>
              {isMe && <div style={{ flex: 1 }} />}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ===== INPUT ===== */}
      <div style={styles.inputBar}>
        <input
          style={styles.input}
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button style={styles.sendBtn} onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}

/* ===== Styles ===== */
const styles: Record<string, any> = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "#f4f6f8",
  },

  header: {
    padding: "14px 18px",
    background: "#111827",
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  roomLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },

  roomId: {
    fontSize: 14,
    fontWeight: 600,
  },

  languageSelect: {
    padding: "6px 8px",
    borderRadius: 6,
    border: "none",
    fontSize: 13,
  },

  messages: {
    flex: 1,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
  },

  message: {
    maxWidth: "72%",
    padding: "10px 14px",
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.4,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    wordBreak: "break-word",
  },

  sender: {
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 4,
    opacity: 0.8,
  },

  inputBar: {
    display: "flex",
    padding: 12,
    background: "#ffffff",
    borderTop: "1px solid #e5e7eb",
  },

  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 20,
    border: "1px solid #d1d5db",
    fontSize: 14,
  },

  sendBtn: {
    marginLeft: 10,
    padding: "10px 18px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: 20,
    fontSize: 14,
    cursor: "pointer",
  },
};
