import { useState, useCallback, useMemo } from 'react';
import { hEdgeId, vEdgeId, cellId } from '../../utils/gameLogic';
import './Board.css';

/**
 * Interactive game board component.
 * Renders the grid of cells, clickable edges, and intersection dots.
 * Handles hover preview, cut animations, and input delegation.
 */
export default function Board({
  gameState,
  regionColorMap,
  validCuts,
  cutAnimation,
  onCutAttempt,
  getCutPreview,
}) {
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [previewEdges, setPreviewEdges] = useState([]);

  const { rows, cols, cutEdges, currentPlayer, gameOver } = gameState;

  // Responsive cell sizing
  const cellSize = useMemo(() => {
    const maxBoardWidth = Math.min(window.innerWidth - 120, 600);
    const maxBoardHeight = Math.min(window.innerHeight - 300, 500);
    const sizeFromWidth = Math.floor(maxBoardWidth / cols);
    const sizeFromHeight = Math.floor(maxBoardHeight / rows);
    return Math.max(40, Math.min(80, sizeFromWidth, sizeFromHeight));
  }, [rows, cols]);

  const validCutSet = useMemo(() => new Set(validCuts), [validCuts]);
  const animatingEdges = useMemo(() => {
    return cutAnimation ? new Set(cutAnimation.edges) : new Set();
  }, [cutAnimation]);

  const handleEdgeHover = useCallback((edgeId) => {
    if (gameOver) return;
    setHoveredEdge(edgeId);
    if (validCutSet.has(edgeId) && getCutPreview) {
      const preview = getCutPreview(edgeId);
      setPreviewEdges(preview || []);
    } else {
      setPreviewEdges([]);
    }
  }, [gameOver, validCutSet, getCutPreview]);

  const handleEdgeLeave = useCallback(() => {
    setHoveredEdge(null);
    setPreviewEdges([]);
  }, []);

  const handleEdgeClick = useCallback((edgeId) => {
    if (gameOver) return;
    if (onCutAttempt) {
      const success = onCutAttempt(edgeId);
      if (success) {
        setHoveredEdge(null);
        setPreviewEdges([]);
      }
    }
  }, [gameOver, onCutAttempt]);

  // Build edge class names
  const getEdgeClassName = (edgeId, type) => {
    const classes = ['board-edge', `board-edge--${type}`];

    if (cutEdges.has(edgeId)) {
      classes.push('board-edge--cut');
    } else if (animatingEdges.has(edgeId)) {
      classes.push('board-edge--animating');
    } else if (gameOver) {
      classes.push('board-edge--disabled');
    } else if (validCutSet.has(edgeId)) {
      classes.push('board-edge--valid');
      if (previewEdges.includes(edgeId) && hoveredEdge !== edgeId) {
        classes.push('board-edge--preview');
      }
    } else {
      classes.push('board-edge--invalid');
    }

    return classes.join(' ');
  };

  // Render horizontal edges (between rows)
  const horizontalEdges = [];
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) {
      const eid = hEdgeId(r, c);
      horizontalEdges.push(
        <div
          key={eid}
          className={getEdgeClassName(eid, 'horizontal')}
          style={{
            left: `${c * cellSize}px`,
            top: `${(r + 1) * cellSize}px`,
            width: `${cellSize}px`,
          }}
          onMouseEnter={() => handleEdgeHover(eid)}
          onMouseLeave={handleEdgeLeave}
          onClick={() => handleEdgeClick(eid)}
          role="button"
          tabIndex={validCutSet.has(eid) && !gameOver ? 0 : -1}
          aria-label={`Horizontal cut at row ${r + 1}, column ${c + 1}`}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleEdgeClick(eid); }}
        />
      );
    }
  }

  // Render vertical edges (between columns)
  const verticalEdges = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const eid = vEdgeId(r, c);
      verticalEdges.push(
        <div
          key={eid}
          className={getEdgeClassName(eid, 'vertical')}
          style={{
            left: `${(c + 1) * cellSize}px`,
            top: `${r * cellSize}px`,
            height: `${cellSize}px`,
          }}
          onMouseEnter={() => handleEdgeHover(eid)}
          onMouseLeave={handleEdgeLeave}
          onClick={() => handleEdgeClick(eid)}
          role="button"
          tabIndex={validCutSet.has(eid) && !gameOver ? 0 : -1}
          aria-label={`Vertical cut at row ${r + 1}, column ${c + 1}`}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleEdgeClick(eid); }}
        />
      );
    }
  }

  // Render grid intersection dots
  const dots = [];
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      // Skip border-only dots (corners) unless they're interior intersections
      if (r > 0 && r < rows && c > 0 && c < cols) {
        dots.push(
          <div
            key={`dot-${r}-${c}`}
            className="board-dot"
            style={{
              left: `${c * cellSize}px`,
              top: `${r * cellSize}px`,
            }}
            aria-hidden="true"
          />
        );
      }
    }
  }

  // Render cells
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cid = cellId(r, c);
      const colorInfo = regionColorMap.get(cid);
      cells.push(
        <div
          key={cid}
          className="board-cell"
          style={{
            gridRow: r + 1,
            gridColumn: c + 1,
            backgroundColor: colorInfo ? colorInfo.bg : 'var(--color-bg-secondary)',
            '--cell-size': `${cellSize}px`,
          }}
          aria-label={`Cell at row ${r + 1}, column ${c + 1}`}
        />
      );
    }
  }

  return (
    <div className="game-board-wrapper">
      <div className="board">
        {/* Turn indicator above board */}
        {!gameOver && (
          <div
            className={`board-turn-banner board-turn-banner--p${currentPlayer}`}
            aria-live="polite"
          >
            <span className="board-turn-dot" aria-hidden="true" />
            <span>{gameState.players[currentPlayer].name}'s Turn</span>
          </div>
        )}

        <div
          className="board-inner"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            width: `${cols * cellSize}px`,
            height: `${rows * cellSize}px`,
          }}
          role="grid"
          aria-label={`Game board: ${rows} rows by ${cols} columns`}
        >
          {cells}
          {horizontalEdges}
          {verticalEdges}
          {dots}
        </div>
      </div>
    </div>
  );
}
