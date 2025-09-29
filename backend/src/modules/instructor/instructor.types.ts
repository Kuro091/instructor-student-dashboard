import { Role } from "../auth/auth.types";

export interface AddStudentRequest {
  name: string;
  phone: string;
  email: string;
}

export interface AssignLessonRequest {
  studentPhones: string[];
  title: string;
  description: string;
}

export interface EditStudentRequest {
  name?: string;
  email?: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  assignedTo: string[]; // student phones
  assignedBy: string; // instructor phone
  createdAt: Date;
  status: "pending" | "completed";
}
