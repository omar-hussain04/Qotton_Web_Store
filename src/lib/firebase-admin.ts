/**
 * Firebase Admin SDK — Server-side only
 * NEVER import this file from client components ("use client").
 * Only use in API routes (src/app/api/) and server components.
 */
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail =
    process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL ||
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (
    process.env.FIREBASE_PRIVATE_KEY ||
    process.env.GOOGLE_PRIVATE_KEY ||
    ""
  ).replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin SDK credentials. " +
        "Set NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const adminApp = getAdminApp();

/** Firebase Admin Auth — for verifying tokens & setting custom claims */
export const adminAuth = getAuth(adminApp);

/** Firebase Admin Firestore — bypasses all security rules */
export const adminDb = getFirestore(adminApp);
