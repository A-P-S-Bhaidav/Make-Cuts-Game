// ----------------------------------------------------------------------------
// index.js
// Express + Socket.io server entry point for the Make Cuts Game.
// ----------------------------------------------------------------------------

import "dotenv/config";
import express from "express";
import http from "node:http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";

import { registerGameEvents } from "./gameManager.js";
import roomStore from "./roomStore.js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// ---------------------------------------------------------------------------
// Express app setup
// ---------------------------------------------------------------------------

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// Health-check endpoint -- useful for monitoring and smoke tests.
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    activeRooms: roomStore.size(),
  });
});

// ---------------------------------------------------------------------------
// HTTP + Socket.io server
// ---------------------------------------------------------------------------

const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// ---------------------------------------------------------------------------
// Socket.io connection handler
// ---------------------------------------------------------------------------

io.on("connection", (socket) => {
  console.log(`[Server] Client connected: ${socket.id}`);

  // Register all game-related events for this socket.
  registerGameEvents(io, socket);
});

// ---------------------------------------------------------------------------
// Start listening
// ---------------------------------------------------------------------------

httpServer.listen(PORT, () => {
  console.log(`[Server] Make Cuts Game server running on port ${PORT}`);
  console.log(`[Server] Accepting connections from ${CLIENT_ORIGIN}`);
});
