import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/dashboard.css";
import { api } from "../Api";

export default function Dashboard() {
  const [mounted,  setMounted]  = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [stats,    setStats]    = useState(null);
  const [greeting, setGreeting] = useState("");

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  })();

  const today = new Date();
  const todayDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const monthStr  = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;

  useEffect(() => {
    const h = today.getHours();
    if (h < 12)      setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else             setGreeting("Good evening");

    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // ── Fetch all data and compute stats 
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [todos, goals, habits, journal] = await Promise.all([
          api.get("/todos"),
          api.get("/goals"),
          api.get(`/habitgrid/${monthStr}`),
          api.get(`/journal/${todayDate}`),
        ]);

        // Todos
        const todayTasks   = (todos || []).filter(t => t.date === todayDate);
        const generalTasks = (todos || []).filter(t => !t.date);
        const todayDone    = todayTasks.filter(t => t.done).length;
        const generalDone  = generalTasks.filter(t => t.done).length;

        // Goals
        const goalList      = Array.isArray(goals) ? goals : [];
        const totalGoals    = goalList.length;
        const avgProgress   = totalGoals
          ? Math.round(goalList.reduce((sum, g) => {
              const done = (g.milestones || []).filter(m => m.done).length;
              const total = (g.milestones || []).length;
              return sum + (total ? done / total : 0);
            }, 0) / totalGoals * 100)
          : 0;
        const completedGoals = goalList.filter(g =>
          g.milestones?.length > 0 && g.milestones.every(m => m.done)
        ).length;

        // Habits
        const habitList = habits?.habits || [];
        const daysInMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
        const dates = Array.from({ length: daysInMonth }, (_, i) =>
          `${monthStr}-${String(i+1).padStart(2,"0")}`
        );
        const habitStats = habitList.map(h => {
          let streak = 0;
          for (let i = dates.length-1; i >= 0; i--) {
            if (h.statusByDate?.[dates[i]]) streak++;
            else break;
          }
          const done = dates.filter(d => h.statusByDate?.[d]).length;
          return { name: h.name, streak, percent: Math.round(done/daysInMonth*100) };
        });
        const topStreak = habitStats.reduce((max, h) => h.streak > max.streak ? h : max, { streak: 0, name: "" });

        // Journal
        const hasJournalToday = journal && (journal.mood || journal.entry || journal.wentWell);

        setStats({
          todayTasks: todayTasks.length,
          todayDone,
          generalTasks: generalTasks.length,
          generalDone,
          totalGoals,
          avgProgress,
          completedGoals,
          totalHabits: habitList.length,
          topStreak,
          habitStats: habitStats.slice(0, 4),
          hasJournalToday,
          journalMood: journal?.mood || null,
        });
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const moodEmoji = { happy: "🙂", neutral: "😐", sad: "🙁" };

  const QUICK_LINKS = [
    { label: "Open Journal",    path: `/journal/${todayDate}`, emoji: "📖", c1: "#ff006e", c2: "#8338ec" },
    { label: "Track Habits",    path: "/habits",               emoji: "🔥", c1: "#fb5607", c2: "#ffbe0b" },
    { label: "View Goals",      path: "/goals",                emoji: "🎯", c1: "#3a86ff", c2: "#8338ec" },
    { label: "To-Do List",      path: "/todolist",             emoji: "✅", c1: "#8338ec", c2: "#ff006e" },
    { label: "Vision Board",    path: "/Visionpage",           emoji: "✨", c1: "#ffbe0b", c2: "#fb5607" },
    { label: "Planner",         path: "/planner",              emoji: "📅", c1: "#3a86ff", c2: "#ff006e" },
  ];

  return (
    <div className={`dash-root${mounted ? " mounted" : ""}`}>
      <div className="dash-orb dash-orb-1" />
      <div className="dash-orb dash-orb-2" />
      <div className="dash-orb dash-orb-3" />
      <div className="grid-texture" />

      <div className="dash-content">

        {/* ── Header ── */}
        <div className="dash-header">
          <div className="dash-greeting">
            <span className="dash-eyebrow">✦ Dashboard</span>
            <h1 className="dash-title">
              {greeting}, <em>{user?.name?.split(" ")[0] || "there"}</em>
            </h1>
            <p className="dash-subtitle">
              {today.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" })}
            </p>
          </div>

          {/* Journal status badge */}
          {!loading && (
            <div className={`journal-status-badge${stats?.hasJournalToday ? " done" : ""}`}>
              {stats?.hasJournalToday
                ? <>{moodEmoji[stats.journalMood] || "📖"} Journal written today</>
                : <Link to={`/journal/${todayDate}`}>📖 Write today's journal →</Link>
              }
            </div>
          )}
        </div>

        {loading ? (
          <div className="dash-loading">
            <div className="dash-spinner" />
            <p>Loading your stats...</p>
          </div>
        ) : stats && (
          <>
            {/* ── Big stats row ── */}
            <div className="dash-stats-row">
              <div className="dash-stat" style={{"--c1":"#3a86ff","--c2":"#8338ec"}}>
                <span className="dash-stat-num">{stats.todayDone}/{stats.todayTasks}</span>
                <span className="dash-stat-label">Today's tasks done</span>
                <div className="dash-stat-bar">
                  <div className="dash-stat-fill" style={{ width: stats.todayTasks ? `${(stats.todayDone/stats.todayTasks)*100}%` : "0%" }} />
                </div>
              </div>

              <div className="dash-stat" style={{"--c1":"#ff006e","--c2":"#8338ec"}}>
                <span className="dash-stat-num">{stats.totalGoals}</span>
                <span className="dash-stat-label">Goals tracked</span>
                <span className="dash-stat-sub">{stats.avgProgress}% avg progress · {stats.completedGoals} completed</span>
              </div>

              <div className="dash-stat" style={{"--c1":"#fb5607","--c2":"#ffbe0b"}}>
                <span className="dash-stat-num">{stats.topStreak.streak}</span>
                <span className="dash-stat-label">
                  {stats.topStreak.streak > 0
                    ? `🔥 Day streak — ${stats.topStreak.name}`
                    : "No active streaks yet"}
                </span>
                <span className="dash-stat-sub">{stats.totalHabits} habits this month</span>
              </div>

              <div className="dash-stat" style={{"--c1":"#8338ec","--c2":"#ff006e"}}>
                <span className="dash-stat-num">{stats.generalDone}/{stats.generalTasks}</span>
                <span className="dash-stat-label">General tasks done</span>
                <div className="dash-stat-bar">
                  <div className="dash-stat-fill" style={{ width: stats.generalTasks ? `${(stats.generalDone/stats.generalTasks)*100}%` : "0%" }} />
                </div>
              </div>
            </div>

            {/* ── Two column section ── */}
            <div className="dash-columns">

              {/* Habits breakdown */}
              <div className="dash-card">
                <h2 className="dash-card-title">🔥 Habit Streaks</h2>
                {stats.habitStats.length === 0 ? (
                  <p className="dash-empty">No habits yet — <Link to="/habits" className="dash-link">add some →</Link></p>
                ) : (
                  <div className="dash-habits">
                    {stats.habitStats.map((h, i) => (
                      <div key={h.name} className="dash-habit-row">
                        <div className="dash-habit-info">
                          <span className="dash-habit-name">{h.name}</span>
                          <span className="dash-habit-streak">
                            {h.streak > 0 ? `🔥 ${h.streak} day streak` : "No streak yet"}
                          </span>
                        </div>
                        <div className="dash-habit-bar-wrap">
                          <div className="dash-habit-bar">
                            <div className="dash-habit-fill"
                              style={{ width: `${h.percent}%`, animationDelay: `${i*0.1}s` }} />
                          </div>
                          <span className="dash-habit-pct">{h.percent}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Link to="/habits" className="dash-card-link">View all habits →</Link>
              </div>

              {/* Goals breakdown */}
              <div className="dash-card">
                <h2 className="dash-card-title">🎯 Goals Progress</h2>
                {stats.totalGoals === 0 ? (
                  <p className="dash-empty">No goals yet — <Link to="/goals" className="dash-link">set one →</Link></p>
                ) : (
                  <div className="dash-goals">
                    <div className="dash-goal-ring-row">
                      <div className="dash-big-ring">
                        <svg viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" className="ring-bg" />
                          <circle cx="50" cy="50" r="40" className="ring-prog"
                            style={{
                              strokeDasharray: `${2*Math.PI*40}`,
                              strokeDashoffset: `${2*Math.PI*40*(1-stats.avgProgress/100)}`,
                            }} />
                        </svg>
                        <span className="dash-ring-label">{stats.avgProgress}%</span>
                      </div>
                      <div className="dash-goal-meta">
                        <p className="dash-goal-meta-big">{stats.totalGoals} goals</p>
                        <p className="dash-goal-meta-sub">{stats.completedGoals} completed</p>
                        <p className="dash-goal-meta-sub">{stats.totalGoals - stats.completedGoals} in progress</p>
                      </div>
                    </div>
                  </div>
                )}
                <Link to="/goals" className="dash-card-link">Manage goals →</Link>
              </div>

            </div>

            {/* ── Quick links ── */}
            <div className="dash-card">
              <h2 className="dash-card-title">⚡ Quick Access</h2>
              <div className="quick-links-grid">
                {QUICK_LINKS.map(link => (
                  <Link key={link.label} to={link.path} className="quick-link"
                    style={{ "--c1": link.c1, "--c2": link.c2 }}>
                    <span className="quick-link-emoji">{link.emoji}</span>
                    <span className="quick-link-label">{link.label}</span>
                    <span className="quick-link-arrow">→</span>
                  </Link>
                ))}
              </div>
            </div>

          </>
        )}

      </div>
    </div>
  );
}