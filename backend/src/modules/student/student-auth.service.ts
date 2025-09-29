import { db, COLLECTIONS } from "../../shared/config/firebase";
import { UserDocument, Role } from "../../shared/types/firebase.types";
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "../../shared/utils/error.utils";
import { hashPassword, comparePassword } from "../../shared/utils/auth.utils";
import jwt from "jsonwebtoken";

export enum TokenPurpose {
  STUDENT_SETUP = "student_setup",
  // PASSWORD_RESET = "password_reset",
  // EMAIL_VERIFICATION = "email_verification",
  // ACCOUNT_RECOVERY = "account_recovery"
}

interface SetupTokenPayload {
  email: string;
  purpose: TokenPurpose;
  iat: number;
  exp: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  username: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentAuthResponse {
  user: StudentProfile;
  token: string;
}

export class StudentAuthService {
  async setupStudentAccount(data: {
    setupToken: string;
    username: string;
    password: string;
  }): Promise<StudentProfile> {
    let tokenPayload: SetupTokenPayload;
    try {
      tokenPayload = jwt.verify(
        data.setupToken,
        process.env.JWT_SECRET!,
      ) as SetupTokenPayload;
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired setup token");
    }

    if (tokenPayload.purpose !== TokenPurpose.STUDENT_SETUP) {
      throw new UnauthorizedError("Invalid token purpose");
    }

    const email = tokenPayload.email;
    if (!email) {
      throw new UnauthorizedError("Email not found in token");
    }

    const studentQuery = await db
      .collection(COLLECTIONS.USERS)
      .where("email", "==", email)
      .where("role", "==", Role.STUDENT)
      .limit(1)
      .get();

    if (studentQuery.empty) {
      throw new NotFoundError("Student with this email not found");
    }

    const studentDoc = studentQuery.docs[0];
    const studentData = studentDoc.data() as UserDocument;

    if (studentData.isActive) {
      throw new ValidationError("Student account is already set up");
    }

    const existingUsernameQuery = await db
      .collection(COLLECTIONS.USERS)
      .where("username", "==", data.username)
      .limit(1)
      .get();

    if (!existingUsernameQuery.empty) {
      throw new ValidationError("Username already exists");
    }

    const hashedPassword = await hashPassword(data.password);

    const updateData: Partial<UserDocument> = {
      username: data.username,
      password: hashedPassword,
      isActive: true,
      updatedAt: new Date(),
    };

    await studentDoc.ref.update(updateData);

    return {
      id: studentDoc.id,
      name: studentData.name,
      phone: studentData.phone,
      email: studentData.email || "",
      username: data.username,
      role: studentData.role,
      isActive: true,
      createdAt: studentData.createdAt,
      updatedAt: new Date(),
    };
  }

  async loginStudent(data: {
    username: string;
    password: string;
  }): Promise<StudentAuthResponse> {
    const studentQuery = await db
      .collection(COLLECTIONS.USERS)
      .where("username", "==", data.username)
      .where("role", "==", Role.STUDENT)
      .limit(1)
      .get();

    if (studentQuery.empty) {
      throw new NotFoundError("Invalid username or password");
    }

    const studentDoc = studentQuery.docs[0];
    const studentData = studentDoc.data() as UserDocument;

    if (!studentData.isActive) {
      throw new ValidationError("Student account is not set up yet");
    }

    if (!studentData.password) {
      throw new ValidationError("Student account is not set up yet");
    }

    const isValidPassword = await comparePassword(
      data.password,
      studentData.password,
    );

    if (!isValidPassword) {
      throw new NotFoundError("Invalid username or password");
    }

    const studentProfile: StudentProfile = {
      id: studentDoc.id,
      name: studentData.name,
      phone: studentData.phone,
      email: studentData.email || "",
      username: studentData.username || "",
      role: studentData.role,
      isActive: studentData.isActive,
      createdAt: studentData.createdAt,
      updatedAt: studentData.updatedAt,
    };

    const token = this.generateToken(studentProfile);

    return {
      user: studentProfile,
      token,
    };
  }

  async getStudentByEmail(email: string): Promise<StudentProfile | null> {
    const studentQuery = await db
      .collection(COLLECTIONS.USERS)
      .where("email", "==", email)
      .where("role", "==", Role.STUDENT)
      .limit(1)
      .get();

    if (studentQuery.empty) {
      return null;
    }

    const studentDoc = studentQuery.docs[0];
    const studentData = studentDoc.data() as UserDocument;

    return {
      id: studentDoc.id,
      name: studentData.name,
      phone: studentData.phone,
      email: studentData.email || "",
      username: studentData.username || "",
      role: studentData.role,
      isActive: studentData.isActive,
      createdAt: studentData.createdAt,
      updatedAt: studentData.updatedAt,
    };
  }

  async validateSetupToken(
    setupToken: string,
  ): Promise<{ email: string; isValid: boolean }> {
    try {
      const tokenPayload = jwt.verify(
        setupToken,
        process.env.JWT_SECRET!,
      ) as SetupTokenPayload;

      if (tokenPayload.purpose !== TokenPurpose.STUDENT_SETUP) {
        return { email: "", isValid: false };
      }

      const email = tokenPayload.email;
      if (!email) {
        return { email: "", isValid: false };
      }

      const studentQuery = await db
        .collection(COLLECTIONS.USERS)
        .where("email", "==", email)
        .where("role", "==", Role.STUDENT)
        .limit(1)
        .get();

      if (studentQuery.empty) {
        return { email: "", isValid: false };
      }

      const studentData = studentQuery.docs[0].data() as UserDocument;
      if (studentData.isActive) {
        return { email: "", isValid: false };
      }

      return { email, isValid: true };
    } catch (error) {
      return { email: "", isValid: false };
    }
  }

  private generateToken(user: StudentProfile): string {
    return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: "24h" });
  }
}
