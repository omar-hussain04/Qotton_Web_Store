/**
 * One-time bootstrap script to set the first admin via Custom Claims.
 *
 * Usage:
 *   npx tsx src/scripts/set-first-admin.ts
 *
 * Prerequisites:
 *   - .env must have GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY
 *   - The service account must have Firebase Admin SDK permissions
 *
 * After running:
 *   - The target user will have admin: true custom claim
 *   - They need to log out and back in for the claim to take effect in the client
 *   - Deploy the updated firestore.rules to enforce custom-claims-based isAdmin()
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env from project root
dotenv.config({ path: resolve(__dirname, "../../.env") });

const ADMIN_EMAIL = "cotton.oaa@gmail.com";

async function main() {
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
    console.error("❌ Missing credentials in .env");
    process.exit(1);
  }

  const app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });

  const auth = getAuth(app);

  try {
    // Find user by email
    const user = await auth.getUserByEmail(ADMIN_EMAIL);
    console.log(`Found user: ${user.uid} (${user.email})`);

    // Set admin custom claim
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Custom claim { admin: true } set for ${ADMIN_EMAIL}`);
    console.log(
      "⚠️  The user must log out and back in for the claim to take effect."
    );
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
