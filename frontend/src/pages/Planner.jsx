
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/planner.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CELL_ACCENTS = [
  ['#3a86ff', '#8338ec'],
  ['#8338ec', '#ff006e'],
  ['#ff006e', '#fb5607'],
  ['#fb5607', '#ffbe0b'],
  ['#ffbe0b', '#3a86ff'],
];

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const lerp = (a, b, t) => a + (b - a) * t;

function DayCell({ day, accentIdx, isSelected, isToday, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [c1, c2] = CELL_ACCENTS[accentIdx % CELL_ACCENTS.length];

  return (
    <div
      className={`calendar-cell${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}${hovered ? ' hovered' : ''}`}
      style={{ '--c1': c1, '--c2': c2 }}
      onClick={() => onClick(day)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isToday && <span className="today-dot" />}
      {hovered && !isSelected && <span className="shine-sweep" />}
      <span className="day-number">{day}</span>
    </div>
  );
}

export default function Planner() {
  const now = new Date();

  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const todayDay   = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear  = now.getFullYear();

  const isCurrentMonth = viewYear === todayYear && viewMonth === todayMonth;
  const monthOffset    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthLabel     = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
  const monthStr       = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;

  // ── Navigation ─
  const goToPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDate(null);
  };

  const goToNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDate(null);
  };

  const goToToday = () => {
    setViewYear(todayYear);
    setViewMonth(todayMonth);
    setSelectedDate(null);
  };

  // ── State ──────
  const [selectedDate, setSelectedDate] = useState(null);
  const [mounted,      setMounted]      = useState(false);

  
  const glowRef  = useRef(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const glowPos  = useRef({ x: 50, y: 50 });
  const rafRef   = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onMove = e => {
      mousePos.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', onMove);

    const tick = () => {
      // Lerp towards mouse
      glowPos.current.x = lerp(glowPos.current.x, mousePos.current.x * 100, 0.06);
      glowPos.current.y = lerp(glowPos.current.y, mousePos.current.y * 100, 0.06);

     
      if (glowRef.current) {
        glowRef.current.style.left = `${glowPos.current.x}%`;
        glowRef.current.style.top  = `${glowPos.current.y}%`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Build cells 
  const cells = [];
  for (let i = 0; i < monthOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const journalDateStr = selectedDate
    ? `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
    : null;

  const selectedLabel = selectedDate
    ? new Date(viewYear, viewMonth, selectedDate)
        .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  const getTag = (day) => {
    if (!isCurrentMonth) return viewYear < todayYear || (viewYear === todayYear && viewMonth < todayMonth) ? '🕐 Past Month' : '🚀 Upcoming Month';
    if (day === todayDay) return '⚡ Today';
    if (day < todayDay)   return '🕐 Past';
    return '🚀 Upcoming';
  };

  return (
    <div className={`planner-root${mounted ? ' mounted' : ''}`}>

      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />

      {/* Cursor glow — ref-based, no re-renders */}
      <div className="cursor-glow" ref={glowRef} />
      <div className="grid-texture" />

      <div className="planner-content">

        <div className="planner-header">
          <span className="eyebrow-tag">📅 Monthly Planner</span>
          <h1 className="month-title">{monthLabel}</h1>
          <p className="month-subtitle">Click any day to open your journal entry</p>
        </div>

        <div className="weekday-row">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className={`weekday-cell weekday-col-${i}`}>{d}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="empty-cell" />;
            const isToday = isCurrentMonth && day === todayDay;
            return (
              <div key={day} className="cell-wrapper" style={{ animationDelay: `${i * 18}ms` }}>
                <DayCell
                  day={day}
                  accentIdx={i}
                  isSelected={selectedDate === day}
                  isToday={isToday}
                  onClick={setSelectedDate}
                />
              </div>
            );
          })}
        </div>

        {selectedDate && (
          <div className="selected-card">
            <div className="selected-info">
              <span className="selected-label">Selected</span>
              <h2 className="selected-date">{selectedLabel}</h2>
              <span className="selected-tag">{getTag(selectedDate)}</span>
            </div>
            <Link to={`/journal/${journalDateStr}`} className="journal-btn">
              Open Journal →
            </Link>
          </div>
        )}

        <div className="month-nav">
          <button className="month-nav-btn" onClick={goToPrev}>← Prev</button>
          {!isCurrentMonth && (
            <button className="month-nav-today" onClick={goToToday}>Today</button>
          )}
          <span className="nav-dot">•</span>
          <button className="month-nav-btn" onClick={goToNext}>Next →</button>
        </div>

      </div>
    </div>
  );
}