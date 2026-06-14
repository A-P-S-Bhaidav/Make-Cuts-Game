import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './GameSetup.css';

/**
 * Game setup page where players configure grid size, names, and game mode.
 */
export default function GameSetup({ onStartGame }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [mode, setMode] = useState('local');
  const [roomCode, setRoomCode] = useState('');

  const MIN_SIZE = 2;
  const MAX_SIZE = 8;

  const adjustSize = (setter, current, delta) => {
    const next = current + delta;
    if (next >= MIN_SIZE && next <= MAX_SIZE) setter(next);
  };

  const handleStart = useCallback(() => {
    const config = {
      rows,
      cols,
      player1Name: player1Name.trim() || 'Player 1',
      player2Name: player2Name.trim() || 'Player 2',
      mode,
      roomCode: mode === 'join' ? roomCode.trim() : null,
    };
    onStartGame(config);
    navigate('/game');
  }, [rows, cols, player1Name, player2Name, mode, roomCode, onStartGame, navigate]);

  const canStart = mode === 'local' || mode === 'create' || (mode === 'join' && roomCode.trim().length >= 4);

  return (
    <div className="game-setup page">
      <div className="bg-grid-pattern" aria-hidden="true"></div>

      <div className="setup-card">
        <h1 className="setup-title">New Game</h1>
        <p className="setup-subtitle">Configure your game settings below</p>

        {/* Grid Size */}
        <div className="setup-section">
          <h2 className="setup-section-title">Grid Size</h2>
          <div className="setup-grid-size">
            <div className="setup-grid-size-input">
              <label className="input-label" htmlFor="rows-display">Rows</label>
              <span className="setup-grid-size-value" id="rows-display">{rows}</span>
              <div className="setup-grid-size-controls">
                <button
                  className="setup-grid-btn"
                  onClick={() => adjustSize(setRows, rows, -1)}
                  disabled={rows <= MIN_SIZE}
                  aria-label="Decrease rows"
                >
                  -
                </button>
                <button
                  className="setup-grid-btn"
                  onClick={() => adjustSize(setRows, rows, 1)}
                  disabled={rows >= MAX_SIZE}
                  aria-label="Increase rows"
                >
                  +
                </button>
              </div>
            </div>

            <span className="setup-grid-x" aria-hidden="true">x</span>

            <div className="setup-grid-size-input">
              <label className="input-label" htmlFor="cols-display">Columns</label>
              <span className="setup-grid-size-value" id="cols-display">{cols}</span>
              <div className="setup-grid-size-controls">
                <button
                  className="setup-grid-btn"
                  onClick={() => adjustSize(setCols, cols, -1)}
                  disabled={cols <= MIN_SIZE}
                  aria-label="Decrease columns"
                >
                  -
                </button>
                <button
                  className="setup-grid-btn"
                  onClick={() => adjustSize(setCols, cols, 1)}
                  disabled={cols >= MAX_SIZE}
                  aria-label="Increase columns"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Mini grid preview */}
          <div className="setup-grid-preview" aria-hidden="true">
            <div
              className="setup-preview-grid"
              style={{
                gridTemplateColumns: `repeat(${cols}, 20px)`,
                gridTemplateRows: `repeat(${rows}, 20px)`,
              }}
            >
              {Array.from({ length: rows * cols }, (_, i) => (
                <div key={i} className="setup-preview-cell" />
              ))}
            </div>
          </div>
        </div>

        {/* Player Names */}
        <div className="setup-section">
          <h2 className="setup-section-title">Players</h2>
          <div className="setup-row">
            <div className="setup-field">
              <label className="input-label" htmlFor="player1-name">
                Player 1 <span className="text-gold">(Gold)</span>
              </label>
              <input
                id="player1-name"
                className="input-field"
                type="text"
                placeholder="Player 1"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                maxLength={20}
              />
            </div>
            <div className="setup-field">
              <label className="input-label" htmlFor="player2-name">
                Player 2 <span className="text-cyan">(Cyan)</span>
              </label>
              <input
                id="player2-name"
                className="input-field"
                type="text"
                placeholder="Player 2"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                maxLength={20}
                disabled={mode === 'join'}
              />
            </div>
          </div>
        </div>

        {/* Game Mode */}
        <div className="setup-section">
          <h2 className="setup-section-title">Game Mode</h2>
          <div className="setup-mode-toggle">
            <button
              className={`setup-mode-option ${mode === 'local' ? 'active' : ''}`}
              onClick={() => setMode('local')}
            >
              Local
            </button>
            <button
              className={`setup-mode-option ${mode === 'create' ? 'active' : ''}`}
              onClick={() => setMode('create')}
            >
              Create Room
            </button>
            <button
              className={`setup-mode-option ${mode === 'join' ? 'active' : ''}`}
              onClick={() => setMode('join')}
            >
              Join Room
            </button>
          </div>

          {mode === 'join' && (
            <div className="setup-online-section">
              <label className="input-label" htmlFor="room-code-input">Room Code</label>
              <input
                id="room-code-input"
                className="input-field"
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', textAlign: 'center' }}
              />
            </div>
          )}
        </div>

        <button
          className="btn btn-primary btn-lg setup-start-btn"
          onClick={handleStart}
          disabled={!canStart}
          id="start-game-btn"
        >
          {mode === 'create' ? 'Create Room' : mode === 'join' ? 'Join Game' : 'Start Game'}
        </button>
      </div>
    </div>
  );
}
