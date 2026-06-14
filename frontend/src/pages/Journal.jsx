

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/journal.css";
import { api } from "../Api";

const MOODS = [
  { key: "happy",   emoji: "🙂", label: "Good",  color: "#ffbe0b" },
  { key: "neutral", emoji: "😐", label: "Okay",  color: "#3a86ff" },
  { key: "sad",     emoji: "🙁", label: "Tough", color: "#8338ec" },
];

const getRealToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

export default function Journal() {
  const { date } = useParams();
  const navigate  = useNavigate();

 
  const resolvedDate = date === "today" ? getRealToday() : date;
  const isToday      = resolvedDate === getRealToday();

  const [mood,      setMood]      = useState("");
  const [wentWell,  setWentWell]  = useState("");
  const [difficult, setDifficult] = useState("");
  const [tweak,     setTweak]     = useState("");
  const [entry,     setEntry]     = useState("");
  const [saved,     setSaved]     = useState(false);
  const [mounted,   setMounted]   = useState(false);

  
  const [dateTasks,   setDateTasks]   = useState([]);
  const [newTask,     setNewTask]     = useState("");

 
  useEffect(() => {
    api.get(`/journal/${resolvedDate}`)
      .then(data => {
        setMood(data.mood || "");
        setWentWell(data.wentWell || "");
        setDifficult(data.difficult || "");
        setTweak(data.tweak || "");
        setEntry(data.entry || "");
      })
      .catch(err => console.error("Journal load error:", err));
  }, [resolvedDate]);

  useEffect(() => {
    api.get("/todos")
      .then(data => {
        const all = Array.isArray(data) ? data : [];
        // Show tasks that belong to this specific date only
        setDateTasks(all.filter(t => t.date === resolvedDate));
      })
      .catch(err => console.error("Tasks load error:", err));
  }, [resolvedDate]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

 
  const handleSave = async () => {
    try {
      await api.post(`/journal/${resolvedDate}`, { mood, wentWell, difficult, tweak, entry });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { console.error("Journal save error:", err); }
  };

  
  const addDateTask = async () => {
    if (!newTask.trim()) return;
    try {
      const data = await api.post("/todos", { task: newTask, date: resolvedDate });
      setDateTasks(prev => [...prev, data]);
      setNewTask("");
    } catch (err) { console.error("Add task error:", err); }
  };


  const toggleTask = async (id, current) => {
    try {
      const data = await api.put(`/todos/${id}`, { done: !current });
      setDateTasks(prev => prev.map(t => t._id === id ? data : t));
    } catch (err) { console.error("Toggle error:", err); }
  };


  const deleteTask = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setDateTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) { console.error("Delete error:", err); }
  };

  
  const dateLabel = (() => {
    try {
      return new Date(resolvedDate + "T00:00:00")
        .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    } catch { return resolvedDate; }
  })();

  const doneTasks = dateTasks.filter(t => t.done).length;

  return (
    <div className={`journal-root${mounted ? " mounted" : ""}`}>
      <div className="jorb jorb-1" />
      <div className="jorb jorb-2" />
      <div className="jorb jorb-3" />
      <div className="grid-texture" />

      <div className="journal-content">

        {/* ── Header ── */}
        <div className="journal-header">
          <span className="journal-eyebrow">📖 Daily Journal</span>
          <h1 className="journal-title">{isToday ? "Today" : dateLabel.split(",")[0]}</h1>
          <p className="journal-subtitle">{dateLabel}</p>
        </div>

        {/* ── Mood picker ── */}
        <div className="journal-card mood-card">
          <h2 className="card-label">How are you feeling?</h2>
          <div className="mood-row">
            {MOODS.map(({ key, emoji, label, color }) => (
              <button key={key}
                className={`mood-btn${mood === key ? " selected" : ""}`}
                style={{ "--mood-color": color }}
                onClick={() => setMood(key)}
              >
                <span className="mood-emoji">{emoji}</span>
                <span className="mood-label">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Guided questions ── */}
        <div className="questions-grid">
          <div className="journal-card">
            <h2 className="card-label">What went well today?</h2>
            <textarea className="journal-textarea" value={wentWell}
              onChange={e => setWentWell(e.target.value)}
              placeholder="Celebrate your wins, big or small..." />
          </div>
          <div className="journal-card">
            <h2 className="card-label">What was difficult?</h2>
            <textarea className="journal-textarea" value={difficult}
              onChange={e => setDifficult(e.target.value)}
              placeholder="It's okay to acknowledge the hard parts..." />
          </div>
          <div className="journal-card">
            <h2 className="card-label">Tiny tweak for tomorrow?</h2>
            <textarea className="journal-textarea" value={tweak}
              onChange={e => setTweak(e.target.value)}
              placeholder="One small thing to do differently..." />
          </div>
        </div>

        {/* ── Free write ── */}
        <div className="journal-card free-card">
          <h2 className="card-label">Free space — write anything</h2>
          <textarea className="journal-textarea free-textarea" value={entry}
            onChange={e => setEntry(e.target.value)}
            placeholder="Your thoughts, ideas, feelings... no rules here." />
        </div>

        {/* ── This date's tasks ── */}
        <div className="journal-card">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 16 }}>
            <h2 className="card-label" style={{ margin: 0 }}>
              Tasks for this day
              {dateTasks.length > 0 && (
                <span style={{ marginLeft: 10, color: "#8338ec", fontFamily: "Space Grotesk", fontSize: 12 }}>
                  {doneTasks}/{dateTasks.length} done
                </span>
              )}
            </h2>
          </div>

          {/* Add task input */}
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            <input
              className="journal-textarea"
              style={{ minHeight:"unset", padding:"10px 14px", border:"1.5px solid rgba(131,56,236,0.15)", borderRadius:12, flex:1, fontSize:14 }}
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder={`Add a task for ${isToday ? "today" : "this day"}...`}
              onKeyDown={e => e.key === "Enter" && addDateTask()}
            />
            <button onClick={addDateTask}
              style={{ padding:"10px 18px", borderRadius:50, border:"none", background:"linear-gradient(135deg,#3a86ff,#8338ec)", color:"#fff", fontFamily:"Space Grotesk", fontWeight:700, fontSize:13, cursor:"pointer", whiteSpace:"nowrap" }}>
              + Add
            </button>
          </div>

          {/* Task list */}
          {dateTasks.length === 0 && (
            <p style={{ color:"#c0c4d8", fontSize:14, fontStyle:"italic" }}>No tasks for this day yet.</p>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {dateTasks.map(task => (
              <div key={task._id}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:12, background: task.done ? "rgba(131,56,236,0.06)" : "rgba(255,255,255,0.6)", border:"1.5px solid rgba(0,0,0,0.05)" }}>
                <button onClick={() => toggleTask(task._id, task.done)}
                  style={{ width:22, height:22, borderRadius:"50%", border:"2px solid rgba(131,56,236,0.3)", background: task.done ? "linear-gradient(135deg,#8338ec,#ff006e)" : "rgba(255,255,255,0.7)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700, flexShrink:0, padding:0 }}>
                  {task.done ? "✓" : ""}
                </button>
                <span style={{ flex:1, fontSize:14, fontWeight:600, color: task.done ? "#c0c4d8" : "#2a2050", textDecoration: task.done ? "line-through" : "none" }}>
                  {task.task}
                </span>
                <button onClick={() => deleteTask(task._id)}
                  style={{ width:22, height:22, borderRadius:"50%", border:"1.5px solid rgba(255,80,100,0.2)", background:"rgba(255,80,100,0.06)", color:"#ff506488", fontSize:9, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="journal-actions">
          <div className="nav-btns">
            <button className="nav-btn" onClick={() => navigate("/habits")}>🔥 Habits</button>
            <button className="nav-btn" onClick={() => navigate("/todolist")}>✅ To-Do List</button>
          </div>
          <button className={`save-btn${saved ? " saved" : ""}`} onClick={handleSave}>
            {saved ? "✓ Saved!" : "Save Entry"}
          </button>
        </div>

      </div>
    </div>
  );
}