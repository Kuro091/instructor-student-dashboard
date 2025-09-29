import admin from "firebase-admin";
import { FirebaseCollections } from "../types/firebase.types";

if (!admin.apps.length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  let serviceAccount = null;

  if (serviceAccountKey) {
    try {
      const decodedKey = Buffer.from(serviceAccountKey, "base64").toString(
        "utf-8",
      );
      serviceAccount = JSON.parse(decodedKey);
    } catch (error) {
      console.error("Failed to decode Firebase service account key:", error);
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    console.log("✅ Firebase initialized successfully");
  } else {
    console.warn("⚠️ Firebase not configured - using mock mode");
    // Mock Firebase for development
    admin.initializeApp({
      projectId: "mock-project",
    });
  }
}

export const db = admin.firestore();
export const auth = admin.auth();

export const COLLECTIONS = {
  USERS: "users",
  ACCESS_CODES: "accessCodes",
  LESSONS: "lessons",
  STUDENT_LESSONS: "studentLessons",
  CONVERSATIONS: "conversations",
  MESSAGES: "messages",
} as const satisfies Record<string, keyof FirebaseCollections>;

export type CollectionName = keyof FirebaseCollections;

export const getCollectionName = (name: CollectionName): string => name;
