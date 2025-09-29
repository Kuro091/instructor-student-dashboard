import { Role } from "../auth/auth.types";

export interface MarkLessonDoneRequest {
  phone: string;
  lessonId: string;
}

export interface EditProfileRequest {
  phone: string;
  name?: string;
  email?: string;
}

export interface StudentLesson {
  id: string;
  title: string;
  description: string;
  assignedTo: string[]; // student phones
  assignedBy: string; // instructor phone
  createdAt: Date;
  status: "pending" | "completed";
  completedAt?: Date;
}

export interface StudentProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
