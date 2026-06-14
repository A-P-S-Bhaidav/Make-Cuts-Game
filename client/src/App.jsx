import { useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Hero from './components/Landing/Hero';
import GameSetup from './components/GameSetup/GameSetup';
import Game from './components/Game/Game';
import Rules from './components/Rules/Rules';
import { useGame } from './hooks/useGame';

/**
 * Root application component.
 * Manages routing and top-level game state via the useGame hook.
 */
export default function App() {
  const {
    gameState,
    regionColorMap,
    validCuts,
    cutAnimation,
    initGame,
    attemptCut,
    getCutPreview,
    resetGame,
  } = useGame();

  const handleStartGame = useCallback((config) => {
    initGame(
      config.rows,
      config.cols,
      config.player1Name,
      config.player2Name,
      []
    );
  }, [initGame]);

  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route
            path="/play"
            element={<GameSetup onStartGame={handleStartGame} />}
          />
          <Route
            path="/game"
            element={
              <Game
                gameState={gameState}
                regionColorMap={regionColorMap}
                validCuts={validCuts}
                cutAnimation={cutAnimation}
                onCutAttempt={attemptCut}
                getCutPreview={getCutPreview}
                onReset={resetGame}
              />
            }
          />
          <Route path="/rules" element={<Rules />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
