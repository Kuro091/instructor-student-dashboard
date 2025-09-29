import { db, COLLECTIONS } from "../../shared/config/firebase";
import {
  MarkLessonDoneRequest,
  EditProfileRequest,
  StudentLesson,
  StudentProfile,
} from "./student.types";
import {
  UserDocument,
  LessonDocument,
  LessonStatus,
} from "../../shared/types/firebase.types";
import { NotFoundError } from "../../shared/utils/error.utils";

export class StudentService {
  async getMyLessons(phone: string): Promise<StudentLesson[]> {
    const lessonsQuery = await db
      .collection(COLLECTIONS.LESSONS)
      .where("assignedTo", "array-contains", phone)
      .orderBy("createdAt", "desc")
      .get();

    return lessonsQuery.docs.map((doc) => {
      const data = doc.data() as LessonDocument;
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo,
        assignedBy: data.assignedBy,
        createdAt: data.createdAt,
        status: data.status,
        completedAt: data.status === "completed" ? new Date() : undefined,
      };
    });
  }

  async markLessonDone(
    phone: string,
    data: MarkLessonDoneRequest,
  ): Promise<StudentLesson> {
    const lessonQuery = await db
      .collection(COLLECTIONS.LESSONS)
      .where("assignedTo", "array-contains", phone)
      .get();

    const lessonDoc = lessonQuery.docs.find((doc) => doc.id === data.lessonId);

    if (!lessonDoc) {
      throw new NotFoundError("Lesson");
    }

    const lessonRef = lessonDoc.ref;
    const updateData: Partial<LessonDocument> = {
      status: LessonStatus.COMPLETED,
    };

    await lessonRef.update(updateData);
    const updatedDoc = await lessonRef.get();
    const updatedData = updatedDoc.data() as LessonDocument;

    return {
      id: updatedDoc.id,
      title: updatedData.title,
      description: updatedData.description,
      assignedTo: updatedData.assignedTo,
      assignedBy: updatedData.assignedBy,
      createdAt: updatedData.createdAt,
      status: updatedData.status,
      completedAt: new Date(),
    };
  }

  async editProfile(
    phone: string,
    data: EditProfileRequest,
  ): Promise<StudentProfile> {
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
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
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
      createdAt: updatedData.createdAt,
      updatedAt: updatedData.updatedAt,
    };
  }
}
