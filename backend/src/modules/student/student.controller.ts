import { Request, Response } from "express";
import { StudentService } from "./student.service";
import { z } from "zod";
import {
  createController,
  sendSuccessResponse,
  ValidationError,
} from "../../shared/utils/error.utils";

const markLessonDoneSchema = z.object({
  lessonId: z.string().min(1, "Lesson ID is required"),
});

const editProfileSchema = z.object({
  phone: z.string().min(10).max(15).optional(),
  name: z.string().min(1).optional(),
  email: z.string().email("Invalid email address").optional(),
});

export class StudentController {
  private studentService = new StudentService();

  getMyLessons = createController(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ValidationError("User authentication required");
    }

    const lessons = await this.studentService.getMyLessons(req.user.phone);
    sendSuccessResponse(res, lessons, "Lessons retrieved successfully");
  });

  markLessonDone = createController(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ValidationError("User authentication required");
    }

    const data = markLessonDoneSchema.parse(req.body);
    const lesson = await this.studentService.markLessonDone(
      req.user.phone,
      data,
    );
    sendSuccessResponse(res, lesson, "Lesson marked as completed");
  });

  editProfile = createController(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ValidationError("User authentication required");
    }

    const data = editProfileSchema.parse(req.body);
    const profile = await this.studentService.editProfile(req.user.phone, data);
    sendSuccessResponse(res, profile, "Profile updated successfully");
  });
}
