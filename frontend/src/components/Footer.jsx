import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/footer.css';

const LINKS = [
   { label: 'Planner',      path: '/planner' },
  { label: 'Goals',        path: '/goals' },
  { label: 'Vision Board', path: '/Visionpage' },
  { label: 'Habits',       path: '/habits' },
  { label: 'To-Do List',   path: '/todolist' },
];

const QUOTES = [
  "Small steps every day.",
  "Grow through what you go through.",
  "Your only limit is you.",
  "Progress, not perfection.",
];

const quote = QUOTES[new Date().getDay() % QUOTES.length];

export default function Footer() {
  return (
    <footer className="footer">
      {/* Top wave divider */}
      <div className="footer-wave">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
            fill="rgba(131,56,236,0.06)"
          />
        </svg>
      </div>

      <div className="footer-inner">

        {/* Brand block */}
        <div className="footer-brand">
          <span className="footer-brand-icon">✦</span>
          <span className="footer-brand-name">
            Growth <em>with-in</em>
          </span>
          <p className="footer-quote">"{quote}"</p>
        </div>

        {/* Nav links */}
        <div className="footer-links">
          <p className="footer-links-title">Pages</p>
          <ul>
            {LINKS.map(({ label, path }) => (
              <li key={path}>
                <Link to={path} className="footer-link">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Tagline block */}
        <div className="footer-tagline">
          <p className="footer-tagline-text">
            Built to help you become<br />the best version of yourself.
          </p>
          <div className="footer-dots">
            <span style={{ background: '#ffbe0b' }} />
            <span style={{ background: '#fb5607' }} />
            <span style={{ background: '#ff006e' }} />
            <span style={{ background: '#8338ec' }} />
            <span style={{ background: '#3a86ff' }} />
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Growth with-in. All rights reserved.</span>
        <span className="footer-heart">Made with ✦ for growth</span>
      </div>
    </footer>
  );
}