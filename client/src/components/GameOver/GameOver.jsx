import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import './GameOver.css';

/**
 * Game over modal overlay with winner announcement,
 * statistics summary, and CSS-only confetti animation.
 */
export default function GameOver({ gameState, onPlayAgain, onNewGame }) {
  const { winner, players, moveCount, rows, cols, startTime } = gameState;

  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const winnerName = winner ? players[winner].name : 'Nobody';
  const winnerClass = winner ? `game-over-winner-name--p${winner}` : '';

  // Generate confetti particles
  const confetti = useMemo(() => {
    const particles = [];
    const colors = [
      'hsl(38, 92%, 55%)',   // Gold
      'hsl(200, 85%, 55%)',  // Cyan
      'hsl(145, 65%, 48%)',  // Green
      'hsl(280, 60%, 55%)',  // Purple
      'hsl(350, 80%, 55%)',  // Pink
      'hsl(60, 80%, 55%)',   // Yellow
    ];

    for (let i = 0; i < 30; i++) {
      const left = Math.random() * 100;
      const delay = Math.random() * 1.5;
      const duration = 2 + Math.random() * 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 4 + Math.random() * 8;
      const rotation = Math.random() * 360;

      particles.push(
        <div
          key={i}
          className="confetti-particle"
          style={{
            left: `${left}%`,
            top: '-10px',
            width: `${size}px`,
            height: `${size / 2}px`,
            backgroundColor: color,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            transform: `rotate(${rotation}deg)`,
          }}
          aria-hidden="true"
        />
      );
    }
    return particles;
  }, []);

  return (
    <div className="game-over-overlay" role="dialog" aria-modal="true" aria-labelledby="game-over-title">
      <div className="game-over-card">
        <div className="confetti-container" aria-hidden="true">
          {confetti}
        </div>

        <span className="game-over-badge">Game Complete</span>

        <h2 id="game-over-title" className="game-over-title">
          <span className={`game-over-winner-name ${winnerClass}`}>
            {winnerName}
          </span>
          Wins
        </h2>

        <p className="game-over-subtitle">
          Made the final cut after {moveCount} total moves
        </p>

        <div className="game-over-stats">
          <div className="game-over-stat">
            <span className="game-over-stat-value">{moveCount}</span>
            <span className="game-over-stat-label">Total Cuts</span>
          </div>
          <div className="game-over-stat">
            <span className="game-over-stat-value">{players[1].moves}</span>
            <span className="game-over-stat-label">{players[1].name}</span>
          </div>
          <div className="game-over-stat">
            <span className="game-over-stat-value">{players[2].moves}</span>
            <span className="game-over-stat-label">{players[2].name}</span>
          </div>
          <div className="game-over-stat">
            <span className="game-over-stat-value">{timeStr}</span>
            <span className="game-over-stat-label">Duration</span>
          </div>
        </div>

        <div className="game-over-actions">
          <button className="btn btn-primary" onClick={onPlayAgain}>
            Play Again
          </button>
          <Link to="/play" className="btn btn-secondary" onClick={onNewGame}>
            New Setup
          </Link>
        </div>
      </div>
    </div>
  );
}
