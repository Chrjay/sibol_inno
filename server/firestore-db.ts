import { db, COLLECTIONS } from "./firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

// ─── User Profile ────────────────────────────────────────────────────────────

export interface UserProfile {
  userId: string;
  educationLevel?: string;
  skills?: string[];
  location?: string;
  dependents?: number;
  monthlyIncome?: string;
  goals?: string;
  onboardingComplete?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const doc = await db.collection(COLLECTIONS.USER_PROFILES).doc(userId).get();
  if (!doc.exists) return null;
  return { userId, ...doc.data() } as UserProfile;
}

export async function saveUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  const ref = db.collection(COLLECTIONS.USER_PROFILES).doc(userId);
  await ref.set(
    {
      ...data,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

// ─── Pathway ─────────────────────────────────────────────────────────────────

export interface Pathway {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt: number;
}

export interface PathwayStep {
  id: string;
  pathwayId: string;
  stepNumber: number;
  title: string;
  description?: string;
  estimatedDuration?: string;
  resources?: string[];
  isCompleted: boolean;
  completedAt?: number;
}

export async function getActivePathway(userId: string): Promise<Pathway | null> {
  const snap = await db
    .collection(COLLECTIONS.PATHWAYS)
    .where("userId", "==", userId)
    .where("isActive", "==", true)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Pathway;
}

export async function createPathwayWithSteps(
  userId: string,
  pathway: { title: string; description: string; category: string },
  steps: { stepNumber: number; title: string; description: string; estimatedDuration: string; resources: string[] }[]
): Promise<string> {
  // Deactivate existing pathways
  const existing = await db
    .collection(COLLECTIONS.PATHWAYS)
    .where("userId", "==", userId)
    .where("isActive", "==", true)
    .get();
  const batch = db.batch();
  existing.docs.forEach((doc) => batch.update(doc.ref, { isActive: false }));

  // Create new pathway
  const pathwayRef = db.collection(COLLECTIONS.PATHWAYS).doc();
  batch.set(pathwayRef, {
    userId,
    ...pathway,
    isActive: true,
    createdAt: Date.now(),
  });

  // Create steps
  for (const step of steps) {
    const stepRef = db.collection(COLLECTIONS.PATHWAY_STEPS).doc();
    batch.set(stepRef, {
      pathwayId: pathwayRef.id,
      ...step,
      isCompleted: false,
    });
  }

  await batch.commit();
  return pathwayRef.id;
}

export async function getPathwaySteps(pathwayId: string): Promise<PathwayStep[]> {
  const snap = await db
    .collection(COLLECTIONS.PATHWAY_STEPS)
    .where("pathwayId", "==", pathwayId)
    .orderBy("stepNumber", "asc")
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PathwayStep));
}

export async function markStepComplete(stepId: string): Promise<void> {
  await db.collection(COLLECTIONS.PATHWAY_STEPS).doc(stepId).update({
    isCompleted: true,
    completedAt: Date.now(),
  });
}

export async function markStepIncomplete(stepId: string): Promise<void> {
  await db.collection(COLLECTIONS.PATHWAY_STEPS).doc(stepId).update({
    isCompleted: false,
    completedAt: FieldValue.delete(),
  });
}

// ─── Programs ────────────────────────────────────────────────────────────────

export interface Program {
  id: string;
  name: string;
  organization?: string;
  category: string;
  description?: string;
  eligibility?: string;
  benefits?: string;
  howToApply?: string;
  contactInfo?: string;
  website?: string;
  isActive: boolean;
}

export async function getPrograms(category?: string): Promise<Program[]> {
  let query = db.collection(COLLECTIONS.PROGRAMS).where("isActive", "==", true) as FirebaseFirestore.Query;
  if (category) {
    query = query.where("category", "==", category);
  }
  const snap = await query.get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Program));
}

export async function getProgramById(id: string): Promise<Program | null> {
  const doc = await db.collection(COLLECTIONS.PROGRAMS).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Program;
}

export async function seedPrograms(programs: Omit<Program, "id">[]): Promise<void> {
  // Check if already seeded
  const snap = await db.collection(COLLECTIONS.PROGRAMS).limit(1).get();
  if (!snap.empty) return; // Already seeded

  const batch = db.batch();
  for (const program of programs) {
    const ref = db.collection(COLLECTIONS.PROGRAMS).doc();
    batch.set(ref, program);
  }
  await batch.commit();
  console.log("[Firestore] Programs seeded successfully");
}

// ─── Chat Messages ────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export async function getChatHistory(userId: string): Promise<ChatMessage[]> {
  const snap = await db
    .collection(COLLECTIONS.CHAT_MESSAGES)
    .where("userId", "==", userId)
    .orderBy("createdAt", "asc")
    .limit(50)
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ChatMessage));
}

export async function addChatMessage(
  userId: string,
  role: "user" | "assistant",
  content: string
): Promise<string> {
  const ref = db.collection(COLLECTIONS.CHAT_MESSAGES).doc();
  await ref.set({ userId, role, content, createdAt: Date.now() });
  return ref.id;
}

export async function clearChatHistory(userId: string): Promise<void> {
  const snap = await db
    .collection(COLLECTIONS.CHAT_MESSAGES)
    .where("userId", "==", userId)
    .get();
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}
