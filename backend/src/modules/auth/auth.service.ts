import { db, COLLECTIONS } from "../../shared/config/firebase";
import { twilioClient, TWILIO_PHONE_NUMBER } from "../../shared/config/twilio";
import { emailTransporter } from "../../shared/config/email";
import { AuthUser, Role } from "./auth.types";
import {
  UserDocument,
  AccessCodeDocument,
  AccessCodeType,
} from "../../shared/types/firebase.types";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const CODE_EXPIRY_MINUTES = 10;
const CODE_EXPIRY_MS = CODE_EXPIRY_MINUTES * 60 * 1000;
const MIN_CODE = 100000;
const MAX_CODE = 999999;
const DEFAULT_USER_NAME = "New User";
const DEFAULT_ROLE = Role.INSTRUCTOR;
const TOKEN_EXPIRY = "24h";

export class AuthService {
  async createAccessCode(phoneNumber: string): Promise<void> {
    const code = crypto.randomInt(MIN_CODE, MAX_CODE).toString();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MS);

    const accessCodeData: Omit<AccessCodeDocument, "id"> = {
      identifier: phoneNumber,
      code,
      expiresAt,
      type: AccessCodeType.SMS,
      createdAt: new Date(),
    };

    await db.collection(COLLECTIONS.ACCESS_CODES).add(accessCodeData);

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
    const codeQuery = await db
      .collection(COLLECTIONS.ACCESS_CODES)
      .where("identifier", "==", phoneNumber)
      .where("code", "==", accessCode)
      .where("expiresAt", ">", new Date())
      .where("type", "==", AccessCodeType.SMS)
      .limit(1)
      .get();

    if (codeQuery.empty) {
      return null;
    }

    const codeDoc = codeQuery.docs[0];
    await codeDoc.ref.delete();

    const userQuery = await db
      .collection(COLLECTIONS.USERS)
      .where("phone", "==", phoneNumber)
      .limit(1)
      .get();

    if (userQuery.empty) {
      const newUserData: Omit<UserDocument, "id"> = {
        phone: phoneNumber,
        name: DEFAULT_USER_NAME,
        role: DEFAULT_ROLE,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newUserRef = await db
        .collection(COLLECTIONS.USERS)
        .add(newUserData);
      const newUserDoc = await newUserRef.get();
      const newUserDocData = newUserDoc.data() as UserDocument;

      return {
        id: newUserDoc.id,
        phone: newUserDocData.phone,
        email: newUserDocData.email,
        name: newUserDocData.name,
        role: newUserDocData.role as Role,
      };
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data() as UserDocument;
    return {
      id: userDoc.id,
      phone: userData?.phone,
      email: userData?.email,
      name: userData?.name,
      role: userData?.role as Role,
    };
  }

  async createEmailAccessCode(email: string): Promise<void> {
    const code = crypto.randomInt(MIN_CODE, MAX_CODE).toString();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MS);

    const emailCodeData: Omit<AccessCodeDocument, "id"> = {
      identifier: email,
      code,
      expiresAt,
      type: AccessCodeType.EMAIL,
      createdAt: new Date(),
    };
    await db.collection(COLLECTIONS.ACCESS_CODES).add(emailCodeData);

    if (emailTransporter) {
      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Classroom Access Code",
        text: `Your classroom access code is: ${code}\n\nThis code will expire in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Classroom Access Code</h2>
            <p>Your access code is: <strong style="font-size: 24px; color: #007bff;">${code}</strong></p>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      });
    }
  }

  async validateEmailCode(
    email: string,
    accessCode: string,
  ): Promise<AuthUser | null> {
    const codeQuery = await db
      .collection(COLLECTIONS.ACCESS_CODES)
      .where("identifier", "==", email)
      .where("code", "==", accessCode)
      .where("expiresAt", ">", new Date())
      .where("type", "==", AccessCodeType.EMAIL)
      .limit(1)
      .get();

    if (codeQuery.empty) {
      return null;
    }

    const codeDoc = codeQuery.docs[0];
    await codeDoc.ref.delete();

    const userQuery = await db
      .collection(COLLECTIONS.USERS)
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userQuery.empty) {
      return null;
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data() as UserDocument;
    return {
      id: userDoc.id,
      phone: userData.phone,
      email: userData.email,
      name: userData.name,
      role: userData.role,
    };
  }

  generateToken(user: AuthUser): string {
    return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: TOKEN_EXPIRY });
  }
}
