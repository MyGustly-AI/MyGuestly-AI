import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import env from "../../config/env.js";
import { redis } from "../../config/redis.js";
import { logger } from "../loggers/logger.js";

let io = null;

const EVENT_ROOM_PREFIX = "event:";

export function initSocketIO(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.ALLOWED_ORIGINS?.split(",") || "*",
      methods: ["GET", "POST"],
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error("Authentication required"));

      const blocked = await redis.get(`blocklist:${token}`);
      if (blocked) return next(new Error("Session expired"));

      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    logger.info("Socket connected", { userId: socket.user?.id, socketId: socket.id });

    socket.on("join:event", (eventId) => {
      if (!eventId) return;
      const room = `${EVENT_ROOM_PREFIX}${eventId}`;
      socket.join(room);
      logger.info("Socket joined event room", { userId: socket.user?.id, eventId, socketId: socket.id });
    });

    socket.on("leave:event", (eventId) => {
      if (!eventId) return;
      const room = `${EVENT_ROOM_PREFIX}${eventId}`;
      socket.leave(room);
    });

    socket.on("disconnect", () => {
      logger.info("Socket disconnected", { userId: socket.user?.id, socketId: socket.id });
    });
  });

  logger.info("Socket.io initialized");
  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized. Call initSocketIO first.");
  return io;
}

export function emitToEvent(eventId, event, data) {
  if (!io) return;
  io.to(`${EVENT_ROOM_PREFIX}${eventId}`).emit(event, data);
}
