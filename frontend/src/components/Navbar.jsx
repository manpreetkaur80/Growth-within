import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/navbar.css';
import { useTheme, THEMES } from '../context/ThemeContextNew';

const NAV_LINKS = [
  { label: 'Dashboard',    path: '/dashboard' },
  { label: 'Planner',      path: '/planner' },
  { label: 'Goals',        path: '/goals' },
  { label: 'Vision Board', path: '/Visionpage' },
  { label: 'Habits',       path: '/habits' },
  { label: 'To-Do List',   path: '/todolist' },
];

export default function Navbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user,     setUser]     = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    } catch { setUser(null); }
    setMenuOpen(false);
  }, [location]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const firstName = user?.name?.split(" ")[0] || "";

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-backdrop" />

      <div className="navbar-inner">

        <Link to="/" className="brand">
          <span className="brand-icon">✦</span>
          <span className="brand-text">Growth <em>with-in</em></span>
        </Link>

        <ul className="nav-links">
          {NAV_LINKS.map(({ label, path }) => {
            const active = location.pathname === path;
            return (
              <li key={path}>
                <Link to={path} className={`nav-link${active ? ' active' : ''}`}>
                  {label}
                  {active && <span className="active-pip" />}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="nav-right">
          {/* ── Theme switcher ── */}
          <div className="theme-switcher">
            {THEMES.map(t => (
              <button
                key={t.id}
                className={`theme-btn${theme === t.id ? ' active' : ''}`}
                onClick={() => setTheme(t.id)}
                title={t.label}
              >
                {t.icon}
              </button>
            ))}
          </div>

          {}

          {user && (
            <div className="nav-user">
              {/* <span className="nav-user-name">👋 {firstName}</span> */}
              <button className="nav-logout-btn" onClick={logout}>Log out</button>
            </div>
          )}
        </div>

        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map(({ label, path }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} className={`mobile-link${active ? ' active' : ''}`}>
              {label}
            </Link>
          );
        })}
        {}

        {/* Mobile theme row */}
        <div className="mobile-theme-row">
          <span className="mobile-theme-label">Theme</span>
          <div className="theme-switcher">
            {THEMES.map(t => (
              <button key={t.id}
                className={`theme-btn${theme === t.id ? ' active' : ''}`}
                onClick={() => setTheme(t.id)}
              >{t.icon}</button>
            ))}
          </div>
        </div>

        {user && (
          <button className="mobile-logout" onClick={logout}>
            Log out ({user.name})
          </button>
        )}
      </div>
    </nav>
  );
}