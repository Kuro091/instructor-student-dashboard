import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { ApiResponse } from "../../shared/types/common.types";
import { z } from "zod";

const createAccessCodeSchema = z.object({
  phoneNumber: z.string().min(10).max(15),
});

const validateAccessCodeSchema = z.object({
  phoneNumber: z.string().min(10).max(15),
  accessCode: z.string().length(6),
});

const loginEmailSchema = z.object({
  email: z.string().email(),
});

const validateEmailCodeSchema = z.object({
  email: z.string().email(),
  accessCode: z.string().length(6),
});

export class AuthController {
  private authService = new AuthService();

  async createAccessCode(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber } = createAccessCodeSchema.parse(req.body);

      await this.authService.createAccessCode(phoneNumber);

      const response: ApiResponse = {
        success: true,
        message: "Access code sent successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create access code",
      };
      res.status(400).json(response);
    }
  }

  async validateAccessCode(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, accessCode } = validateAccessCodeSchema.parse(
        req.body,
      );

      const user = await this.authService.validateAccessCode(
        phoneNumber,
        accessCode,
      );

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: "Invalid or expired access code",
        };
        res.status(401).json(response);
        return;
      }

      const token = this.authService.generateToken(user);

      const response: ApiResponse = {
        success: true,
        data: { user, token },
        message: "Authentication successful",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to validate access code",
      };
      res.status(400).json(response);
    }
  }

  async loginEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = loginEmailSchema.parse(req.body);

      await this.authService.createEmailAccessCode(email);

      const response: ApiResponse = {
        success: true,
        message: "Email access code sent successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to send email code",
      };
      res.status(400).json(response);
    }
  }

  async validateEmailCode(req: Request, res: Response): Promise<void> {
    try {
      const { email, accessCode } = validateEmailCodeSchema.parse(req.body);

      const user = await this.authService.validateEmailCode(email, accessCode);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: "Invalid or expired access code",
        };
        res.status(401).json(response);
        return;
      }

      const token = this.authService.generateToken(user);

      const response: ApiResponse = {
        success: true,
        data: { user, token },
        message: "Authentication successful",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to validate email code",
      };
      res.status(400).json(response);
    }
  }
}
