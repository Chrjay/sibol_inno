import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

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

/**
 * Apply Firestore security rules from firestore.rules file.
 * Uses the Firebase REST API since Admin SDK doesn't expose a rules deployment method.
 * This runs once at server startup.
 */
export async function applyFirestoreSecurityRules(): Promise<void> {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      console.warn("[Firestore Rules] FIREBASE_PROJECT_ID not set, skipping rules deployment.");
      return;
    }

    // Find the rules file relative to the project root
    const rulesPath = join(process.cwd(), "firestore.rules");
    if (!existsSync(rulesPath)) {
      console.warn("[Firestore Rules] firestore.rules file not found, skipping.");
      return;
    }

    const rulesContent = readFileSync(rulesPath, "utf-8");

    // Get an access token from the Admin SDK credential
    const app = getApps()[0];
    const credential = (app as any).options.credential;
    const tokenResult = await credential.getAccessToken();
    const accessToken = tokenResult.access_token;

    // Use Firebase Management API to deploy the rules
    const response = await fetch(
      `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: {
            files: [
              {
                name: "firestore.rules",
                content: rulesContent,
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.warn("[Firestore Rules] Failed to create ruleset:", err);
      return;
    }

    const ruleset = await response.json() as { name: string };
    const rulesetName = ruleset.name;

    // Release the ruleset to the default Firestore database
    const releaseResponse = await fetch(
      `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          release: {
            name: `projects/${projectId}/releases/cloud.firestore`,
            rulesetName,
          },
        }),
      }
    );

    if (!releaseResponse.ok) {
      const err = await releaseResponse.text();
      console.warn("[Firestore Rules] Failed to release ruleset:", err);
      return;
    }

    console.log("[Firestore Rules] Security rules deployed successfully.");
  } catch (err) {
    console.warn("[Firestore Rules] Error deploying rules (non-fatal):", err);
  }
}
