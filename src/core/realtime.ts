import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io: Server | null = null;

export function initRealtime(server: import("http").Server) {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
  });
  io.on("connection", (socket) => {
    const token =
      (socket.handshake.query?.token as string) ||
      socket.handshake.headers["authorization"]
        ?.toString()
        ?.replace("Bearer ", "") ||
      "";
    const secret = process.env.JWT_SECRET;
    if (secret && token) {
      try {
        const payload = jwt.verify(token, secret) as {
          userId: string;
          role: string;
        };
        const room = `user:${payload.userId}`;
        socket.join(room);
      } catch {}
    }
  });
}

export function notifyUser(userId: string, event: string, payload: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}
