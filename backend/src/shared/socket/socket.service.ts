import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { SocketManager } from "./socket.manager";
import { ChatService } from "../../modules/chat/chat.service";
import {
  SocketMessage,
  SendMessageRequest,
  MarkMessageReadRequest,
} from "../../modules/chat/chat.types";
import { AuthenticatedSocket } from "./socket.manager";
import { AuthUser } from "../../modules/auth/auth.types";
import { db } from "../config/firebase";

export const SOCKET_EVENTS = {
  SEND_MESSAGE: "send_message",
  TYPING_START: "typing_start",
  TYPING_STOP: "typing_stop",
  MARK_MESSAGE_READ: "mark_message_read",
  CHECK_USER_STATUS: "check_user_status",
  CONNECTED: "connected",
  NEW_MESSAGE: "new_message",
  MESSAGE_SENT: "message_sent",
  MESSAGE_READ: "message_read",
  USER_TYPING: "user_typing",
  USER_STATUS: "user_status",
  ERROR: "error",
} as const;
interface SendMessageData extends SendMessageRequest {}

interface TypingData {
  receiverId: string;
}

interface MarkMessageReadData extends MarkMessageReadRequest {}

interface CheckUserStatusData {
  userId: string;
}

interface UserTypingEvent {
  userId: string;
  isTyping: boolean;
}

interface UserStatusEvent {
  userId: string;
  isOnline: boolean;
}

interface MessageReadEvent {
  messageId: string;
  readAt: string;
}

interface ConnectedEvent {
  message: string;
  userId: string;
}

interface ErrorEvent {
  message: string;
}

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
        let token =
          socket.handshake.auth.token ||
          socket.handshake.headers.authorization?.split(" ")[1];

        if (!token) {
          const cookieHeader = socket.handshake.headers.cookie;
          if (cookieHeader) {
            const tokenMatch = cookieHeader.match(/token=([^;]+)/);
            token = tokenMatch ? tokenMatch[1] : undefined;
          }
        }

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

      this.socketManager.addUser(authSocket);
      authSocket.join(`user_${authSocket.user!.id}`);

      authSocket.emit(SOCKET_EVENTS.CONNECTED, {
        message: "Connected successfully",
        userId: authSocket.user!.id,
      } as ConnectedEvent);
      authSocket.on(
        SOCKET_EVENTS.SEND_MESSAGE,
        async (data: SendMessageData) => {
          try {
            if (!authSocket.user) {
              authSocket.emit(SOCKET_EVENTS.ERROR, {
                message: "User not authenticated",
              } as ErrorEvent);
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

            authSocket.emit(SOCKET_EVENTS.MESSAGE_SENT, socketMessage);
            authSocket.emit(SOCKET_EVENTS.NEW_MESSAGE, socketMessage);

            const receiverSocketId = this.socketManager.getUserSocketId(
              data.receiverId,
            );
            if (receiverSocketId) {
              this.io
                .to(receiverSocketId)
                .emit(SOCKET_EVENTS.NEW_MESSAGE, socketMessage);
            }

            this.io
              .to(`user_${data.receiverId}`)
              .emit(SOCKET_EVENTS.NEW_MESSAGE, socketMessage);
          } catch (error) {
            console.error("Error sending message:", error);
            authSocket.emit(SOCKET_EVENTS.ERROR, {
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to send message",
            } as ErrorEvent);
          }
        },
      );

      authSocket.on(SOCKET_EVENTS.TYPING_START, (data: TypingData) => {
        const receiverSocketId = this.socketManager.getUserSocketId(
          data.receiverId,
        );
        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit(SOCKET_EVENTS.USER_TYPING, {
            userId: authSocket.user!.id,
            isTyping: true,
          } as UserTypingEvent);
        }
      });

      authSocket.on(SOCKET_EVENTS.TYPING_STOP, (data: TypingData) => {
        const receiverSocketId = this.socketManager.getUserSocketId(
          data.receiverId,
        );
        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit(SOCKET_EVENTS.USER_TYPING, {
            userId: authSocket.user!.id,
            isTyping: false,
          } as UserTypingEvent);
        }
      });

      authSocket.on(
        SOCKET_EVENTS.MARK_MESSAGE_READ,
        async (data: MarkMessageReadData) => {
          try {
            if (!authSocket.user) {
              authSocket.emit(SOCKET_EVENTS.ERROR, {
                message: "User not authenticated",
              } as ErrorEvent);
              return;
            }

            // Get the message to find the sender
            const messageDoc = await db
              .collection("messages")
              .doc(data.messageId)
              .get();

            if (!messageDoc.exists) {
              authSocket.emit(SOCKET_EVENTS.ERROR, {
                message: "Message not found",
              } as ErrorEvent);
              return;
            }

            const messageData = messageDoc.data()!;
            const senderId = messageData.senderId;

            await this.chatService.markMessageAsRead(
              data.messageId,
              authSocket.user.id,
            );

            // Emit to the current user (receiver)
            authSocket.emit(SOCKET_EVENTS.MESSAGE_READ, {
              messageId: data.messageId,
              readAt: new Date().toISOString(),
            } as MessageReadEvent);

            // Emit to the sender that their message has been read
            const senderSocketId = this.socketManager.getUserSocketId(senderId);
            if (senderSocketId) {
              this.io.to(senderSocketId).emit(SOCKET_EVENTS.MESSAGE_READ, {
                messageId: data.messageId,
                readAt: new Date().toISOString(),
              } as MessageReadEvent);
            }

            // Also emit to the sender's user room
            this.io.to(`user_${senderId}`).emit(SOCKET_EVENTS.MESSAGE_READ, {
              messageId: data.messageId,
              readAt: new Date().toISOString(),
            } as MessageReadEvent);
          } catch (error) {
            console.error("Error marking message as read:", error);
            authSocket.emit(SOCKET_EVENTS.ERROR, {
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to mark message as read",
            } as ErrorEvent);
          }
        },
      );

      authSocket.on(
        SOCKET_EVENTS.CHECK_USER_STATUS,
        (data: CheckUserStatusData) => {
          const isOnline = this.socketManager.isUserOnline(data.userId);
          authSocket.emit(SOCKET_EVENTS.USER_STATUS, {
            userId: data.userId,
            isOnline,
          } as UserStatusEvent);
        },
      );

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
