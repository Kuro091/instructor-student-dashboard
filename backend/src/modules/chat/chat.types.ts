import { Role } from "../auth/auth.types";

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  receiverId: string;
  receiverName: string;
  receiverRole: Role;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: {
    instructorId: string;
    instructorName: string;
    studentId: string;
    studentName: string;
  };
  lastMessage?: Message;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageRequest {
  receiverId: string;
  content: string;
}

export interface GetConversationRequest {
  participantId: string;
}

export interface MarkMessageReadRequest {
  messageId: string;
}

export interface SocketUser {
  userId: string;
  socketId: string;
  role: Role;
  name: string;
}

export interface SocketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  receiverId: string;
  content: string;
  timestamp: Date;
}
