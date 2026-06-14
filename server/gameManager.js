// ----------------------------------------------------------------------------
// gameManager.js
// Manages game rooms: creation, joining, move validation, state broadcast,
// and graceful disconnection handling.
// ----------------------------------------------------------------------------

import crypto from "node:crypto";
import roomStore from "./roomStore.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a random 6-character uppercase alphanumeric room code.
 * Keeps trying until the code is unique within the store.
 */
function generateRoomCode() {
  let code;
  do {
    code = crypto.randomBytes(3).toString("hex").toUpperCase();
  } while (roomStore.has(code));
  return code;
}

/**
 * Build the public game state object that gets sent to clients.
 */
function buildGameState(room) {
  return {
    roomCode: room.roomCode,
    rows: room.config.rows,
    cols: room.config.cols,
    preCuts: room.config.preCuts || [],
    cuts: room.cuts,
    currentPlayer: room.currentPlayer,
    players: room.players.map((p) =>
      p ? { id: p.playerIndex, name: p.name } : null
    ),
    status: room.status, // "waiting" | "playing" | "finished"
    winner: room.winner,
  };
}

// ---------------------------------------------------------------------------
// Socket event handlers
// ---------------------------------------------------------------------------

/**
 * Register all game-related Socket.io event handlers on a connection.
 * @param {import("socket.io").Server} io   - The Socket.io server instance.
 * @param {import("socket.io").Socket} socket - The newly connected socket.
 */
export function registerGameEvents(io, socket) {
  // -------------------------------------------------------------------------
  // create-room
  // -------------------------------------------------------------------------
  socket.on("create-room", (payload, callback) => {
    const { rows, cols, preCuts, playerName } = payload || {};

    // Basic validation.
    if (!rows || !cols || rows < 2 || cols < 2) {
      const errorMsg = "Invalid grid dimensions. Rows and cols must be >= 2.";
      if (typeof callback === "function") return callback({ error: errorMsg });
      return socket.emit("room-error", { message: errorMsg });
    }

    const roomCode = generateRoomCode();

    const room = {
      roomCode,
      config: {
        rows: Number(rows),
        cols: Number(cols),
        preCuts: Array.isArray(preCuts) ? preCuts : [],
      },
      players: [
        { socketId: socket.id, playerIndex: 0, name: playerName || "Player 1" },
        null, // slot reserved for player 2
      ],
      cuts: Array.isArray(preCuts) ? [...preCuts] : [],
      currentPlayer: 0,
      status: "waiting",
      winner: null,
    };

    roomStore.create(roomCode, room);

    // Join the Socket.io room so we can broadcast later.
    socket.join(roomCode);

    console.log(`[GameManager] Room created: ${roomCode} by ${socket.id}`);

    const response = { roomCode, gameState: buildGameState(roomStore.get(roomCode)) };
    if (typeof callback === "function") callback(response);
    socket.emit("room-created", response);
  });

  // -------------------------------------------------------------------------
  // join-room
  // -------------------------------------------------------------------------
  socket.on("join-room", (payload, callback) => {
    const { roomCode, playerName } = payload || {};

    if (!roomCode) {
      const errorMsg = "Room code is required.";
      if (typeof callback === "function") return callback({ error: errorMsg });
      return socket.emit("room-error", { message: errorMsg });
    }

    const code = roomCode.toUpperCase();
    const room = roomStore.get(code);

    if (!room) {
      const errorMsg = `Room ${code} does not exist.`;
      if (typeof callback === "function") return callback({ error: errorMsg });
      return socket.emit("room-error", { message: errorMsg });
    }

    if (room.status !== "waiting") {
      const errorMsg = "This room is no longer accepting players.";
      if (typeof callback === "function") return callback({ error: errorMsg });
      return socket.emit("room-error", { message: errorMsg });
    }

    if (room.players[1] !== null) {
      const errorMsg = "Room is already full.";
      if (typeof callback === "function") return callback({ error: errorMsg });
      return socket.emit("room-error", { message: errorMsg });
    }

    // Seat player 2.
    room.players[1] = {
      socketId: socket.id,
      playerIndex: 1,
      name: playerName || "Player 2",
    };
    room.status = "playing";
    roomStore.update(code, { players: room.players, status: room.status });

    socket.join(code);

    console.log(`[GameManager] Player ${socket.id} joined room ${code}`);

    const gameState = buildGameState(roomStore.get(code));
    if (typeof callback === "function") callback({ gameState });
    // Broadcast to everyone in the room (including the joiner).
    io.to(code).emit("room-joined", { gameState });
  });

  // -------------------------------------------------------------------------
  // make-move
  // -------------------------------------------------------------------------
  socket.on("make-move", (payload, callback) => {
    const { roomCode, cut } = payload || {};

    if (!roomCode || !cut) {
      const errorMsg = "roomCode and cut are required.";
      if (typeof callback === "function") return callback({ error: errorMsg });
      return socket.emit("room-error", { message: errorMsg });
    }

    const code = roomCode.toUpperCase();
    const room = roomStore.get(code);

    if (!room) {
      const errorMsg = `Room ${code} does not exist.`;
      if (typeof callback === "function") return callback({ error: errorMsg });
      return socket.emit("room-error", { message: errorMsg });
    }

    if (room.status !== "playing") {
      const errorMsg = "Game is not in progress.";
      if (typeof callback === "function") return callback({ error: errorMsg });
      return socket.emit("room-error", { message: errorMsg });
    }

    // Verify it is this player's turn.
    const playerIndex = room.players.findIndex(
      (p) => p && p.socketId === socket.id
    );
    if (playerIndex === -1) {
      const errorMsg = "You are not a player in this room.";
      if (typeof callback === "function") return callback({ error: errorMsg });
      return socket.emit("room-error", { message: errorMsg });
    }
    if (playerIndex !== room.currentPlayer) {
      const errorMsg = "It is not your turn.";
      if (typeof callback === "function") return callback({ error: errorMsg });
      return socket.emit("room-error", { message: errorMsg });
    }

    // Validate the cut is not a duplicate.
    const cutKey = serializeCut(cut);
    const isDuplicate = room.cuts.some((c) => serializeCut(c) === cutKey);
    if (isDuplicate) {
      const errorMsg = "This cut has already been made.";
      if (typeof callback === "function") return callback({ error: errorMsg });
      return socket.emit("room-error", { message: errorMsg });
    }

    // Validate the cut is within grid bounds.
    if (!isCutInBounds(cut, room.config.rows, room.config.cols)) {
      const errorMsg = "Cut is out of grid bounds.";
      if (typeof callback === "function") return callback({ error: errorMsg });
      return socket.emit("room-error", { message: errorMsg });
    }

    // Apply the cut.
    room.cuts.push(cut);
    room.currentPlayer = room.currentPlayer === 0 ? 1 : 0;
    roomStore.update(code, {
      cuts: room.cuts,
      currentPlayer: room.currentPlayer,
    });

    const gameState = buildGameState(roomStore.get(code));
    if (typeof callback === "function") callback({ gameState });
    io.to(code).emit("move-made", { gameState, lastCut: cut });
  });

  // -------------------------------------------------------------------------
  // game-over
  // -------------------------------------------------------------------------
  socket.on("game-over", (payload) => {
    const { roomCode, winner } = payload || {};
    if (!roomCode) return;

    const code = roomCode.toUpperCase();
    const room = roomStore.get(code);
    if (!room) return;

    room.status = "finished";
    room.winner = winner !== undefined ? winner : null;
    roomStore.update(code, { status: room.status, winner: room.winner });

    console.log(`[GameManager] Game over in room ${code}. Winner: ${room.winner}`);

    io.to(code).emit("game-ended", {
      winner: room.winner,
      gameState: buildGameState(roomStore.get(code)),
    });
  });

  // -------------------------------------------------------------------------
  // disconnect
  // -------------------------------------------------------------------------
  socket.on("disconnect", () => {
    const code = roomStore.findBySocketId(socket.id);
    if (!code) return;

    const room = roomStore.get(code);
    if (!room) return;

    const leavingIndex = room.players.findIndex(
      (p) => p && p.socketId === socket.id
    );

    console.log(
      `[GameManager] Player ${socket.id} disconnected from room ${code}`
    );

    // Notify the remaining player.
    io.to(code).emit("player-left", {
      playerIndex: leavingIndex,
      message: `Player ${leavingIndex + 1} has left the game.`,
    });

    // If the game was in progress, mark it finished.
    if (room.status === "playing") {
      const remainingIndex = leavingIndex === 0 ? 1 : 0;
      room.status = "finished";
      room.winner = remainingIndex;
      roomStore.update(code, { status: room.status, winner: room.winner });

      io.to(code).emit("game-ended", {
        winner: room.winner,
        gameState: buildGameState(roomStore.get(code)),
        reason: "opponent-disconnected",
      });
    }

    // Remove the player from the room.
    room.players[leavingIndex] = null;
    roomStore.update(code, { players: room.players });

    // If the room is now empty, delete it.
    if (room.players.every((p) => p === null)) {
      console.log(`[GameManager] Room ${code} is empty, deleting.`);
      roomStore.delete(code);
    }
  });
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Serialize a cut object into a deterministic string key for duplicate
 * detection. A cut is an edge between two adjacent grid intersections,
 * represented as { r1, c1, r2, c2 }.
 */
function serializeCut(cut) {
  // Normalize so the "smaller" point always comes first.
  const { r1, c1, r2, c2 } = cut;
  if (r1 < r2 || (r1 === r2 && c1 < c2)) {
    return `${r1},${c1}-${r2},${c2}`;
  }
  return `${r2},${c2}-${r1},${c1}`;
}

/**
 * Check that a cut's coordinates are within the grid boundaries.
 * Grid intersections range from (0,0) to (rows, cols).
 */
function isCutInBounds(cut, rows, cols) {
  const { r1, c1, r2, c2 } = cut;
  if (
    r1 < 0 || r1 > rows ||
    c1 < 0 || c1 > cols ||
    r2 < 0 || r2 > rows ||
    c2 < 0 || c2 > cols
  ) {
    return false;
  }

  // A valid cut connects two adjacent intersections (horizontally or
  // vertically), so the Manhattan distance must be exactly 1.
  const dist = Math.abs(r1 - r2) + Math.abs(c1 - c2);
  return dist === 1;
}
