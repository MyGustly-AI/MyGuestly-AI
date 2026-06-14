import { Server } from "socket.io";
import env from "../config/env.js";
import { logger } from "./logs/logger.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.ALLOWED_ORIGINS.split(",").map(o => o.trim()),
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    logger.info("New socket connection", { socketId: socket.id });

    // Host can join their event's room to listen for check-ins
    socket.on("joinEventRoom", (eventId) => {
      socket.join(`event:${eventId}`);
      logger.info(`Socket joined event room`, { socketId: socket.id, eventId });
    });

    socket.on("leaveEventRoom", (eventId) => {
      socket.leave(`event:${eventId}`);
    });

    socket.on("disconnect", () => {
      logger.info("Socket disconnected", { socketId: socket.id });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
