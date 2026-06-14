import { useState, useCallback, useRef } from 'react';
import {
  createGameState,
  makeCut,
  getRegions,
  getValidCuts,
  isGameOver,
  isValidCut,
  computeCut,
} from '../utils/gameLogic';
import { assignRegionColors } from '../utils/regionColors';

/**
 * Custom hook for managing game state.
 * Encapsulates all game logic interactions for use by UI components.
 */
export function useGame() {
  const [gameState, setGameState] = useState(null);
  const [regions, setRegions] = useState([]);
  const [regionColorMap, setRegionColorMap] = useState(new Map());
  const [validCuts, setValidCuts] = useState([]);
  const [lastCut, setLastCut] = useState(null);
  const [cutAnimation, setCutAnimation] = useState(null);
  const animationTimeoutRef = useRef(null);

  /**
   * Initialize a new game.
   */
  const initGame = useCallback((rows, cols, player1Name, player2Name, preCuts = []) => {
    const state = createGameState(rows, cols, preCuts, player1Name, player2Name);
    const regs = getRegions(state);
    const colors = assignRegionColors(regs);
    const valid = getValidCuts(state);

    setGameState(state);
    setRegions(regs);
    setRegionColorMap(colors);
    setValidCuts(valid);
    setLastCut(null);
    setCutAnimation(null);
  }, []);

  /**
   * Attempt to make a cut at the given edge.
   * Returns true if the cut was successful.
   */
  const attemptCut = useCallback((edgeId) => {
    if (!gameState || gameState.gameOver) return false;

    if (!isValidCut(gameState, edgeId)) return false;

    // Compute cut details for animation
    const cutDetails = computeCut(gameState, edgeId);
    if (!cutDetails) return false;

    // Trigger cut animation
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setCutAnimation({
      edges: cutDetails.edgesToCut,
      player: gameState.currentPlayer,
      timestamp: Date.now(),
    });

    // Clear animation after duration
    animationTimeoutRef.current = setTimeout(() => {
      setCutAnimation(null);
    }, 600);

    // Apply the cut
    const newState = makeCut(gameState, edgeId);
    if (!newState) return false;

    const newRegions = getRegions(newState);
    const newColors = assignRegionColors(newRegions);
    const newValidCuts = newState.gameOver ? [] : getValidCuts(newState);

    setGameState(newState);
    setRegions(newRegions);
    setRegionColorMap(newColors);
    setValidCuts(newValidCuts);
    setLastCut({
      edgeId,
      edges: cutDetails.edgesToCut,
      player: gameState.currentPlayer,
    });

    return true;
  }, [gameState]);

  /**
   * Check if a specific edge is a valid cut target.
   */
  const checkValidCut = useCallback((edgeId) => {
    return validCuts.includes(edgeId);
  }, [validCuts]);

  /**
   * Get preview of which edges would be cut.
   */
  const getCutPreview = useCallback((edgeId) => {
    if (!gameState || gameState.gameOver) return null;
    const result = computeCut(gameState, edgeId);
    if (!result || !result.splitValid) return null;
    return result.edgesToCut;
  }, [gameState]);

  /**
   * Reset the current game with the same configuration.
   */
  const resetGame = useCallback(() => {
    if (!gameState) return;
    initGame(
      gameState.rows,
      gameState.cols,
      gameState.players[1].name,
      gameState.players[2].name
    );
  }, [gameState, initGame]);

  return {
    gameState,
    regions,
    regionColorMap,
    validCuts,
    lastCut,
    cutAnimation,
    initGame,
    attemptCut,
    checkValidCut,
    getCutPreview,
    resetGame,
    setGameState,
  };
}
