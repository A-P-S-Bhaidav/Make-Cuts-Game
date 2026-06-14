import { Link } from 'react-router-dom';
import Board from '../Board/Board';
import GameInfo from '../GameInfo/GameInfo';
import GameOver from '../GameOver/GameOver';
import './Game.css';
import '../Board/Board.css';

/**
 * Main game page that combines the Board and GameInfo panel.
 * Handles the empty state when no game is active.
 */
export default function Game({
  gameState,
  regionColorMap,
  validCuts,
  cutAnimation,
  onCutAttempt,
  getCutPreview,
  onReset,
}) {
  // Empty state: no active game
  if (!gameState) {
    return (
      <div className="game-page-empty page">
        <div className="bg-grid-pattern" aria-hidden="true"></div>
        <div className="game-page-empty-icon" aria-hidden="true">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" />
            <line x1="4" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
            <line x1="20" y1="4" x2="20" y2="36" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
          </svg>
        </div>
        <h2>No Active Game</h2>
        <p>Set up a new game to start playing. Choose your grid size and invite a friend.</p>
        <Link to="/play" className="btn btn-primary btn-lg">
          Set Up Game
        </Link>
      </div>
    );
  }

  return (
    <div className="game-page page">
      <div className="bg-grid-pattern" aria-hidden="true"></div>

      <div className="game-layout">
        <Board
          gameState={gameState}
          regionColorMap={regionColorMap}
          validCuts={validCuts}
          cutAnimation={cutAnimation}
          onCutAttempt={onCutAttempt}
          getCutPreview={getCutPreview}
        />
        <GameInfo
          gameState={gameState}
          onReset={onReset}
        />
      </div>

      {gameState.gameOver && (
        <GameOver
          gameState={gameState}
          onPlayAgain={onReset}
        />
      )}
    </div>
  );
}
