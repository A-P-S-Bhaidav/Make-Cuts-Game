// ----------------------------------------------------------------------------
// roomStore.js
// In-memory store for game rooms with automatic cleanup of stale entries.
// ----------------------------------------------------------------------------

// How long (in ms) a room can sit idle before it is eligible for cleanup.
const ROOM_TTL_MS = 30 * 60 * 1000; // 30 minutes

// How often (in ms) the cleanup sweep runs.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

class RoomStore {
  constructor() {
    // Map<roomCode, roomData>
    this._rooms = new Map();

    // Start the periodic cleanup timer.
    this._cleanupTimer = setInterval(() => this._sweep(), CLEANUP_INTERVAL_MS);

    // Allow the process to exit even if the timer is still active.
    if (this._cleanupTimer.unref) {
      this._cleanupTimer.unref();
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Create a new room entry.
   * @param {string} roomCode  - Unique 6-character room code.
   * @param {object} roomData  - Initial room data (config, players, state, etc.).
   */
  create(roomCode, roomData) {
    this._rooms.set(roomCode, {
      ...roomData,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    });
  }

  /**
   * Retrieve a room by its code.
   * @param {string} roomCode
   * @returns {object|undefined}
   */
  get(roomCode) {
    return this._rooms.get(roomCode);
  }

  /**
   * Check whether a room exists.
   * @param {string} roomCode
   * @returns {boolean}
   */
  has(roomCode) {
    return this._rooms.has(roomCode);
  }

  /**
   * Update fields on an existing room (shallow merge).
   * Also refreshes the lastActivity timestamp.
   * @param {string} roomCode
   * @param {object} updates
   */
  update(roomCode, updates) {
    const room = this._rooms.get(roomCode);
    if (!room) return;
    Object.assign(room, updates, { lastActivity: Date.now() });
  }

  /**
   * Delete a room immediately.
   * @param {string} roomCode
   */
  delete(roomCode) {
    this._rooms.delete(roomCode);
  }

  /**
   * Return the total number of active rooms (useful for the health endpoint).
   * @returns {number}
   */
  size() {
    return this._rooms.size;
  }

  // ---------------------------------------------------------------------------
  // Reverse lookup helpers
  // ---------------------------------------------------------------------------

  /**
   * Find the room code that a given socket ID belongs to.
   * @param {string} socketId
   * @returns {string|null}
   */
  findBySocketId(socketId) {
    for (const [code, room] of this._rooms) {
      if (
        room.players &&
        room.players.some((p) => p && p.socketId === socketId)
      ) {
        return code;
      }
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Internal cleanup
  // ---------------------------------------------------------------------------

  /**
   * Remove rooms that have been idle longer than ROOM_TTL_MS.
   */
  _sweep() {
    const now = Date.now();
    for (const [code, room] of this._rooms) {
      if (now - room.lastActivity > ROOM_TTL_MS) {
        console.log(`[RoomStore] Cleaning up stale room: ${code}`);
        this._rooms.delete(code);
      }
    }
  }
}

// Export a singleton instance so every module shares the same store.
const roomStore = new RoomStore();
export default roomStore;
