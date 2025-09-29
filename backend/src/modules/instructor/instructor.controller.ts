import { Request, Response } from "express";
import { InstructorService } from "./instructor.service";
import { z } from "zod";
import {
  createController,
  sendSuccessResponse,
  ValidationError,
  ConflictError,
  NotFoundError,
} from "../../shared/utils/error.utils";

const addStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10).max(15),
  email: z.string().email("Invalid email address"),
});

const assignLessonSchema = z.object({
  studentPhones: z
    .array(z.string().min(10).max(15))
    .min(1, "At least one student phone is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

const editStudentSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email("Invalid email address").optional(),
});

export class InstructorController {
  private instructorService = new InstructorService();

  addStudent = createController(async (req: Request, res: Response) => {
    const data = addStudentSchema.parse(req.body);

    const student = await this.instructorService.addStudent(data);
    sendSuccessResponse(res, student, "Student added successfully");
  });

  assignLesson = createController(async (req: Request, res: Response) => {
    const data = assignLessonSchema.parse(req.body);
    const instructorPhone = req.user?.phone;

    if (!instructorPhone) {
      throw new ValidationError("Authentication required");
    }

    const lesson = await this.instructorService.assignLesson(
      data,
      instructorPhone,
    );
    sendSuccessResponse(res, lesson, "Lesson assigned successfully");
  });

  getAllStudents = createController(async (req: Request, res: Response) => {
    const students = await this.instructorService.getAllStudents();
    sendSuccessResponse(res, students, "Students retrieved successfully");
  });

  getStudentByPhone = createController(async (req: Request, res: Response) => {
    const { phone } = req.params;

    if (!phone) {
      throw new ValidationError("Phone number is required");
    }

    const student = await this.instructorService.getStudentByPhone(phone);
    sendSuccessResponse(res, student, "Student retrieved successfully");
  });

  editStudent = createController(async (req: Request, res: Response) => {
    const { phone } = req.params;
    const data = editStudentSchema.parse(req.body);

    if (!phone) {
      throw new ValidationError("Phone number is required");
    }

    const student = await this.instructorService.editStudent(phone, data);
    sendSuccessResponse(res, student, "Student updated successfully");
  });

  deleteStudent = createController(async (req: Request, res: Response) => {
    const { phone } = req.params;

    if (!phone) {
      throw new ValidationError("Phone number is required");
    }

    await this.instructorService.deleteStudent(phone);
    sendSuccessResponse(res, undefined, "Student deleted successfully");
  });
}
