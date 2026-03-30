import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { state } from "../state";
import bg from "../assets/df.png";
import video from "../assets/test.mp4";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userApiKey, setUserApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function login() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      setLoading(false);

      if (!res.ok) {
        setError("Invalid email or password");
        return;
      }

      const data = await res.json();
      state.token = data.access_token;
      state.userId = email;
      // Save optional user API key (empty string clears it)
      state.userApiKey = userApiKey.trim();

      navigate("/home");
    } catch (err) {
      setLoading(false);
      setError("Network or server error. Please try again.");
    }
  }

  /* ===== Floating background animation ===== */
  const bgAnimation = `
    @keyframes floatingBg {
      0%   { background-position: 50% 50%; }
      50%  { background-position: 53% 47%; }
      100% { background-position: 50% 50%; }
    }
  `;

  return (
    <>
      <style>{bgAnimation}</style>

      <div style={styles.page}>
        <div style={styles.card}>
          {/* LEFT: Video with overlay text */}
          <div style={styles.videoWrapper}>
            <video
              style={styles.video}
              src={video}
              autoPlay
              muted
              loop
              playsInline
            />

            {/* Dark overlay */}
            <div style={styles.videoOverlay} />

            {/* Text overlay */}
            <div style={styles.videoText}>
              <h2 style={styles.videoTitle}>Welcome To Chatzy</h2>
              <p style={styles.videoSubtitle}>
                Chat as you like, Chat at your comfort.
              </p>
            </div>
          </div>

          {/* RIGHT: Login form */}
          <div style={styles.form}>
            <h2 style={styles.title}>Sign in</h2>
            <p style={styles.subtitle}>Enter your credentials</p>

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

            {/* Optional API Key Section */}
            <div style={styles.apiKeySection}>
              <button
                type="button"
                style={styles.apiKeyToggle}
                onClick={() => setShowApiKey((v) => !v)}
              >
                <span style={styles.apiKeyToggleIcon}>{showApiKey ? "▾" : "▸"}</span>
                <span>Use my own Gemini API key</span>
                <span style={styles.optionalBadge}>Optional</span>
              </button>

              {showApiKey && (
                <div style={styles.apiKeyBox}>
                  <p style={styles.apiKeyHint}>
                    🔑 Paste your Gemini API key below. If omitted or if your quota is exceeded,
                    the system will automatically fall back to the default key.
                  </p>
                  <input
                    id="user-api-key"
                    style={{ ...styles.input, marginBottom: 0, fontFamily: "monospace", fontSize: 12 }}
                    type="password"
                    placeholder="AIza…"
                    value={userApiKey}
                    onChange={(e) => setUserApiKey(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
              )}
            </div>

            <button
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onClick={login}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            {error && <p style={styles.error}>{error}</p>}

            <p style={styles.footer}>
              New user?{" "}
              <span style={styles.link} onClick={() => navigate("/register")}>
                Create an account
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ===== Styles ===== */
const styles: Record<string, any> = {
  page: {
    minHeight: "100vh",
    backgroundImage: `url(${bg})`,
    backgroundSize: "110%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    animation: "floatingBg 25s ease-in-out infinite",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: 720,
    display: "flex",
    borderRadius: 14,
    overflow: "hidden",
    background: "rgba(255,255,255,0.45)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
  },

  /* ===== VIDEO SIDE ===== */
  videoWrapper: {
    position: "relative",
    width: "45%",
    background: "#000",
  },

  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  videoOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
  },

  videoText: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    color: "#ffffff",
  },

  videoTitle: {
    fontSize: 35,
    fontWeight: 600,
    marginBottom: 2,
    lineHeight: 1.1,
    textShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },

  videoSubtitle: {
    fontSize: 24,
    opacity: 1,
    lineHeight: 1.2,
    textShadow: "0 2px 6px rgba(0,0,0,0.85)",
  },

  /* ===== FORM SIDE ===== */
  form: {
    width: "55%",
    padding: 32,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  title: {
    marginBottom: 4,
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
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: 12,
    background: "#2563eb",
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

  /* ===== API KEY SECTION ===== */
  apiKeySection: {
    marginBottom: 12,
  },

  apiKeyToggle: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "none",
    border: "1px dashed #d1d5db",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: 13,
    color: "#374151",
    width: "100%",
    textAlign: "left",
    transition: "border-color 0.2s, background 0.2s",
  },

  apiKeyToggleIcon: {
    fontSize: 10,
    color: "#6b7280",
  },

  optionalBadge: {
    marginLeft: "auto",
    fontSize: 10,
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    borderRadius: 20,
    padding: "2px 8px",
    fontWeight: 600,
    letterSpacing: "0.03em",
  },

  apiKeyBox: {
    marginTop: 8,
    padding: "12px 14px",
    background: "rgba(239,246,255,0.7)",
    borderRadius: 8,
    border: "1px solid #bfdbfe",
  },

  apiKeyHint: {
    fontSize: 12,
    color: "#4b5563",
    marginBottom: 10,
    lineHeight: 1.5,
    margin: "0 0 10px 0",
  },
};
