import type { Server as HttpServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { verifyAccessToken } from '../utils/jwt';

let io: SocketServer | null = null;

/**
 * Initialize the Socket.IO server. Clients authenticate with the same JWT
 * access token and join a private room keyed by their user id, so the API
 * can push notifications, live incidents, and handover events to them.
 */
export function initSocket(server: HttpServer): SocketServer {
  io = new SocketServer(server, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);
    logger.debug(`🔌 Socket connected: ${userId}`);

    socket.on('disconnect', () => {
      logger.debug(`🔌 Socket disconnected: ${userId}`);
    });
  });

  return io;
}

/** Emit an event to a specific user's room. Safe no-op if sockets aren't ready. */
export function emitToUser(userId: string, event: string, payload: unknown) {
  io?.to(`user:${userId}`).emit(event, payload);
}

export function getIo(): SocketServer | null {
  return io;
}
