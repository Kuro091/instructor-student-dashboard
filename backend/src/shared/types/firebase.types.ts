import { Role } from "../../modules/auth/auth.types";

export { Role };

export enum AccessCodeType {
  SMS = "SMS",
  EMAIL = "EMAIL",
}

export enum LessonStatus {
  PENDING = "pending",
  COMPLETED = "completed",
}

export enum MessageType {
  TEXT = "text",
  SYSTEM = "system",
}

export interface UserDocument {
  id?: string;
  phone: string;
  email?: string;
  name: string;
  role: Role;
  username?: string;
  password?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessCodeDocument {
  id?: string;
  identifier: string; // phone number or email
  code: string;
  expiresAt: Date;
  type: AccessCodeType;
  createdAt: Date;
}

export interface LessonDocument {
  id?: string;
  title: string;
  description: string;
  assignedTo: string[]; // student phones
  assignedBy: string; // instructor phone
  createdAt: Date;
  status: LessonStatus;
}

export interface StudentLessonDocument {
  id?: string;
  studentPhone: string;
  lessonId: string;
  status: LessonStatus;
  completedAt?: Date;
}

export interface ConversationDocument {
  id?: string;
  participants: string[]; // phone numbers
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: Date;
  };
  updatedAt: Date;
}

export interface MessageDocument {
  id?: string;
  conversationId: string;
  sender: string; // phone number
  content: string;
  timestamp: Date;
  type: MessageType;
}

export interface FirebaseCollections {
  users: UserDocument;
  accessCodes: AccessCodeDocument;
  lessons: LessonDocument;
  studentLessons: StudentLessonDocument;
  conversations: ConversationDocument;
  messages: MessageDocument;
}
