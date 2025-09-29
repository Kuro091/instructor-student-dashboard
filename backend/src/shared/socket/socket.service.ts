import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { SocketManager } from "./socket.manager";
import { ChatService } from "../../modules/chat/chat.service";
import { SocketMessage } from "../../modules/chat/chat.types";
import { AuthenticatedSocket } from "./socket.manager";
import { AuthUser } from "../../modules/auth/auth.types";

export class SocketService {
  private io: SocketIOServer;
  private socketManager: SocketManager;
  private chatService: ChatService;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? false
            : ["http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.socketManager = new SocketManager();
    this.chatService = new ChatService();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.use((socket, next) => {
      try {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.authorization?.split(" ")[1];

        if (!token) {
          return next(new Error("Authentication token required"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
        (socket as AuthenticatedSocket).user = decoded;
        next();
      } catch (error) {
        next(new Error("Invalid authentication token"));
      }
    });

    this.io.on("connection", (socket) => {
      const authSocket = socket as AuthenticatedSocket;
      console.log(
        `User connected: ${authSocket.user?.name} (${authSocket.id})`,
      );

      this.socketManager.addUser(authSocket);
      authSocket.join(`user_${authSocket.user!.id}`);

      authSocket.emit("connected", {
        message: "Connected successfully",
        userId: authSocket.user!.id,
      });

      authSocket.on(
        "send_message",
        async (data: { receiverId: string; content: string }) => {
          try {
            if (!authSocket.user) {
              authSocket.emit("error", { message: "User not authenticated" });
              return;
            }

            const message = await this.chatService.sendMessage(
              authSocket.user,
              {
                receiverId: data.receiverId,
                content: data.content,
              },
            );

            const socketMessage: SocketMessage = {
              id: message.id,
              senderId: message.senderId,
              senderName: message.senderName,
              senderRole: message.senderRole,
              receiverId: message.receiverId,
              content: message.content,
              timestamp: message.timestamp,
            };

            authSocket.emit("message_sent", socketMessage);

            const receiverSocketId = this.socketManager.getUserSocketId(
              data.receiverId,
            );
            if (receiverSocketId) {
              this.io.to(receiverSocketId).emit("new_message", socketMessage);
            }

            this.io
              .to(`user_${data.receiverId}`)
              .emit("new_message", socketMessage);
          } catch (error) {
            console.error("Error sending message:", error);
            authSocket.emit("error", {
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to send message",
            });
          }
        },
      );

      authSocket.on("typing_start", (data: { receiverId: string }) => {
        const receiverSocketId = this.socketManager.getUserSocketId(
          data.receiverId,
        );
        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit("user_typing", {
            senderId: authSocket.user!.id,
            senderName: authSocket.user!.name,
          });
        }
      });

      authSocket.on("typing_stop", (data: { receiverId: string }) => {
        const receiverSocketId = this.socketManager.getUserSocketId(
          data.receiverId,
        );
        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit("user_stopped_typing", {
            senderId: authSocket.user!.id,
          });
        }
      });

      authSocket.on(
        "mark_message_read",
        async (data: { messageId: string }) => {
          try {
            if (!authSocket.user) {
              authSocket.emit("error", { message: "User not authenticated" });
              return;
            }

            await this.chatService.markMessageAsRead(
              data.messageId,
              authSocket.user.id,
            );

            authSocket.emit("message_read", { messageId: data.messageId });
          } catch (error) {
            console.error("Error marking message as read:", error);
            authSocket.emit("error", {
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to mark message as read",
            });
          }
        },
      );

      authSocket.on("check_user_status", (data: { userId: string }) => {
        const isOnline = this.socketManager.isUserOnline(data.userId);
        authSocket.emit("user_status", {
          userId: data.userId,
          isOnline,
        });
      });

      authSocket.on("disconnect", () => {
        console.log(
          `User disconnected: ${authSocket.user?.name} (${authSocket.id})`,
        );
        this.socketManager.removeUser(authSocket.id);
      });
    });
  }

  getIO(): SocketIOServer {
    return this.io;
  }

  getSocketManager(): SocketManager {
    return this.socketManager;
  }
}
