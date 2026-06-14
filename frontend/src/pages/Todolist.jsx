
import { useState, useEffect } from "react";
import "../styles/todolist.css";
import { api } from "../Api";


const getRealToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

export default function Todolist() {
  const [todos,   setTodos]   = useState([]);
  const [newTask, setNewTask] = useState("");
  const [mounted, setMounted] = useState(false);
  const [filter,  setFilter]  = useState("all");


  const todayDate  = getRealToday();
  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // ── Load todos ─
  useEffect(() => {
    api.get("/todos")
      .then(data => setTodos(Array.isArray(data) ? data : []))
      .catch(err => console.error("Todos load error:", err));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // ── Add todo ───

  const addTodo = async (isDaily = false) => {
    if (!newTask.trim()) return;
    const body = isDaily
      ? { task: newTask, date: todayDate }   // ← always real today
      : { task: newTask };                   // ← no date = general
    try {
      const data = await api.post("/todos", body);
      setTodos(prev => [...prev, data]);
      setNewTask("");
    } catch (err) { console.error("Add todo error:", err); }
  };

  // ── Toggle todo 
  const toggleTodo = async (id, current) => {
    try {
      const data = await api.put(`/todos/${id}`, { done: !current });
      setTodos(prev => prev.map(t => t._id === id ? data : t));
    } catch (err) { console.error("Toggle error:", err); }
  };

  // ── Delete todo 
  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(prev => prev.filter(t => t._id !== id));
    } catch (err) { console.error("Delete error:", err); }
  };

 
  const dailyTasks   = todos.filter(t => t.date === todayDate);
  const generalTasks = todos.filter(t => !t.date);
  const dailyDone    = dailyTasks.filter(t => t.done).length;
  const generalDone  = generalTasks.filter(t => t.done).length;

  const applyFilter = (list) => {
    if (filter === "pending") return list.filter(t => !t.done);
    if (filter === "done")    return list.filter(t => t.done);
    return list;
  };

  return (
    <div className={`todo-root${mounted ? " mounted" : ""}`}>
      <div className="torb torb-1" /><div className="torb torb-2" />
      <div className="torb torb-3" /><div className="torb torb-4" />
      <div className="grid-texture" />

      <div className="todo-content">

        {/* ── Header ── */}
        <div className="todo-header">
          <span className="todo-eyebrow">✅ To-Do List</span>
          <h1 className="todo-title">Get Things Done</h1>
          <p className="todo-subtitle">{todayLabel}</p>
        </div>

        {/* ── Stats ── */}
        <div className="stats-row">
          <div className="stat-card" style={{"--sc1":"#3a86ff","--sc2":"#8338ec"}}>
            <span className="stat-num">{dailyTasks.length}</span>
            <span className="stat-label">Today's Tasks</span>
          </div>
          <div className="stat-card" style={{"--sc1":"#ff006e","--sc2":"#fb5607"}}>
            <span className="stat-num">{generalTasks.length}</span>
            <span className="stat-label">General Tasks</span>
          </div>
          <div className="stat-card" style={{"--sc1":"#ffbe0b","--sc2":"#fb5607"}}>
            <span className="stat-num">{todos.filter(t=>t.done).length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card" style={{"--sc1":"#8338ec","--sc2":"#ff006e"}}>
            <span className="stat-num">{todos.filter(t=>!t.done).length}</span>
            <span className="stat-label">Remaining</span>
          </div>
        </div>

        {/* ── Add task ── */}
        <div className="add-task-card">
          <input
            className="task-input"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            placeholder="What needs to be done?"
            onKeyDown={e => e.key === "Enter" && addTodo(true)}
          />
          <div className="add-btns">
            <button className="add-btn daily-btn"   onClick={() => addTodo(true)}>+ Today</button>
            <button className="add-btn general-btn" onClick={() => addTodo(false)}>+ General</button>
          </div>
        </div>

        {/* ── Filter pills ── */}
        <div className="filter-row">
          {["all","pending","done"].map(f => (
            <button key={f} className={`filter-pill${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "pending" ? "Pending" : "Done"}
            </button>
          ))}
        </div>

        {/* ── Two columns ── */}
        <div className="tasks-columns">

          {/* Today's Tasks — only real today */}
          <div className="tasks-section">
            <div className="section-header">
              <div className="section-title-row">
                <span className="section-dot daily-dot" />
                <h2 className="section-title">Today's Tasks</h2>
              </div>
              <span className="section-count">{dailyDone}/{dailyTasks.length}</span>
            </div>
            <div className="section-progress-track">
              <div className="section-progress-fill daily-fill"
                style={{ width: dailyTasks.length ? `${(dailyDone/dailyTasks.length)*100}%` : "0%" }} />
            </div>
            <div className="tasks-list">
              {applyFilter(dailyTasks).length === 0 && (
                <p className="empty-section">No tasks for today yet.</p>
              )}
              {applyFilter(dailyTasks).map((todo, i) => (
                <div key={todo._id} className={`task-item${todo.done ? " done" : ""}`}
                  style={{ animationDelay: `${i*0.05}s` }}>
                  <button className={`task-check${todo.done ? " checked" : ""}`}
                    onClick={() => toggleTodo(todo._id, todo.done)}>
                    {todo.done && <span className="check-icon">✓</span>}
                  </button>
                  <span className="task-text">{todo.task}</span>
                  <button className="task-delete" onClick={() => deleteTodo(todo._id)} title="Delete">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* General Tasks — no date, always visible */}
          <div className="tasks-section">
            <div className="section-header">
              <div className="section-title-row">
                <span className="section-dot general-dot" />
                <h2 className="section-title">General Tasks</h2>
              </div>
              <span className="section-count">{generalDone}/{generalTasks.length}</span>
            </div>
            <div className="section-progress-track">
              <div className="section-progress-fill general-fill"
                style={{ width: generalTasks.length ? `${(generalDone/generalTasks.length)*100}%` : "0%" }} />
            </div>
            <div className="tasks-list">
              {applyFilter(generalTasks).length === 0 && (
                <p className="empty-section">No general tasks yet.</p>
              )}
              {applyFilter(generalTasks).map((todo, i) => (
                <div key={todo._id} className={`task-item${todo.done ? " done" : ""}`}
                  style={{ animationDelay: `${i*0.05}s` }}>
                  <button className={`task-check${todo.done ? " checked" : ""}`}
                    onClick={() => toggleTodo(todo._id, todo.done)}>
                    {todo.done && <span className="check-icon">✓</span>}
                  </button>
                  <span className="task-text">{todo.task}</span>
                  <button className="task-delete" onClick={() => deleteTodo(todo._id)} title="Delete">✕</button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}