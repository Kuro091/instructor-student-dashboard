import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { ApiResponse } from "../../shared/types/common.types";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { db, COLLECTIONS } from "../../shared/config/firebase";
import { AuthUser, Role } from "./auth.types";
import { UserDocument } from "../../shared/types/firebase.types";

const createAccessCodeSchema = z.object({
  phoneNumber: z.string().min(10).max(15),
});

const validateAccessCodeSchema = z
  .object({
    phoneNumber: z.string().min(10).max(15).optional(),
    email: z.string().email().optional(),
    accessCode: z.string().length(6),
  })
  .refine((data) => data.phoneNumber || data.email, {
    message: "Either phoneNumber or email must be provided",
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
      const { phoneNumber, email, accessCode } = validateAccessCodeSchema.parse(
        req.body,
      );

      let user: any = null;

      if (phoneNumber) {
        // SMS validation
        user = await this.authService.validateAccessCode(
          phoneNumber,
          accessCode,
        );
      } else if (email) {
        // Email validation
        user = await this.authService.validateEmailCode(email, accessCode);
      }

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: "Invalid or expired access code",
        };
        res.status(401).json(response);
        return;
      }

      const token = this.authService.generateToken(user);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      const response: ApiResponse = {
        success: true,
        data: { user },
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

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      const response: ApiResponse = {
        success: true,
        data: { user },
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

  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("token");

      const response: ApiResponse = {
        success: true,
        message: "Logged out successfully",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: "Failed to logout",
      };
      res.status(400).json(response);
    }
  }

  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.cookie?.split("token=")[1]?.split(";")[0];

      if (!token) {
        const response: ApiResponse = {
          success: false,
          error: "No token provided",
        };
        res.status(401).json(response);
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      const userQuery = await db
        .collection(COLLECTIONS.USERS)
        .doc(decoded.id)
        .get();

      if (!userQuery.exists) {
        const response: ApiResponse = {
          success: false,
          error: "User not found",
        };
        res.status(401).json(response);
        return;
      }

      const userData = userQuery.data() as UserDocument;
      const user: AuthUser = {
        id: userQuery.id,
        phone: userData.phone,
        email: userData.email,
        name: userData.name,
        role: userData.role as Role,
      };

      const response: ApiResponse = {
        success: true,
        data: { user },
        message: "Token is valid",
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid or expired token",
      };
      res.status(401).json(response);
    }
  }
}
