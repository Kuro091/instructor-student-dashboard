import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { SocketUser, SocketMessage } from "../../modules/chat/chat.types";
import { AuthUser } from "../../modules/auth/auth.types";

export interface AuthenticatedSocket extends Socket {
  user?: AuthUser;
}

export class SocketAuthMiddleware {
  static authenticate = (
    socket: AuthenticatedSocket,
    next: (err?: Error) => void,
  ) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error("Invalid authentication token"));
    }
  };
}

export class SocketManager {
  private connectedUsers: Map<string, SocketUser> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  addUser(socket: AuthenticatedSocket): void {
    if (!socket.user) return;

    const socketUser: SocketUser = {
      userId: socket.user.id,
      socketId: socket.id,
      role: socket.user.role,
      name: socket.user.name,
    };

    this.connectedUsers.set(socket.id, socketUser);
    this.userSockets.set(socket.user.id, socket.id);
  }

  removeUser(socketId: string): void {
    const user = this.connectedUsers.get(socketId);
    if (user) {
      this.userSockets.delete(user.userId);
      this.connectedUsers.delete(socketId);
    }
  }

  getUserBySocketId(socketId: string): SocketUser | undefined {
    return this.connectedUsers.get(socketId);
  }

  getUserSocketId(userId: string): string | undefined {
    return this.userSockets.get(userId);
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  getOnlineUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }
}
