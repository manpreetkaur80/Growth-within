import { Link } from "react-router-dom";
import "../styles/homepage.css";

const FEATURES = [
  {
    emoji: "📅",
    title: "Monthly Planner",
    desc: "Visualize your entire month at a glance. Click any day to open your personal journal entry and track your daily reflections.",
    color: ["#ffbe0b", "#fb5607"],
    path: "/planner",
  },
  {
    emoji: "📖",
    title: "Daily Journal",
    desc: "Reflect on your mood, celebrate wins, acknowledge challenges, and write freely. Your private space to think out loud.",
    color: ["#ff006e", "#8338ec"],
    path: "/journal/today",
  },
  {
    emoji: "🔥",
    title: "Habit Tracker",
    desc: "Build streaks, track consistency, and watch your habits compound over time. Visual day-by-day grid for every habit.",
    color: ["#fb5607", "#ffbe0b"],
    path: "/habits",
  },
  {
    emoji: "🎯",
    title: "Goals",
    desc: "Set meaningful goals with milestones. Track your progress with visual rings and celebrate every step forward.",
    color: ["#3a86ff", "#8338ec"],
    path: "/goals",
  },
  {
    emoji: "✅",
    title: "To-Do List",
    desc: "Separate your daily tasks from general ones. Simple, clean, and satisfying to check off.",
    color: ["#8338ec", "#ff006e"],
    path: "/todolist",
  },
  {
    emoji: "✨",
    title: "Vision Board",
    desc: "Search millions of photos from Unsplash and drag them onto your personal vision board. See your dream life every day.",
    color: ["#ff006e", "#fb5607"],
    path: "/Visionpage",
  },
];

const STEPS = [
  { num: "01", title: "Create your account", desc: "Sign up in seconds — no credit card, no fluff." },
  { num: "02", title: "Set up your goals",   desc: "Tell the app what you're working towards." },
  { num: "03", title: "Track every day",     desc: "Log habits, journal entries, and tasks daily." },
  { num: "04", title: "Watch yourself grow", desc: "See your streaks, progress rings, and board fill up." },
];

export default function Homepage() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="home-root">

      {/* ── Orbs ── */}
      <div className="home-orb home-orb-1" />
      <div className="home-orb home-orb-2" />
      <div className="home-orb home-orb-3" />
      <div className="home-orb home-orb-4" />
      <div className="grid-texture" />

      {/* ══════════ HERO ══════════ */}
      <section className="hero-section">
        <div className="hero-eyebrow">
          <span className="hero-dot" />
          Personal Growth Platform
        </div>

        <h1 className="hero-title">
          Become the best<br />
          version of <em>yourself</em>
        </h1>

        <p className="hero-sub">
          Journal daily. Track habits. Set goals. Build your vision.
          <br />Everything you need for intentional self-growth — in one place.
        </p>

        <div className="hero-cta-row">
          {isLoggedIn ? (
            <Link to="/planner" className="cta-primary">Go to Dashboard →</Link>
          ) : (
            <>
              <Link to="/register" className="cta-primary">Start for free →</Link>
              <Link to="/login"    className="cta-secondary">Sign in</Link>
            </>
          )}
        </div>

        {/* Feature pills */}
        <div className="hero-pills">
          {["📅 Planner","📖 Journal","🔥 Habits","🎯 Goals","✅ To-Do","✨ Vision Board"].map(p => (
            <span key={p} className="hero-pill">{p}</span>
          ))}
        </div>
      </section>

      {/* ══════════ ABOUT ══════════ */}
      <section className="about-section">
        <div className="about-inner">
          <div className="about-text">
            <span className="section-eyebrow">About Growth with-in</span>
            <h2 className="section-title">Why this app exists</h2>
            <p className="about-para">
              Growth with-in was built on a simple belief — that consistent small actions,
              tracked and reflected on, lead to extraordinary change over time.
            </p>
            <p className="about-para">
              Most productivity apps are either too complex or too shallow. This one sits in
              the middle — powerful enough to track everything that matters, simple enough
              that you'll actually use it every day.
            </p>
            <p className="about-para">
              Whether you're building a morning routine, chasing a big career goal, or just
              trying to drink more water — Growth with-in gives you the structure and the
              mirror to keep going.
            </p>
          </div>
          <div className="about-stats">
            <div className="stat-block" style={{"--c1":"#ff006e","--c2":"#8338ec"}}>
              <span className="stat-big">6</span>
              <span className="stat-desc">Powerful tools</span>
            </div>
            <div className="stat-block" style={{"--c1":"#3a86ff","--c2":"#8338ec"}}>
              <span className="stat-big">∞</span>
              <span className="stat-desc">Journal entries</span>
            </div>
            <div className="stat-block" style={{"--c1":"#ffbe0b","--c2":"#fb5607"}}>
              <span className="stat-big">365</span>
              <span className="stat-desc">Days of growth</span>
            </div>
            <div className="stat-block" style={{"--c1":"#fb5607","--c2":"#ff006e"}}>
              <span className="stat-big">100%</span>
              <span className="stat-desc">Yours & private</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section className="features-section">
        <div className="features-inner">
          <span className="section-eyebrow">Everything you need</span>
          <h2 className="section-title">6 tools. One goal.</h2>
          <p className="section-sub">Each tool is designed to work together — plan in the morning, journal at night, track habits daily.</p>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <Link
                to={isLoggedIn ? f.path : "/register"}
                key={f.title}
                className="feature-card"
                style={{ "--c1": f.color[0], "--c2": f.color[1], animationDelay: `${i*0.08}s` }}
              >
                <span className="feature-emoji">{f.emoji}</span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <span className="feature-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="how-section">
        <div className="how-inner">
          <span className="section-eyebrow">How it works</span>
          <h2 className="section-title">Simple as 1, 2, 3, 4</h2>

          <div className="steps-row">
            {STEPS.map((s, i) => (
              <div key={s.num} className="step-card" style={{ animationDelay: `${i*0.1}s` }}>
                <span className="step-num">{s.num}</span>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section className="cta-section">
        <div className="cta-inner">
          <span className="cta-spark">✦</span>
          <h2 className="cta-title">Ready to start growing?</h2>
          <p className="cta-sub">Join and take the first step towards the life you want.</p>
          {isLoggedIn ? (
            <Link to="/planner" className="cta-primary large">Go to Dashboard →</Link>
          ) : (
            <div className="cta-btn-row">
              <Link to="/register" className="cta-primary large">Create free account →</Link>
              <Link to="/login"    className="cta-secondary large">Already have one? Sign in</Link>
            </div>
          )}
        </div>
      </section>

      {}
      <footer className="home-footer">
        <span className="home-footer-brand">
          <span className="footer-star">✦</span> Growth <em>with-in</em>
        </span>
        <span className="home-footer-copy">© {new Date().getFullYear()} · Built for growth</span>
      </footer>

    </div>
  );
}