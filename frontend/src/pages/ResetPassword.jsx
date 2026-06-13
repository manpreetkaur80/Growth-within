import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "../styles/AuthPages.css";

export default function ResetPassword() {
  const { token }   = useParams();
  const navigate    = useNavigate();
  const [form,      setForm]    = useState({ password: "", confirm: "" });
  const [loading,   setLoading] = useState(false);
  const [success,   setSuccess] = useState(false);
  const [error,     setError]   = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6)       { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      setSuccess(true);
      // Auto redirect to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
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
          Almost<br /><em>there</em>
        </h1>

        <p className="auth-left-sub">
          Choose a strong new password and you'll be back
          on your growth journey in seconds.
        </p>

        <div className="auth-features">
          {[
            { emoji: "🔐", text: "Minimum 6 characters" },
            { emoji: "💡", text: "Use a mix of letters and numbers" },
            { emoji: "🛡️", text: "Your password is encrypted" },
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

          {!success ? (
            <>
              <h2 className="auth-card-title">Set new password ✦</h2>
              <p className="auth-card-sub">Choose a strong password for your account</p>

              {error && <div className="auth-error">{error}</div>}

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label>New Password</label>
                  <input
                    type="password" name="password"
                    value={form.password} onChange={handleChange}
                    placeholder="Min 6 characters"
                    required autoFocus
                  />
                </div>

                <div className="auth-field">
                  <label>Confirm New Password</label>
                  <input
                    type="password" name="confirm"
                    value={form.confirm} onChange={handleChange}
                    placeholder="Repeat password"
                    required
                  />
                </div>

                <button className="auth-submit" type="submit" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : "Reset Password →"}
                </button>
              </form>
            </>
          ) : (
          
            <div className="forgot-success">
              <div className="forgot-success-icon">🎉</div>
              <h2 className="auth-card-title">Password reset!</h2>
              <p className="auth-card-sub">
                Your password has been updated successfully.
                Redirecting you to login...
              </p>
              <div className="forgot-success-note">
                Or <Link to="/login" className="auth-link">click here →</Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}