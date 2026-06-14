import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getRegions } from '../../utils/gameLogic';
import './GameInfo.css';

/**
 * Game information side panel.
 * Displays player cards, game statistics, move history, and action buttons.
 */
export default function GameInfo({ gameState, onReset, onNewGame }) {
  const historyEndRef = useRef(null);

  const { players, currentPlayer, moveHistory, moveCount, gameOver, winner, rows, cols } = gameState;

  const regions = getRegions(gameState);
  const totalCells = rows * cols;
  const singleCells = regions.filter(r => r.size === 1).length;
  const totalPossibleMoves = totalCells - 1;

  // Auto-scroll move history
  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [moveHistory.length]);

  const elapsed = gameState.startTime
    ? Math.floor((Date.now() - gameState.startTime) / 1000)
    : 0;
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <aside className="game-info" aria-label="Game information">
      {/* Player 1 Card */}
      <div
        className={`player-card player-card--p1 ${currentPlayer === 1 && !gameOver ? 'player-card--active' : ''}`}
        aria-label={`${players[1].name} information`}
      >
        <div className="player-card-header">
          <span className="player-card-indicator" aria-hidden="true" />
          <span className="player-card-name">{players[1].name}</span>
          {winner === 1 && <span className="player-card-tag">Winner</span>}
        </div>
        <div className="player-card-stats">
          <div className="player-card-stat">
            <span className="player-card-stat-value">{players[1].moves}</span>
            <span className="player-card-stat-label">Cuts</span>
          </div>
        </div>
      </div>

      {/* Player 2 Card */}
      <div
        className={`player-card player-card--p2 ${currentPlayer === 2 && !gameOver ? 'player-card--active' : ''}`}
        aria-label={`${players[2].name} information`}
      >
        <div className="player-card-header">
          <span className="player-card-indicator" aria-hidden="true" />
          <span className="player-card-name">{players[2].name}</span>
          {winner === 2 && <span className="player-card-tag">Winner</span>}
        </div>
        <div className="player-card-stats">
          <div className="player-card-stat">
            <span className="player-card-stat-value">{players[2].moves}</span>
            <span className="player-card-stat-label">Cuts</span>
          </div>
        </div>
      </div>

      {/* Game Stats */}
      <div className="game-stats">
        <h2 className="game-stats-title">Game Statistics</h2>
        <div className="game-stats-grid">
          <div className="game-stat-item">
            <span className="game-stat-value">{moveCount}</span>
            <span className="game-stat-label">Total Cuts</span>
          </div>
          <div className="game-stat-item">
            <span className="game-stat-value">{regions.length}</span>
            <span className="game-stat-label">Regions</span>
          </div>
          <div className="game-stat-item">
            <span className="game-stat-value">{rows}x{cols}</span>
            <span className="game-stat-label">Grid Size</span>
          </div>
          <div className="game-stat-item">
            <span className="game-stat-value">{singleCells}/{totalCells}</span>
            <span className="game-stat-label">Separated</span>
          </div>
        </div>
      </div>

      {/* Move History */}
      <div className="move-history">
        <h2 className="move-history-title">Move History</h2>
        <div className="move-history-list" role="log" aria-label="Move history">
          {moveHistory.length === 0 ? (
            <p className="move-history-empty">No moves yet</p>
          ) : (
            moveHistory.map((move, index) => (
              <div
                key={index}
                className={`move-entry move-entry--p${move.player}`}
              >
                <span className="move-entry-number">{move.moveNumber}.</span>
                <span className="move-entry-dot" aria-hidden="true" />
                <span className="move-entry-text">{move.playerName}</span>
                <span className="move-entry-type">{move.position}</span>
              </div>
            ))
          )}
          <div ref={historyEndRef} />
        </div>
      </div>

      {/* Actions */}
      <div className="game-actions">
        <button className="btn btn-secondary btn-sm" onClick={onReset}>
          Restart
        </button>
        <Link to="/play" className="btn btn-outline btn-sm">
          New Game
        </Link>
      </div>
    </aside>
  );
}
