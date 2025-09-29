import { db, COLLECTIONS } from "../../shared/config/firebase";
import { UserDocument, Role } from "../../shared/types/firebase.types";
import { NotFoundError, ValidationError } from "../../shared/utils/error.utils";
import { hashPassword, comparePassword } from "../../shared/utils/auth.utils";

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

export class StudentAuthService {
  async setupStudentAccount(data: {
    email: string;
    username: string;
    password: string;
  }): Promise<StudentProfile> {
    const studentQuery = await db
      .collection(COLLECTIONS.USERS)
      .where("email", "==", data.email)
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
  }): Promise<StudentProfile> {
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
}
