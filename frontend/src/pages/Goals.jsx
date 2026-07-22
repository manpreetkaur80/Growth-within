
// import { useState, useEffect } from "react";
// import "../styles/goals.css";
// import { api } from "../Api";

// const CATEGORY_COLORS = {
//   health:    ['#fb5607', '#ffbe0b'],
//   career:    ['#3a86ff', '#8338ec'],
//   finance:   ['#ffbe0b', '#fb5607'],
//   personal:  ['#8338ec', '#ff006e'],
//   learning:  ['#3a86ff', '#ff006e'],
//   fitness:   ['#fb5607', '#ff006e'],
//   default:   ['#ff006e', '#8338ec'],
// };

// const getCategoryColors = (cat) =>
//   CATEGORY_COLORS[cat?.toLowerCase()] || CATEGORY_COLORS.default;

// export default function Goals() {
//   const [goals,        setGoals]        = useState([]);
//   const [mounted,      setMounted]      = useState(false);
//   const [expanded,     setExpanded]     = useState(null);
//   const [showForm,     setShowForm]     = useState(false);
//   const [newGoal,      setNewGoal]      = useState({ title: "", description: "", category: "", milestones: [] });
//   const [newMilestone, setNewMilestone] = useState("");

//   // ── Load goals 
//   useEffect(() => {
//     api.get("/goals")
//       .then(data => setGoals(Array.isArray(data) ? data : []))
//       .catch(err => console.error("Goals load error:", err));
//   }, []);

//   useEffect(() => {
//     const t = setTimeout(() => setMounted(true), 60);
//     return () => clearTimeout(t);
//   }, []);

//   // ── Add goal
//   const addGoal = async () => {
//     if (!newGoal.title.trim()) return;
//     const data = await api.post("/goals", newGoal);
//     setGoals(prev => [...prev, data]);
//     setNewGoal({ title: "", description: "", category: "", milestones: [] });
//     setShowForm(false);
//   };

//   // ── Add milestone to new goal 
//   const addMilestoneToNewGoal = () => {
//     if (!newMilestone.trim()) return;
//     setNewGoal({ ...newGoal, milestones: [...newGoal.milestones, { step: newMilestone, done: false }] });
//     setNewMilestone("");
//   };

//   // ── Toggle milestone
//   const toggleMilestone = async (goalId, index, current) => {
//     const data = await api.put(`/goals/${goalId}/milestone/${index}`, { done: !current });
//     setGoals(prev => prev.map(g => g._id === goalId ? data : g));
//   };

//   // ── Delete goal
//   const deleteGoal = async (id) => {
//     await api.delete(`/goals/${id}`);
//     setGoals(prev => prev.filter(g => g._id !== id));
//   };

//   const getProgress = (milestones) => {
//     if (!milestones?.length) return 0;
//     return Math.round((milestones.filter(m => m.done).length / milestones.length) * 100);
//   };

//   return (
//     <div className={`goals-root${mounted ? " mounted" : ""}`}>
//       <div className="gorb gorb-1" /><div className="gorb gorb-2" />
//       <div className="gorb gorb-3" /><div className="gorb gorb-4" />
//       <div className="grid-texture" />

//       <div className="goals-content">

//         <div className="goals-header">
//           <span className="goals-eyebrow">🎯 Goals</span>
//           <h1 className="goals-title">Your Ambitions</h1>
//           <p className="goals-subtitle">Dream it. Plan it. Achieve it.</p>
//         </div>

//         <div className="goals-top-bar">
//           <p className="goals-count">{goals.length} {goals.length === 1 ? "goal" : "goals"} tracked</p>
//           <button className={`toggle-form-btn${showForm ? " active" : ""}`} onClick={() => setShowForm(v => !v)}>
//             {showForm ? "✕ Cancel" : "+ New Goal"}
//           </button>
//         </div>

//         {showForm && (
//           <div className="goal-form-card">
//             <h2 className="form-title">Add New Goal</h2>
//             <div className="form-grid">
//               <input className="form-input" value={newGoal.title}
//                 onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
//                 placeholder="Goal title *" />
//               <input className="form-input" value={newGoal.category}
//                 onChange={e => setNewGoal({ ...newGoal, category: e.target.value })}
//                 placeholder="Category (e.g. health, career...)" />
//             </div>
//             <textarea className="form-textarea" value={newGoal.description}
//               onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
//               placeholder="Describe this goal..." />
//             <div className="milestone-builder">
//               <p className="milestone-label">Milestones</p>
//               {newGoal.milestones.length > 0 && (
//                 <ul className="new-milestone-list">
//                   {newGoal.milestones.map((m, i) => (
//                     <li key={i} className="new-milestone-item">
//                       <span className="milestone-dot" />{m.step}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//               <div className="milestone-input-row">
//                 <input className="form-input milestone-inp" value={newMilestone}
//                   onChange={e => setNewMilestone(e.target.value)}
//                   placeholder="Add a milestone step..."
//                   onKeyDown={e => e.key === "Enter" && addMilestoneToNewGoal()} />
//                 <button className="add-milestone-btn" onClick={addMilestoneToNewGoal}>+ Step</button>
//               </div>
//             </div>
//             <button className="save-goal-btn" onClick={addGoal}>Save Goal →</button>
//           </div>
//         )}

//         {goals.length === 0 && !showForm && (
//           <div className="empty-goals">
//             <p>No goals yet — set your first one!</p>
//             <button className="create-btn" onClick={() => setShowForm(true)}>+ Add Your First Goal</button>
//           </div>
//         )}

//         <div className="goals-grid">
//           {goals.map((goal, gi) => {
//             const [c1, c2] = getCategoryColors(goal.category);
//             const progress = getProgress(goal.milestones);
//             const isOpen   = expanded === goal._id;
//             return (
//               <div key={goal._id} className={`goal-card${isOpen ? " open" : ""}`}
//                 style={{ '--c1': c1, '--c2': c2, animationDelay: `${gi * 0.08 + 0.15}s` }}>
//                 <div className="goal-card-top" onClick={() => setExpanded(isOpen ? null : goal._id)}>
//                   <div className="goal-card-left">
//                     {goal.category && <span className="category-chip">{goal.category}</span>}
//                     <h3 className="goal-title-text">{goal.title}</h3>
//                     {goal.description && <p className="goal-desc">{goal.description}</p>}
//                   </div>
//                   <div className="goal-card-right">
//                     <div className="ring-wrap">
//                       <svg className="progress-ring" viewBox="0 0 44 44">
//                         <circle cx="22" cy="22" r="18" className="ring-track" />
//                         <circle cx="22" cy="22" r="18" className="ring-fill"
//                           style={{
//                             strokeDasharray: `${2 * Math.PI * 18}`,
//                             strokeDashoffset: `${2 * Math.PI * 18 * (1 - progress / 100)}`,
//                           }} />
//                       </svg>
//                       <span className="ring-label">{progress}%</span>
//                     </div>
//                     <span className="expand-arrow">{isOpen ? "▲" : "▼"}</span>
//                   </div>
//                 </div>
//                 <div className="goal-progress-track">
//                   <div className="goal-progress-fill" style={{ width: `${progress}%` }} />
//                 </div>
//                 {isOpen && (
//                   <div className="milestones-section">
//                     {goal.milestones?.length === 0 && <p className="no-milestones">No milestones added yet.</p>}
//                     <ul className="milestones-list">
//                       {goal.milestones?.map((m, i) => (
//                         <li key={i} className={`milestone-item${m.done ? " done" : ""}`}
//                           onClick={() => toggleMilestone(goal._id, i, m.done)}>
//                           <span className="milestone-check">{m.done ? "✓" : ""}</span>
//                           <span className="milestone-step">{m.step}</span>
//                         </li>
//                       ))}
//                     </ul>
//                     <button className="delete-goal-btn" onClick={() => deleteGoal(goal._id)}>Delete Goal</button>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import "../styles/goals.css";
import { api } from "../Api";

const CATEGORY_COLORS = {
  health:    ['#fb5607', '#ffbe0b'],
  career:    ['#3a86ff', '#8338ec'],
  finance:   ['#ffbe0b', '#fb5607'],
  personal:  ['#8338ec', '#ff006e'],
  learning:  ['#3a86ff', '#ff006e'],
  fitness:   ['#fb5607', '#ff006e'],
  default:   ['#ff006e', '#8338ec'],
};

const getCategoryColors = (cat) =>
  CATEGORY_COLORS[cat?.toLowerCase()] || CATEGORY_COLORS.default;

export default function Goals() {
  const [goals,        setGoals]        = useState([]);
  const [mounted,      setMounted]      = useState(false);
  const [expanded,     setExpanded]     = useState(null);
  const [showForm,     setShowForm]     = useState(false);
  const [newGoal,      setNewGoal]      = useState({ title: "", description: "", category: "", milestones: [] });
  const [newMilestone, setNewMilestone] = useState("");

  // ── Edit state
  const [editingId, setEditingId] = useState(null);
  const [editData,  setEditData]  = useState({ title: "", description: "", category: "" });

  // ── Load goals
  useEffect(() => {
    api.get("/goals")
      .then(data => setGoals(Array.isArray(data) ? data : []))
      .catch(err => console.error("Goals load error:", err));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // ── Add goal
  const addGoal = async () => {
    if (!newGoal.title.trim()) return;
    const data = await api.post("/goals", newGoal);
    setGoals(prev => [...prev, data]);
    setNewGoal({ title: "", description: "", category: "", milestones: [] });
    setShowForm(false);
  };

  // ── Add milestone to new goal
  const addMilestoneToNewGoal = () => {
    if (!newMilestone.trim()) return;
    setNewGoal({ ...newGoal, milestones: [...newGoal.milestones, { step: newMilestone, done: false }] });
    setNewMilestone("");
  };

  // ── Toggle milestone
  const toggleMilestone = async (goalId, index, current) => {
    const data = await api.put(`/goals/${goalId}/milestone/${index}`, { done: !current });
    setGoals(prev => prev.map(g => g._id === goalId ? data : g));
  };

  // ── Delete goal
  const deleteGoal = async (id) => {
    await api.delete(`/goals/${id}`);
    setGoals(prev => prev.filter(g => g._id !== id));
  };

  // ── Start editing a goal
  const startEdit = (e, goal) => {
    e.stopPropagation(); // don't trigger card expand
    setEditingId(goal._id);
    setEditData({
      title: goal.title || "",
      description: goal.description || "",
      category: goal.category || "",
    });
  };

  // ── Cancel editing
  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // ── Save edited goal
  const saveEdit = async (e, goalId) => {
    e.stopPropagation();
    if (!editData.title.trim()) return;
    const data = await api.put(`/goals/${goalId}`, editData);
    setGoals(prev => prev.map(g => g._id === goalId ? data : g));
    setEditingId(null);
  };

  const getProgress = (milestones) => {
    if (!milestones?.length) return 0;
    return Math.round((milestones.filter(m => m.done).length / milestones.length) * 100);
  };

  return (
    <div className={`goals-root${mounted ? " mounted" : ""}`}>
      <div className="gorb gorb-1" /><div className="gorb gorb-2" />
      <div className="gorb gorb-3" /><div className="gorb gorb-4" />
      <div className="grid-texture" />

      <div className="goals-content">

        <div className="goals-header">
          <span className="goals-eyebrow">🎯 Goals</span>
          <h1 className="goals-title">Your Ambitions</h1>
          <p className="goals-subtitle">Dream it. Plan it. Achieve it.</p>
        </div>

        <div className="goals-top-bar">
          <p className="goals-count">{goals.length} {goals.length === 1 ? "goal" : "goals"} tracked</p>
          <button className={`toggle-form-btn${showForm ? " active" : ""}`} onClick={() => setShowForm(v => !v)}>
            {showForm ? "✕ Cancel" : "+ New Goal"}
          </button>
        </div>

        {showForm && (
          <div className="goal-form-card">
            <h2 className="form-title">Add New Goal</h2>
            <div className="form-grid">
              <input className="form-input" value={newGoal.title}
                onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="Goal title *" />
              <input className="form-input" value={newGoal.category}
                onChange={e => setNewGoal({ ...newGoal, category: e.target.value })}
                placeholder="Category (e.g. health, career...)" />
            </div>
            <textarea className="form-textarea" value={newGoal.description}
              onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder="Describe this goal..." />
            <div className="milestone-builder">
              <p className="milestone-label">Milestones</p>
              {newGoal.milestones.length > 0 && (
                <ul className="new-milestone-list">
                  {newGoal.milestones.map((m, i) => (
                    <li key={i} className="new-milestone-item">
                      <span className="milestone-dot" />{m.step}
                    </li>
                  ))}
                </ul>
              )}
              <div className="milestone-input-row">
                <input className="form-input milestone-inp" value={newMilestone}
                  onChange={e => setNewMilestone(e.target.value)}
                  placeholder="Add a milestone step..."
                  onKeyDown={e => e.key === "Enter" && addMilestoneToNewGoal()} />
                <button className="add-milestone-btn" onClick={addMilestoneToNewGoal}>+ Step</button>
              </div>
            </div>
            <button className="save-goal-btn" onClick={addGoal}>Save Goal →</button>
          </div>
        )}

        {goals.length === 0 && !showForm && (
          <div className="empty-goals">
            <p>No goals yet — set your first one!</p>
            <button className="create-btn" onClick={() => setShowForm(true)}>+ Add Your First Goal</button>
          </div>
        )}

        <div className="goals-grid">
          {goals.map((goal, gi) => {
            const [c1, c2] = getCategoryColors(goal.category);
            const progress = getProgress(goal.milestones);
            const isOpen   = expanded === goal._id;
            const isEditing = editingId === goal._id;
            return (
              <div key={goal._id} className={`goal-card${isOpen ? " open" : ""}`}
                style={{ '--c1': c1, '--c2': c2, animationDelay: `${gi * 0.08 + 0.15}s` }}>
                <div className="goal-card-top" onClick={() => !isEditing && setExpanded(isOpen ? null : goal._id)}>
                  <div className="goal-card-left">
                    {isEditing ? (
                      <div className="goal-edit-form" onClick={e => e.stopPropagation()}>
                        <input className="form-input" value={editData.title}
                          onChange={e => setEditData({ ...editData, title: e.target.value })}
                          placeholder="Goal title *" />
                        <input className="form-input" value={editData.category}
                          onChange={e => setEditData({ ...editData, category: e.target.value })}
                          placeholder="Category" />
                        <textarea className="form-textarea" value={editData.description}
                          onChange={e => setEditData({ ...editData, description: e.target.value })}
                          placeholder="Describe this goal..." />
                        <div className="edit-actions">
                          <button className="save-edit-btn" onClick={e => saveEdit(e, goal._id)}>Save</button>
                          <button className="cancel-edit-btn" onClick={cancelEdit}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {goal.category && <span className="category-chip">{goal.category}</span>}
                        <h3 className="goal-title-text">{goal.title}</h3>
                        {goal.description && <p className="goal-desc">{goal.description}</p>}
                      </>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="goal-card-right">
                      <button className="edit-goal-btn" onClick={e => startEdit(e, goal)} title="Edit goal">
                        ✎
                      </button>
                      <div className="ring-wrap">
                        <svg className="progress-ring" viewBox="0 0 44 44">
                          <circle cx="22" cy="22" r="18" className="ring-track" />
                          <circle cx="22" cy="22" r="18" className="ring-fill"
                            style={{
                              strokeDasharray: `${2 * Math.PI * 18}`,
                              strokeDashoffset: `${2 * Math.PI * 18 * (1 - progress / 100)}`,
                            }} />
                        </svg>
                        <span className="ring-label">{progress}%</span>
                      </div>
                      <span className="expand-arrow">{isOpen ? "▲" : "▼"}</span>
                    </div>
                  )}
                </div>
                <div className="goal-progress-track">
                  <div className="goal-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                {isOpen && !isEditing && (
                  <div className="milestones-section">
                    {goal.milestones?.length === 0 && <p className="no-milestones">No milestones added yet.</p>}
                    <ul className="milestones-list">
                      {goal.milestones?.map((m, i) => (
                        <li key={i} className={`milestone-item${m.done ? " done" : ""}`}
                          onClick={() => toggleMilestone(goal._id, i, m.done)}>
                          <span className="milestone-check">{m.done ? "✓" : ""}</span>
                          <span className="milestone-step">{m.step}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="delete-goal-btn" onClick={() => deleteGoal(goal._id)}>Delete Goal</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}