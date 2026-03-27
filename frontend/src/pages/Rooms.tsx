import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { state } from "../state";
import roomGif from "../assets/room.gif";

type Room = {
  id: string;
  name: string;
};

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("");
  const [manualRoomId, setManualRoomId] = useState("");
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const isCreate = params.get("create") === "true";

  /* ⌨️ Typing animations */
  const leftText = "Text at your comfort and make others happy...";
  const rightText = "Create the room and share the happiness...";

  const [typedLeft, setTypedLeft] = useState("");
  const [typedRight, setTypedRight] = useState("");

  useEffect(() => {
    let i = 0;
    let j = 0;

    const interval = setInterval(() => {
      setTypedLeft(leftText.slice(0, i + 1));
      setTypedRight(rightText.slice(0, j + 1));

      i++;
      j++;

      if (i > leftText.length) i = 0;
      if (j > rightText.length) j = 0;
    }, 120);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!state.isAuthenticated()) {
      navigate("/login");
      return;
    }
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      const res = await fetch("http://127.0.0.1:8000/rooms", {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });

      if (res.status === 401) {
        state.token = null;
        navigate("/login");
        return;
      }

      if (!res.ok) {
        console.error("Failed to fetch rooms:", res.status);
        setRooms([]);
        return;
      }

      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setRooms([]);
    }
  }

  async function createRoom() {
    if (!roomName.trim()) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify({ name: roomName }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          state.token = null;
          navigate("/login");
          return;
        }
        const err = await res.json();
        alert(err.detail || "Failed to create room");
        return;
      }

      const room = await res.json();
      if (room && room.id) {
        navigate(`/chat/${room.id}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error while creating room");
    }
  }

  function joinByRoomId() {
    if (!manualRoomId.trim()) return;
    navigate(`/chat/${manualRoomId.trim()}`);
  }

  return (
    <div style={styles.page}>
      {/* 🎞️ Background */}
      <div style={styles.bgGif} />
      <div style={styles.bgOverlay} />

      {/* ⌨️ Typing text */}
      <div style={styles.topLeftText}>{typedLeft}</div>
      <div style={styles.bottomRightText}>{typedRight}</div>

      {/* Card */}
      <div style={styles.card}>
        <h2>Rooms</h2>

        {isCreate ? (
          <>
            <h3>Create Room</h3>

            <input
              style={styles.input}
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />

            <button style={styles.primaryBtn} onClick={createRoom}>
              Create Room
            </button>

            <hr style={styles.divider} />

            <h3>Available Rooms</h3>

            {rooms.length === 0 && <p>No rooms available</p>}

            <div style={styles.roomList}>
              {rooms.map((room) => (
                <div key={room.id} style={styles.roomRow}>
                  <span>{room.name}</span>
                  <button
                    style={styles.joinBtn}
                    onClick={() => navigate(`/chat/${room.id}`)}
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3>Join by Room ID</h3>

            <input
              style={styles.input}
              placeholder="Paste Room ID"
              value={manualRoomId}
              onChange={(e) => setManualRoomId(e.target.value)}
            />

            <button style={styles.secondaryBtn} onClick={joinByRoomId}>
              Join Room
            </button>

            {rooms.length > 0 && (
              <>
                <hr style={styles.divider} />
                <h3>Your Joined Rooms</h3>

                <div style={styles.roomList}>
                  {rooms.map((room) => (
                    <div key={room.id} style={styles.roomRow}>
                      <span>{room.name}</span>
                      <button
                        style={styles.joinBtn}
                        onClick={() => navigate(`/chat/${room.id}`)}
                      >
                        Open
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ===== Styles ===== */
const styles: Record<string, any> = {
  page: {
    height: "100vh",
    overflow: "hidden",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: 60,
  },

  bgGif: {
    position: "fixed",
    inset: 0,
    backgroundImage: `url(${roomGif})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: -2,
  },

  bgOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(255,255,255,0.15)",
    zIndex: -1,
  },

  /* ⌨️ Typing text */
  topLeftText: {
    position: "fixed",
    top: 100,
    left: 28,
    fontSize: 28,
    color: "#ffffff",
    fontFamily: "monospace",
    letterSpacing: 1.2,
    zIndex: 1,

    maxWidth: 450,            // ✅ controls line length
    whiteSpace: "normal",     // ✅ allow wrapping
    wordBreak: "break-word",  // ✅ safe word breaking
  },

  bottomRightText: {
    position: "fixed",
    bottom: 290,
    right: 28,
    fontSize: 28,
    color: "#ffffff",
    fontFamily: "monospace",
    letterSpacing: 1.2,
    zIndex: 1,
    textAlign: "right",

    maxWidth: 450,            // ✅ smaller width on right
    whiteSpace: "normal",
    wordBreak: "break-word",
  },


  card: {
    width: 420,
    height: 560,
    background: "#ffffff",
    padding: 32,
    borderRadius: 16,
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  roomList: {
    overflowY: "auto",
    marginTop: 8,
  },

  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    border: "1px solid #d1d5db",
  },

  primaryBtn: {
    width: "100%",
    padding: 14,
    background: "linear-gradient(135deg, #6366f1, #3b82f6)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    marginBottom: 8,
  },

  secondaryBtn: {
    width: "100%",
    padding: 14,
    background: "linear-gradient(135deg, #34d399, #10b981)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    marginBottom: 8,
  },

  divider: {
    margin: "16px 0",
  },

  roomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  joinBtn: {
    padding: "6px 14px",
    borderRadius: 8,
    border: "none",
    background: "#e5e7eb",
    cursor: "pointer",
  },
};
