import { Link } from 'react-router-dom';
import './Hero.css';

/**
 * Landing page hero section.
 * Features animated title, descriptive subtitle, CTAs, and feature cards.
 */
export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      {/* Background grid decorations */}
      <div className="hero-grid-decoration hero-grid-decoration--left" aria-hidden="true">
        <svg className="hero-grid-svg" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-left" width="56" height="56" patternUnits="userSpaceOnUse">
              <rect width="56" height="56" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="280" height="280" fill="url(#grid-left)" stroke="currentColor" strokeWidth="1" rx="8" />
          <line x1="0" y1="140" x2="280" y2="140" stroke="var(--color-accent-gold)" strokeWidth="2" />
          <line x1="168" y1="0" x2="168" y2="280" stroke="var(--color-accent-cyan)" strokeWidth="2" />
        </svg>
      </div>

      <div className="hero-grid-decoration hero-grid-decoration--right" aria-hidden="true">
        <svg className="hero-grid-svg" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-right" width="56" height="56" patternUnits="userSpaceOnUse">
              <rect width="56" height="56" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="280" height="280" fill="url(#grid-right)" stroke="currentColor" strokeWidth="1" rx="8" />
          <line x1="0" y1="112" x2="280" y2="112" stroke="var(--color-accent-gold)" strokeWidth="2" />
          <line x1="112" y1="0" x2="112" y2="280" stroke="var(--color-accent-cyan)" strokeWidth="2" />
        </svg>
      </div>

      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" aria-hidden="true"></span>
          Two-Player Strategy Game
        </div>

        <h1 id="hero-title" className="hero-title">
          <span className="hero-title-line">Master the Art of</span>
          <span className="hero-title-line text-gradient">Paper Cutting</span>
        </h1>

        <p className="hero-subtitle">
          A strategic two-player game where you compete to make the final cut
          on a grid of paper. Divide, conquer, and outlast your opponent in
          this elegant game of combinatorial logic.
        </p>

        <div className="hero-actions">
          <Link to="/play" className="btn btn-primary btn-lg" id="cta-play">
            Start Playing
          </Link>
          <Link to="/rules" className="btn btn-outline btn-lg" id="cta-rules">
            How to Play
          </Link>
        </div>

        <div className="hero-features">
          <article className="hero-feature">
            <div className="hero-feature-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <h3 className="hero-feature-title">Grid-Based Strategy</h3>
            <p className="hero-feature-desc">
              Cut along grid lines to divide paper regions. Each cut must
              split at least one region into two separate parts.
            </p>
          </article>

          <article className="hero-feature">
            <div className="hero-feature-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="6" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="14" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
                <line x1="10" y1="7" x2="10" y2="13" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <h3 className="hero-feature-title">Two-Player Duel</h3>
            <p className="hero-feature-desc">
              Challenge a friend locally or create an online room.
              The last player to make a valid cut wins the game.
            </p>
          </article>

          <article className="hero-feature">
            <div className="hero-feature-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L12.5 7.5L18 8.5L14 12.5L15 18L10 15.5L5 18L6 12.5L2 8.5L7.5 7.5L10 2Z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="hero-feature-title">Elegant Design</h3>
            <p className="hero-feature-desc">
              Smooth animations, real-time visual feedback, and an
              intuitive interface bring the paper-cutting experience to life.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
