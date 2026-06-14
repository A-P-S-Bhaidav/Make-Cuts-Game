/**
 * Game Logic Engine for Make Cuts Game
 * 
 * Pure functions for managing game state, detecting regions,
 * validating cuts, and determining game outcomes.
 * 
 * Grid coordinate system:
 *   - Cells are addressed as (row, col) where 0 <= row < rows, 0 <= col < cols
 *   - Horizontal edges sit between row r and r+1 at column c: "h-{r}-{c}"
 *   - Vertical edges sit between col c and c+1 at row r: "v-{r}-{c}"
 */

// ---------------------------------------------------------------------------
// Edge ID helpers
// ---------------------------------------------------------------------------

/**
 * Create a horizontal edge ID between cell (r, c) and (r+1, c).
 */
export function hEdgeId(r, c) {
  return `h-${r}-${c}`;
}

/**
 * Create a vertical edge ID between cell (r, c) and (r, c+1).
 */
export function vEdgeId(r, c) {
  return `v-${r}-${c}`;
}

/**
 * Parse an edge ID into its components.
 * Returns { type: 'h'|'v', row: number, col: number }
 */
export function parseEdgeId(edgeId) {
  const parts = edgeId.split('-');
  return {
    type: parts[0],
    row: parseInt(parts[1], 10),
    col: parseInt(parts[2], 10),
  };
}

// ---------------------------------------------------------------------------
// Cell ID helpers
// ---------------------------------------------------------------------------

export function cellId(r, c) {
  return `${r}-${c}`;
}

export function parseCell(id) {
  const [r, c] = id.split('-').map(Number);
  return { row: r, col: c };
}

// ---------------------------------------------------------------------------
// State creation
// ---------------------------------------------------------------------------

/**
 * Create the initial game state.
 * 
 * @param {number} rows - Number of rows (N)
 * @param {number} cols - Number of columns (M)
 * @param {string[]} preCuts - Array of edge IDs that are pre-cut
 * @param {string} player1Name - Name of player 1
 * @param {string} player2Name - Name of player 2
 * @returns {object} Initial game state
 */
export function createGameState(rows, cols, preCuts = [], player1Name = 'Player 1', player2Name = 'Player 2') {
  const cutEdges = new Set(preCuts);

  const state = {
    rows,
    cols,
    cutEdges,
    currentPlayer: 1,
    players: {
      1: { name: player1Name, moves: 0 },
      2: { name: player2Name, moves: 0 },
    },
    moveHistory: [],
    moveCount: 0,
    gameOver: false,
    winner: null,
    startTime: Date.now(),
  };

  return state;
}

// ---------------------------------------------------------------------------
// Region detection via BFS
// ---------------------------------------------------------------------------

/**
 * Find all connected regions in the current grid state.
 * A region is a set of cells connected through uncut edges.
 * 
 * @param {object} state - Current game state
 * @returns {Array<Set<string>>} Array of regions, each a Set of cell IDs
 */
export function getRegions(state) {
  const { rows, cols, cutEdges } = state;
  const visited = new Set();
  const regions = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = cellId(r, c);
      if (visited.has(id)) continue;

      const region = new Set();
      const queue = [{ row: r, col: c }];

      while (queue.length > 0) {
        const { row, col } = queue.shift();
        const cid = cellId(row, col);
        if (visited.has(cid)) continue;
        visited.add(cid);
        region.add(cid);

        // Check all 4 neighbors
        // Up: cell (row-1, col) connected via horizontal edge h-(row-1)-col
        if (row > 0 && !cutEdges.has(hEdgeId(row - 1, col))) {
          const nid = cellId(row - 1, col);
          if (!visited.has(nid)) queue.push({ row: row - 1, col });
        }
        // Down: cell (row+1, col) connected via horizontal edge h-row-col
        if (row < rows - 1 && !cutEdges.has(hEdgeId(row, col))) {
          const nid = cellId(row + 1, col);
          if (!visited.has(nid)) queue.push({ row: row + 1, col });
        }
        // Left: cell (row, col-1) connected via vertical edge v-row-(col-1)
        if (col > 0 && !cutEdges.has(vEdgeId(row, col - 1))) {
          const nid = cellId(row, col - 1);
          if (!visited.has(nid)) queue.push({ row, col: col - 1 });
        }
        // Right: cell (row, col+1) connected via vertical edge v-row-col
        if (col < cols - 1 && !cutEdges.has(vEdgeId(row, col))) {
          const nid = cellId(row, col + 1);
          if (!visited.has(nid)) queue.push({ row, col: col + 1 });
        }
      }

      regions.push(region);
    }
  }

  return regions;
}

/**
 * Get the bounding box of a region.
 */
export function getRegionBounds(region) {
  let minRow = Infinity, maxRow = -1, minCol = Infinity, maxCol = -1;

  for (const cid of region) {
    const { row, col } = parseCell(cid);
    minRow = Math.min(minRow, row);
    maxRow = Math.max(maxRow, row);
    minCol = Math.min(minCol, col);
    maxCol = Math.max(maxCol, col);
  }

  return { minRow, maxRow, minCol, maxCol };
}

/**
 * Find which region a cell belongs to.
 */
export function findRegionOfCell(regions, row, col) {
  const cid = cellId(row, col);
  return regions.find(region => region.has(cid)) || null;
}

// ---------------------------------------------------------------------------
// Cut validation and extension
// ---------------------------------------------------------------------------

/**
 * Given a clicked edge, compute the full set of edges that would be cut.
 * The cut extends along the grid line within the region containing
 * the cells adjacent to the clicked edge.
 * 
 * @param {object} state - Current game state
 * @param {string} edgeId - The clicked edge ID
 * @param {Array<Set<string>>} regions - Pre-computed regions (optional)
 * @returns {object|null} { edgesToCut: string[], region: Set, splitValid: boolean }
 */
export function computeCut(state, edgeId, regions = null) {
  const { rows, cols, cutEdges } = state;
  const { type, row, col } = parseEdgeId(edgeId);

  // Edge must be internal and not already cut
  if (cutEdges.has(edgeId)) return null;

  if (!regions) regions = getRegions(state);

  if (type === 'h') {
    // Horizontal edge between (row, col) and (row+1, col)
    if (row < 0 || row >= rows - 1 || col < 0 || col >= cols) return null;

    const cellAbove = cellId(row, col);
    const cellBelow = cellId(row + 1, col);

    // Find the region containing both cells
    const region = findRegionOfCell(regions, row, col);
    if (!region || !region.has(cellBelow)) return null;

    // Get region bounds
    const bounds = getRegionBounds(region);

    // Extend the horizontal cut across the full width of the region at this row
    const edgesToCut = [];
    for (let c = bounds.minCol; c <= bounds.maxCol; c++) {
      const eid = hEdgeId(row, c);
      if (region.has(cellId(row, c)) && region.has(cellId(row + 1, c))) {
        edgesToCut.push(eid);
      }
    }

    return { edgesToCut, region, splitValid: edgesToCut.length > 0 };
  } else {
    // Vertical edge between (row, col) and (row, col+1)
    if (row < 0 || row >= rows || col < 0 || col >= cols - 1) return null;

    const cellLeft = cellId(row, col);
    const cellRight = cellId(row, col + 1);

    const region = findRegionOfCell(regions, row, col);
    if (!region || !region.has(cellRight)) return null;

    const bounds = getRegionBounds(region);

    // Extend the vertical cut across the full height of the region at this col
    const edgesToCut = [];
    for (let r = bounds.minRow; r <= bounds.maxRow; r++) {
      const eid = vEdgeId(r, col);
      if (region.has(cellId(r, col)) && region.has(cellId(r, col + 1))) {
        edgesToCut.push(eid);
      }
    }

    return { edgesToCut, region, splitValid: edgesToCut.length > 0 };
  }
}

/**
 * Check if a specific edge click would result in a valid cut.
 */
export function isValidCut(state, edgeId) {
  const result = computeCut(state, edgeId);
  return result !== null && result.splitValid;
}

/**
 * Get all edges that are valid to cut.
 */
export function getValidCuts(state) {
  const { rows, cols, cutEdges } = state;
  const regions = getRegions(state);
  const validEdges = [];

  // Check all horizontal edges
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) {
      const eid = hEdgeId(r, c);
      if (!cutEdges.has(eid)) {
        const result = computeCut(state, eid, regions);
        if (result && result.splitValid) {
          validEdges.push(eid);
        }
      }
    }
  }

  // Check all vertical edges
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const eid = vEdgeId(r, c);
      if (!cutEdges.has(eid)) {
        const result = computeCut(state, eid, regions);
        if (result && result.splitValid) {
          validEdges.push(eid);
        }
      }
    }
  }

  return validEdges;
}

// ---------------------------------------------------------------------------
// Making a cut
// ---------------------------------------------------------------------------

/**
 * Execute a cut and return the new state.
 * 
 * @param {object} state - Current game state
 * @param {string} edgeId - The edge to cut
 * @returns {object|null} New state, or null if the cut is invalid
 */
export function makeCut(state, edgeId) {
  const regions = getRegions(state);
  const cutResult = computeCut(state, edgeId, regions);

  if (!cutResult || !cutResult.splitValid) return null;

  const newCutEdges = new Set(state.cutEdges);
  for (const eid of cutResult.edgesToCut) {
    newCutEdges.add(eid);
  }

  const { type, row, col } = parseEdgeId(edgeId);
  const moveEntry = {
    player: state.currentPlayer,
    playerName: state.players[state.currentPlayer].name,
    edgeId,
    edgesCut: cutResult.edgesToCut,
    type: type === 'h' ? 'horizontal' : 'vertical',
    position: type === 'h' ? `Row ${row + 1}` : `Col ${col + 1}`,
    moveNumber: state.moveCount + 1,
    timestamp: Date.now(),
  };

  const newPlayers = {
    1: { ...state.players[1] },
    2: { ...state.players[2] },
  };
  newPlayers[state.currentPlayer].moves += 1;

  const newState = {
    ...state,
    cutEdges: newCutEdges,
    currentPlayer: state.currentPlayer === 1 ? 2 : 1,
    moveHistory: [...state.moveHistory, moveEntry],
    moveCount: state.moveCount + 1,
    players: newPlayers,
  };

  // Check game over
  const newRegions = getRegions(newState);
  if (isGameOver(newState, newRegions)) {
    newState.gameOver = true;
    // The player who just moved wins (they made the last valid cut)
    newState.winner = state.currentPlayer;
  }

  return newState;
}

// ---------------------------------------------------------------------------
// Game over detection
// ---------------------------------------------------------------------------

/**
 * Check if the game is over (all regions are 1x1).
 */
export function isGameOver(state, regions = null) {
  if (!regions) regions = getRegions(state);
  return regions.every(region => region.size === 1);
}

/**
 * Alternative: check if there are any valid cuts remaining.
 */
export function hasValidMoves(state) {
  return getValidCuts(state).length > 0;
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

/**
 * Get all internal edges for a grid.
 */
export function getAllInternalEdges(rows, cols) {
  const edges = [];

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) {
      edges.push({ id: hEdgeId(r, c), type: 'h', row: r, col: c });
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      edges.push({ id: vEdgeId(r, c), type: 'v', row: r, col: c });
    }
  }

  return edges;
}

/**
 * Calculate total possible moves for a grid (M*N - 1 for a single region).
 */
export function totalMovesForGrid(rows, cols, preCutsCount = 0) {
  const totalCells = rows * cols;
  return totalCells - 1 - preCutsCount;
}

/**
 * Serialize game state for network transmission.
 */
export function serializeState(state) {
  return {
    ...state,
    cutEdges: Array.from(state.cutEdges),
  };
}

/**
 * Deserialize game state from network transmission.
 */
export function deserializeState(data) {
  return {
    ...data,
    cutEdges: new Set(data.cutEdges),
  };
}
