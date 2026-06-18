
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/AuthPages.css";

const DEMO_EMAIL    = "demo@growthwithin.app";
const DEMO_PASSWORD = "demo123456";

export default function Login() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const doLogin = async (email, password, setLoad) => {
    setError("");
    setLoad(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      navigate("/planner");
    } catch {
      setError("Network error — is the server running?");
    } finally {
      setLoad(false);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    doLogin(form.email, form.password, setLoading);
  };

  const handleDemo = () => {
    doLogin(DEMO_EMAIL, DEMO_PASSWORD, setDemoLoading);
  };

  return (
    <div className="auth-root">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />
      <div className="auth-grid-texture" />

      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        <div className="auth-brand-row">
          <span className="auth-brand-icon">✦</span>
          <span className="auth-brand-name">Growth <em>with-in</em></span>
        </div>

        <h1 className="auth-left-title">
          Your journey<br />starts <em>within</em>
        </h1>

        <p className="auth-left-sub">
          Every great life is built on small, consistent actions.
          Log in and keep your streak alive today.
        </p>

        <div className="auth-features">
          {[
            { emoji: "📅", text: "Plan your month visually" },
            { emoji: "📖", text: "Journal every day" },
            { emoji: "🔥", text: "Track habit streaks" },
            { emoji: "🎯", text: "Set & hit your goals" },
            { emoji: "✨", text: "Build your vision board" },
          ].map(f => (
            <div key={f.text} className="auth-feature-item">
              <span className="auth-feature-dot">{f.emoji}</span>
              <span className="auth-feature-text">{f.text}</span>
            </div>
          ))}
        </div>

        <div className="auth-dots">
          {["#ffbe0b","#fb5607","#ff006e","#8338ec","#3a86ff"].map(c => (
            <span key={c} style={{ background: c }} />
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-card-title">Welcome back 👋</h2>
          <p className="auth-card-sub">Sign in to continue your growth journey</p>

          {error && <div className="auth-error">{error}</div>}

          {/* ── DEMO BUTTON ── */}
          <button
            className="demo-btn"
            onClick={handleDemo}
            disabled={demoLoading || loading}
            type="button"
          >
            {demoLoading
              ? <span className="auth-spinner" />
              : <><span className="demo-icon">⚡</span> Try Demo — no sign up needed</>
            }
          </button>

          <div className="auth-divider">
            <span>or sign in with your account</span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                required autoFocus
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password" name="password"
                value={form.password} onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="auth-forgot">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button className="auth-submit" type="submit" disabled={loading || demoLoading}>
              {loading ? <span className="auth-spinner" /> : "Sign In →"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}