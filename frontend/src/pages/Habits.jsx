
import { useState, useEffect } from "react";
import "../styles/habits.css";
import { api } from "../api";

const ACCENT_COLORS = [
  ['#ff006e', '#8338ec'],
  ['#3a86ff', '#8338ec'],
  ['#ffbe0b', '#fb5607'],
  ['#fb5607', '#ff006e'],
  ['#8338ec', '#3a86ff'],
];

export default function Habits() {
  const [grid,     setGrid]     = useState(null);
  const [newHabit, setNewHabit] = useState("");
  const [mounted,  setMounted]  = useState(false);

  const today     = new Date();
  const month     = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;
  const todayDate = `${month}-${String(today.getDate()).padStart(2,"0")}`;

  // ── Load grid
  useEffect(() => {
    api.get(`/habitgrid/${month}`)
      .then(data => setGrid(data))
      .catch(err => console.error("Habits load error:", err));
  }, [month]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // ── Create grid
  const createGrid = async () => {
    const data = await api.post("/habitgrid", { month, habits: [] });
    setGrid(data);
  };

  // ── Add habit
  const addHabit = async () => {
    if (!newHabit.trim()) return;
    const data = await api.put(`/habitgrid/${month}/addhabit`, { name: newHabit });
    setGrid(data);
    setNewHabit("");
  };

  // ── Toggle check-in
  const toggleCheck = async (habitName, date, current) => {
    const data = await api.put(`/habitgrid/${month}/${habitName}/${date}`, { done: !current });
    setGrid(data);
  };

  // ── Delete habit
  const deleteHabit = async (habitName) => {
    const data = await api.delete(`/habitgrid/${month}/${habitName}`);
    setGrid(data);
  };

  // ── Empty loading state
  if (!grid) {
    return (
      <div className={`habits-root${mounted ? " mounted" : ""}`}>
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
        <div className="grid-texture" />
        <div className="habits-content">
          <div className="habits-header">
            <span className="eyebrow-tag">🔥 Habit Tracker</span>
            <h1 className="habits-title">Build Your Streaks</h1>
            <p className="habits-subtitle">No grid yet for this month</p>
          </div>
          <div className="empty-state">
            <p className="empty-text">Start tracking your habits for {month}</p>
            <button className="create-btn" onClick={createGrid}>Create This Month's Grid</button>
          </div>
        </div>
      </div>
    );
  }

  const daysInMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) =>
    `${month}-${String(i+1).padStart(2,"0")}`
  );

  const getStreak = (habit) => {
    let streak = 0;
    for (let i = dates.length-1; i >= 0; i--) {
      if (habit.statusByDate?.[dates[i]]) streak++;
      else break;
    }
    return streak;
  };

  const getPercent = (habit) => {
    const done = dates.filter(d => habit.statusByDate?.[d]).length;
    return Math.round((done / dates.length) * 100);
  };

  return (
    <div className={`habits-root${mounted ? " mounted" : ""}`}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="orb orb-3" /><div className="orb orb-4" />
      <div className="grid-texture" />

      <div className="habits-content">

        <div className="habits-header">
          <span className="eyebrow-tag">🔥 Habit Tracker</span>
          <h1 className="habits-title">Build Your Streaks</h1>
          <p className="habits-subtitle">{month} — stay consistent, grow daily</p>
        </div>

        <div className="add-habit-card">
          <input
            className="habit-input"
            value={newHabit}
            onChange={e => setNewHabit(e.target.value)}
            placeholder="Add a new habit..."
            onKeyDown={e => e.key === "Enter" && addHabit()}
          />
          <button className="add-habit-btn" onClick={addHabit}>+ Add Habit</button>
        </div>

        {grid?.habits?.length === 0 && (
          <div className="no-habits"><p>No habits yet — add your first one above!</p></div>
        )}

        <div className="habits-list">
          {grid?.habits?.map((habit, hi) => {
            const [c1, c2] = ACCENT_COLORS[hi % ACCENT_COLORS.length];
            const streak  = getStreak(habit);
            const percent = getPercent(habit);
            return (
              <div key={habit.name} className="habit-card" style={{ '--c1': c1, '--c2': c2 }}>
                <div className="habit-card-header">
                  <div className="habit-name-row">
                    <span className="habit-color-dot" />
                    <h3 className="habit-name">{habit.name}</h3>
                  </div>
                  <div className="habit-meta">
                    {streak > 0 && <span className="streak-badge">🔥 {streak} day streak</span>}
                    <span className="percent-badge">{percent}%</span>
                    <button className="delete-habit-btn" onClick={() => deleteHabit(habit.name)} title="Delete">✕</button>
                  </div>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${percent}%` }} />
                </div>
                <div className="day-grid">
                  {dates.map(d => {
                    const done    = habit.statusByDate?.[d] || false;
                    const dayNum  = parseInt(d.split("-")[2]);
                    const isToday = d === todayDate;
                    return (
                      <button key={d}
                        className={`day-cell${done ? " done" : ""}${isToday ? " is-today" : ""}`}
                        onClick={() => toggleCheck(habit.name, d, done)}
                        title={`Day ${dayNum}`}
                      >
                        <span className="day-num">{dayNum}</span>
                        {done && <span className="check-mark">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}