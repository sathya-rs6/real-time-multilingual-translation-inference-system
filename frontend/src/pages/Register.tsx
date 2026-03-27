import { useState } from "react";
import { useNavigate } from "react-router-dom";
import registerGif from "../assets/Register.gif";

const API = "http://localhost:8000";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function register() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(API + "/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      setLoading(false);

      if (!res.ok) {
        setError(
          res.status === 409
            ? "User already exists. Please login."
            : data.detail || "Registration failed"
        );
        return;
      }

      navigate("/login");
    } catch (err) {
      setLoading(false);
      setError("Network or server error. Please try again.");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* LEFT: GIF */}
        <div style={styles.media}>
          <img src={registerGif} alt="Register" style={styles.gif} />
          <div style={styles.mediaOverlay} />
          <div style={styles.mediaText}>
            <h2 style={styles.mediaTitle}>Join the Conversation</h2>
            <p style={styles.mediaSubtitle}>
              Create an account and start chatting instantly
            </p>
          </div>
        </div>

        {/* RIGHT: Form */}
        <div style={styles.form}>
          <h2 style={styles.title}>Create account</h2>
          <p style={styles.subtitle}>Join and start chatting</p>

          <input
            style={styles.input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onClick={register}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          {error && <p style={styles.error}>{error}</p>}

          <p style={styles.footer}>
            Already have an account?{" "}
            <span style={styles.link} onClick={() => navigate("/login")}>
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===== Styles ===== */
const styles: Record<string, any> = {
  page: {
    height: "100vh",
    background: "#7fbfff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: 760,
    display: "flex",
    borderRadius: 16,
    overflow: "hidden",
    background: "rgba(255,255,255,0.5)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
  },

  /* ===== LEFT MEDIA ===== */
  media: {
    position: "relative",
    width: "45%",
    background: "#000",
  },

  gif: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  mediaOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
  },

  mediaText: {
    position: "absolute",
    top: 24,
    left: 24,
    right: 24,
    color: "#ffffff",
  },

  mediaTitle: {
    fontSize: 26,
    fontWeight: 600,
    marginBottom: 6,
  },

  mediaSubtitle: {
    fontSize: 14,
    opacity: 0.85,
    maxWidth: 260,
    lineHeight: 1.4,
  },

  /* ===== RIGHT FORM ===== */
  form: {
    width: "55%",
    padding: 36,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  title: {
    marginBottom: 6,
    fontSize: 22,
  },

  subtitle: {
    marginBottom: 24,
    color: "#6b7280",
  },

  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
  },

  button: {
    width: "100%",
    padding: 12,
    background: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    marginTop: 4,
  },

  error: {
    marginTop: 12,
    color: "#dc2626",
    textAlign: "center",
  },

  footer: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 14,
  },

  link: {
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: 500,
  },
};
