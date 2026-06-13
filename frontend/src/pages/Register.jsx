import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/AuthPages.css";

export default function Register() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name: "", email: "", password: "", confirm: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6)       { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      navigate("/planner");
    } catch {
      setError("Network error — is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Orbs + texture */}
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
          The best time<br />to start is <em>now</em>
        </h1>

        <p className="auth-left-sub">
          Build habits that stick, set goals that matter, and reflect
          on your journey — all in one personal space.
        </p>

        <div className="auth-features">
          {[
            { emoji: "🔒", text: "Your data is private & secure" },
            { emoji: "📱", text: "Works on any device" },
            { emoji: "⚡", text: "Set up in under 2 minutes" },
            { emoji: "🆓", text: "Completely free to use" },
            { emoji: "🌱", text: "Grow a little every day" },
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
          <h2 className="auth-card-title">Create your account ✦</h2>
          <p className="auth-card-sub">Start your personal growth journey today</p>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Full Name</label>
              <input
                type="text" name="name"
                value={form.name} onChange={handleChange}
                placeholder="Your name"
                required autoFocus
              />
            </div>

            <div className="auth-field">
              <label>Email</label>
              <input
                type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password" name="password"
                value={form.password} onChange={handleChange}
                placeholder="Min 6 characters"
                required
              />
            </div>

            <div className="auth-field">
              <label>Confirm Password</label>
              <input
                type="password" name="confirm"
                value={form.confirm} onChange={handleChange}
                placeholder="Repeat password"
                required
              />
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : "Create Account →"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}