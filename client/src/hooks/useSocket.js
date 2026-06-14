import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { deserializeState } from '../utils/gameLogic';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

/**
 * Custom hook for Socket.io multiplayer connectivity.
 */
export function useSocket(enabled = false) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [playerNumber, setPlayerNumber] = useState(null);
  const [opponentName, setOpponentName] = useState(null);
  const [error, setError] = useState(null);
  const [waiting, setWaiting] = useState(false);

  const callbacksRef = useRef({});

  useEffect(() => {
    if (!enabled) return;

    const socket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', () => {
      setError('Unable to connect to game server');
      setConnected(false);
    });

    socket.on('room-created', (data) => {
      setRoomCode(data.roomCode);
      setPlayerNumber(1);
      setWaiting(true);
    });

    socket.on('room-joined', (data) => {
      setWaiting(false);
      setPlayerNumber(data.playerNumber || 2);
      setOpponentName(data.opponentName);
      if (callbacksRef.current.onGameStart) {
        callbacksRef.current.onGameStart(data);
      }
    });

    socket.on('room-error', (data) => {
      setError(data.message || 'Room error');
    });

    socket.on('move-made', (data) => {
      if (callbacksRef.current.onMoveMade) {
        callbacksRef.current.onMoveMade(data);
      }
    });

    socket.on('game-ended', (data) => {
      if (callbacksRef.current.onGameEnded) {
        callbacksRef.current.onGameEnded(data);
      }
    });

    socket.on('player-left', () => {
      setError('Opponent disconnected');
      setWaiting(false);
      if (callbacksRef.current.onOpponentLeft) {
        callbacksRef.current.onOpponentLeft();
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled]);

  const createRoom = useCallback((config) => {
    if (socketRef.current) {
      setError(null);
      socketRef.current.emit('create-room', config);
    }
  }, []);

  const joinRoom = useCallback((code, playerName) => {
    if (socketRef.current) {
      setError(null);
      socketRef.current.emit('join-room', { roomCode: code, playerName });
    }
  }, []);

  const sendMove = useCallback((moveData) => {
    if (socketRef.current) {
      socketRef.current.emit('make-move', { roomCode, ...moveData });
    }
  }, [roomCode]);

  const sendGameOver = useCallback((winner) => {
    if (socketRef.current) {
      socketRef.current.emit('game-over', { roomCode, winner });
    }
  }, [roomCode]);

  const registerCallbacks = useCallback((callbacks) => {
    callbacksRef.current = { ...callbacksRef.current, ...callbacks };
  }, []);

  return {
    connected,
    roomCode,
    playerNumber,
    opponentName,
    error,
    waiting,
    createRoom,
    joinRoom,
    sendMove,
    sendGameOver,
    registerCallbacks,
  };
}
