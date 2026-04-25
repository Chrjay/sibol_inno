import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Prevent duplicate initialization
if (getApps().length === 0) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

export const adminAuth = getAuth();
export const db = getFirestore();

// Firestore collection names
export const COLLECTIONS = {
  USERS: "users",
  USER_PROFILES: "userProfiles",
  PATHWAYS: "pathways",
  PATHWAY_STEPS: "pathwaySteps",
  PROGRAMS: "programs",
  CHAT_MESSAGES: "chatMessages",
} as const;
