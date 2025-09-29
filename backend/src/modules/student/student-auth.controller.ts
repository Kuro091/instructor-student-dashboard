import { Request, Response } from "express";
import { z } from "zod";
import { StudentAuthService } from "./student-auth.service";
import {
  createController,
  sendSuccessResponse,
  ValidationError,
} from "../../shared/utils/error.utils";

const studentSetupSchema = z.object({
  email: z.email(),
  username: z.string().min(3),
  password: z.string().min(6),
});

const studentLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export class StudentAuthController {
  private studentAuthService = new StudentAuthService();

  setupStudentAccount = createController(
    async (req: Request, res: Response) => {
      const data = studentSetupSchema.parse(req.body);

      const student = await this.studentAuthService.setupStudentAccount(data);
      sendSuccessResponse(res, student, "Student account set up successfully");
    },
  );

  loginStudent = createController(async (req: Request, res: Response) => {
    const data = studentLoginSchema.parse(req.body);

    const student = await this.studentAuthService.loginStudent(data);
    sendSuccessResponse(res, student, "Student logged in successfully");
  });

  getStudentByEmail = createController(async (req: Request, res: Response) => {
    const { email } = req.params;

    if (!email) {
      throw new ValidationError("Email is required");
    }

    const student = await this.studentAuthService.getStudentByEmail(email);

    if (!student) {
      sendSuccessResponse(res, null, "Student not found");
    } else {
      sendSuccessResponse(res, student, "Student retrieved successfully");
    }
  });
}
