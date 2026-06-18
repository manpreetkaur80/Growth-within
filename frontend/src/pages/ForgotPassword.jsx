import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/AuthPages.css";

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      setSent(true);
    } catch {
      setError("Network error — is the server running?");
    } finally {
      setLoading(false);
    }
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
          Happens to<br />the <em>best of us</em>
        </h1>

        <p className="auth-left-sub">
          Don't worry — resetting your password takes less than a minute.
          Enter your email and we'll send you a secure reset link.
        </p>

        <div className="auth-features">
          {[
            { emoji: "🔒", text: "Secure reset link via email" },
            { emoji: "⏱️", text: "Link expires in 1 hour" },
            { emoji: "✅", text: "Your data stays safe" },
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

          {!sent ? (
            <>
              <h2 className="auth-card-title">Forgot password?</h2>
              <p className="auth-card-sub">
                Enter your email and we'll send you a reset link
              </p>

              {error && <div className="auth-error">{error}</div>}

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required autoFocus
                  />
                </div>

                <button className="auth-submit" type="submit" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : "Send Reset Link →"}
                </button>
              </form>
            </>
          ) : (
            /* ── Success state ── */
            <div className="forgot-success">
              <div className="forgot-success-icon">📬</div>
              <h2 className="auth-card-title">Check your inbox</h2>
              <p className="auth-card-sub">
                If <strong>{email}</strong> is registered, you'll receive
                a reset link shortly. Check your spam folder too.
              </p>
              <div className="forgot-success-note">
                The link expires in <strong>1 hour</strong>.
              </div>
            </div>
          )}

          <p className="auth-switch">
            Remember your password?{" "}
            <Link to="/login" className="auth-link">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}