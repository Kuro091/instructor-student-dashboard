import { db, COLLECTIONS } from "../../shared/config/firebase";
import { Timestamp } from "firebase-admin/firestore";
import { emailTransporter } from "../../shared/config/email";
import {
  AddStudentRequest,
  AssignLessonRequest,
  EditStudentRequest,
  Student,
  Lesson,
} from "./instructor.types";
import {
  UserDocument,
  LessonDocument,
  Role,
  LessonStatus,
} from "../../shared/types/firebase.types";
import {
  ConflictError,
  NotFoundError,
  AppError,
} from "../../shared/utils/error.utils";
import { TokenPurpose } from "../student/student-auth.service";
import jwt from "jsonwebtoken";

export class InstructorService {
  async addStudent(data: AddStudentRequest): Promise<Student> {
    const existingStudentQuery = await db
      .collection(COLLECTIONS.USERS)
      .where("phone", "==", data.phone)
      .limit(1)
      .get();

    if (!existingStudentQuery.empty) {
      throw new ConflictError("Student with this phone number already exists");
    }

    const newStudentData: Omit<UserDocument, "id"> = {
      phone: data.phone,
      email: data.email,
      name: data.name,
      role: Role.STUDENT,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const studentRef = await db
      .collection(COLLECTIONS.USERS)
      .add(newStudentData);
    const studentDoc = await studentRef.get();
    const studentData = studentDoc.data() as UserDocument;

    await this.sendStudentOnboardingEmail(data.email, data.name);

    return {
      id: studentDoc.id,
      name: studentData.name,
      phone: studentData.phone,
      email: studentData.email,
      role: studentData.role,
      isActive: studentData.isActive,
      createdAt:
        studentData.createdAt instanceof Date
          ? studentData.createdAt.toISOString()
          : (studentData.createdAt as Timestamp).toDate().toISOString(),
      updatedAt:
        studentData.updatedAt instanceof Date
          ? studentData.updatedAt.toISOString()
          : (studentData.updatedAt as Timestamp).toDate().toISOString(),
    };
  }

  async assignLesson(
    data: AssignLessonRequest,
    instructorPhone: string,
  ): Promise<Lesson> {
    const studentQueries = await Promise.all(
      data.studentPhones.map((phone) =>
        db
          .collection(COLLECTIONS.USERS)
          .where("phone", "==", phone)
          .limit(1)
          .get(),
      ),
    );

    const missingStudents = data.studentPhones.filter(
      (phone, index) => studentQueries[index].empty,
    );

    if (missingStudents.length > 0) {
      throw new NotFoundError(`Students: ${missingStudents.join(", ")}`);
    }

    const lessonData: Omit<LessonDocument, "id"> = {
      title: data.title,
      description: data.description,
      assignedTo: data.studentPhones,
      assignedBy: instructorPhone,
      createdAt: new Date(),
      status: LessonStatus.PENDING,
    };

    const lessonRef = await db.collection(COLLECTIONS.LESSONS).add(lessonData);
    const lessonDoc = await lessonRef.get();
    const lessonDocData = lessonDoc.data() as LessonDocument;

    return {
      id: lessonDoc.id,
      title: lessonDocData.title,
      description: lessonDocData.description,
      assignedTo: lessonDocData.assignedTo,
      assignedBy: lessonDocData.assignedBy,
      createdAt:
        lessonDocData.createdAt instanceof Date
          ? lessonDocData.createdAt.toISOString()
          : (lessonDocData.createdAt as Timestamp).toDate().toISOString(),
      status: lessonDocData.status,
    };
  }

  async getAllStudents(): Promise<Student[]> {
    const studentsQuery = await db
      .collection(COLLECTIONS.USERS)
      .where("role", "==", Role.STUDENT)
      .get();

    return studentsQuery.docs.map((doc) => {
      const data = doc.data() as UserDocument;
      return {
        id: doc.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        createdAt:
          data.createdAt instanceof Date
            ? data.createdAt.toISOString()
            : (data.createdAt as Timestamp).toDate().toISOString(),
        updatedAt:
          data.updatedAt instanceof Date
            ? data.updatedAt.toISOString()
            : (data.updatedAt as Timestamp).toDate().toISOString(),
      };
    });
  }

  async getStudentByPhone(
    phone: string,
  ): Promise<Student & { lessons: Lesson[] }> {
    const studentQuery = await db
      .collection(COLLECTIONS.USERS)
      .where("phone", "==", phone)
      .limit(1)
      .get();

    if (studentQuery.empty) {
      throw new NotFoundError("Student");
    }

    const studentDoc = studentQuery.docs[0];
    const studentData = studentDoc.data() as UserDocument;

    const lessonsQuery = await db
      .collection(COLLECTIONS.LESSONS)
      .where("assignedTo", "array-contains", phone)
      .get();

    const lessons = lessonsQuery.docs.map((doc) => {
      const data = doc.data() as LessonDocument;
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo,
        assignedBy: data.assignedBy,
        createdAt:
          data.createdAt instanceof Date
            ? data.createdAt.toISOString()
            : (data.createdAt as Timestamp).toDate().toISOString(),
        status: data.status,
      };
    });

    return {
      id: studentDoc.id,
      name: studentData.name,
      phone: studentData.phone,
      email: studentData.email,
      role: studentData.role,
      isActive: studentData.isActive,
      createdAt:
        studentData.createdAt instanceof Date
          ? studentData.createdAt.toISOString()
          : (studentData.createdAt as Timestamp).toDate().toISOString(),
      updatedAt:
        studentData.updatedAt instanceof Date
          ? studentData.updatedAt.toISOString()
          : (studentData.updatedAt as Timestamp).toDate().toISOString(),
      lessons,
    };
  }

  async editStudent(phone: string, data: EditStudentRequest): Promise<Student> {
    const studentQuery = await db
      .collection(COLLECTIONS.USERS)
      .where("phone", "==", phone)
      .limit(1)
      .get();

    if (studentQuery.empty) {
      throw new NotFoundError("Student");
    }

    const studentRef = studentQuery.docs[0].ref;
    const updateData: Partial<UserDocument> = {
      ...data,
      updatedAt: new Date(),
    };

    await studentRef.update(updateData);
    const updatedDoc = await studentRef.get();
    const updatedData = updatedDoc.data() as UserDocument;

    return {
      id: updatedDoc.id,
      name: updatedData.name,
      phone: updatedData.phone,
      email: updatedData.email,
      role: updatedData.role,
      isActive: updatedData.isActive,
      createdAt:
        updatedData.createdAt instanceof Date
          ? updatedData.createdAt.toISOString()
          : (updatedData.createdAt as Timestamp).toDate().toISOString(),
      updatedAt:
        updatedData.updatedAt instanceof Date
          ? updatedData.updatedAt.toISOString()
          : (updatedData.updatedAt as Timestamp).toDate().toISOString(),
    };
  }

  async deleteStudent(phone: string): Promise<void> {
    const studentQuery = await db
      .collection(COLLECTIONS.USERS)
      .where("phone", "==", phone)
      .limit(1)
      .get();

    if (studentQuery.empty) {
      throw new NotFoundError("Student");
    }

    const studentRef = studentQuery.docs[0].ref;

    const lessonsQuery = await db
      .collection(COLLECTIONS.LESSONS)
      .where("assignedTo", "array-contains", phone)
      .get();

    const batch = db.batch();

    for (const doc of lessonsQuery.docs) {
      const data = doc.data() as LessonDocument;
      const updatedAssignedTo = data.assignedTo.filter((p) => p !== phone);

      if (updatedAssignedTo.length === 0) {
        batch.delete(doc.ref);
      } else {
        batch.update(doc.ref, { assignedTo: updatedAssignedTo });
      }
    }

    batch.delete(studentRef);

    await batch.commit();
  }

  async getAllLessons(): Promise<Lesson[]> {
    const lessonsQuery = await db.collection(COLLECTIONS.LESSONS).get();

    return lessonsQuery.docs.map((doc) => {
      const data = doc.data() as LessonDocument;
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo,
        assignedBy: data.assignedBy,
        createdAt:
          data.createdAt instanceof Date
            ? data.createdAt.toISOString()
            : (data.createdAt as Timestamp).toDate().toISOString(),
        status: data.status,
      };
    });
  }

  private async sendStudentOnboardingEmail(
    email: string,
    name: string,
  ): Promise<void> {
    if (!emailTransporter) {
      console.log(
        "Email transporter not configured - skipping onboarding email",
      );
      return;
    }

    const setupToken = jwt.sign(
      { email, purpose: TokenPurpose.STUDENT_SETUP },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" },
    );

    const setupLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/student-setup?token=${encodeURIComponent(setupToken)}`;

    try {
      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to Classroom Management - Account Setup Required",
        text: `Hello ${name},\n\nWelcome to our classroom management system!\n\nYour instructor has added you to the classroom. To complete your account setup and access your student dashboard, please follow these steps:\n\n1. Click the secure setup link: ${setupLink}\n2. Create your username and password\n3. Complete your account setup\n4. Log in with your new credentials\n\n⚠️ IMPORTANT: This link is secure and expires in 24 hours. Do not share it with anyone.\n\nYou will then be able to view your assigned lessons and communicate with your instructor.\n\nBest regards,\nThe Classroom Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Classroom Management!</h2>
            <p>Hello ${name},</p>
            <p>Welcome to our classroom management system!</p>
            <p>Your instructor has added you to the classroom. To complete your account setup and access your student dashboard, please follow these steps:</p>
            <ol>
              <li>Click the secure setup link below</li>
              <li>Create your username and password</li>
              <li>Complete your account setup</li>
              <li>Log in with your new credentials</li>
            </ol>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${setupLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Account Setup</a>
            </div>
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>⚠️ Security Notice:</strong> This link is secure and expires in 24 hours. Do not share it with anyone.
            </div>
            <p>You will then be able to view your assigned lessons and communicate with your instructor.</p>
            <p>Best regards,<br>The Classroom Team</p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Failed to send onboarding email:", error);
      throw new AppError("Failed to send onboarding email", 500);
    }
  }
}
