import { Link, useLocation } from 'react-router-dom';
import './Header.css';

/**
 * Application header with navigation.
 * Uses glassmorphism for a premium look with sticky positioning.
 */
export default function Header() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <header className="header" role="banner">
      <Link to="/" className="header-logo" aria-label="Make Cuts Game - Home">
        <span className="header-logo-icon">
          <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="2" y="2" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
            <line x1="2" y1="14" x2="26" y2="14" stroke="var(--color-accent-gold)" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="14" y1="2" x2="14" y2="26" stroke="var(--color-accent-cyan)" strokeWidth="2" strokeDasharray="3 2" />
            <circle cx="14" cy="14" r="2" fill="var(--color-accent-gold)" />
          </svg>
        </span>
        <span className="header-logo-text">
          <span className="text-gradient">Make Cuts</span>
        </span>
      </Link>

      <nav className="header-nav" role="navigation" aria-label="Main navigation">
        <Link to="/" className={`header-nav-link ${isActive('/')}`}>
          Home
        </Link>
        <Link to="/play" className={`header-nav-link ${isActive('/play')}`}>
          Play
        </Link>
        <Link to="/rules" className={`header-nav-link ${isActive('/rules')}`}>
          Rules
        </Link>
      </nav>
    </header>
  );
}
