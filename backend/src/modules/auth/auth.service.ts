import { prisma } from "../../shared/config/database";
import { twilioClient, TWILIO_PHONE_NUMBER } from "../../shared/config/twilio";
import { AuthUser } from "./auth.types";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Constants
const CODE_EXPIRY_MINUTES = 10;
const CODE_EXPIRY_MS = CODE_EXPIRY_MINUTES * 60 * 1000;
const CODE_LENGTH = 6;
const MIN_CODE = 100000;
const MAX_CODE = 999999;
const DEFAULT_USER_NAME = "New User";
const DEFAULT_ROLE = "STUDENT";
const TOKEN_EXPIRY = "24h";

export class AuthService {
  async createAccessCode(phoneNumber: string): Promise<void> {
    const code = crypto.randomInt(MIN_CODE, MAX_CODE).toString();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MS);

    await prisma.accessCode.create({
      data: {
        phone: phoneNumber,
        code,
        expiresAt,
        type: "SMS",
      },
    });

    await twilioClient.messages.create({
      body: `Your classroom access code is: ${code}`,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
  }

  async validateAccessCode(
    phoneNumber: string,
    accessCode: string,
  ): Promise<AuthUser | null> {
    const codeRecord = await prisma.accessCode.findFirst({
      where: {
        phone: phoneNumber,
        code: accessCode,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!codeRecord) {
      return null;
    }

    await prisma.accessCode.delete({
      where: { id: codeRecord.id },
    });

    let user = await prisma.user.findUnique({
      where: { phone: phoneNumber },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: phoneNumber,
          name: DEFAULT_USER_NAME,
          role: DEFAULT_ROLE,
        },
      });
    }

    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      name: user.name,
      role: user.role as "INSTRUCTOR" | "STUDENT",
    };
  }

  async createEmailAccessCode(email: string): Promise<void> {
    const code = crypto.randomInt(MIN_CODE, MAX_CODE).toString();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MS);

    await prisma.accessCode.create({
      data: {
        phone: email,
        code,
        expiresAt,
        type: "EMAIL",
      },
    });

    // TODO: Send email with code
    console.log(`Email access code for ${email}: ${code}`);
  }

  async validateEmailCode(
    email: string,
    accessCode: string,
  ): Promise<AuthUser | null> {
    const codeRecord = await prisma.accessCode.findFirst({
      where: {
        phone: email,
        code: accessCode,
        expiresAt: {
          gt: new Date(),
        },
        type: "EMAIL",
      },
    });

    if (!codeRecord) {
      return null;
    }

    await prisma.accessCode.delete({
      where: { id: codeRecord.id },
    });

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  generateToken(user: AuthUser): string {
    return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: TOKEN_EXPIRY });
  }
}
