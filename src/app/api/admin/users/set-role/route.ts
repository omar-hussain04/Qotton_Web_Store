import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * POST /api/admin/users/set-role
 * Sets a user's role via Firebase Custom Claims (server-side only).
 * Body: { uid: string, role: "admin" | "user" }
 * Requires: Bearer token from an authenticated admin.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Extract Bearer token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    // 2. Verify caller's identity
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 3. Verify caller has admin custom claim
    if (!decoded.admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // 4. Parse and validate body
    const { uid, role } = await req.json();

    if (!uid || typeof uid !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid uid" },
        { status: 400 }
      );
    }

    if (!["admin", "user"].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be "admin" or "user"' },
        { status: 400 }
      );
    }

    // 5. Prevent self-demotion
    if (uid === decoded.uid && role === "user") {
      return NextResponse.json(
        { error: "Cannot remove your own admin privileges" },
        { status: 400 }
      );
    }

    // 6. Verify target user exists
    try {
      await adminAuth.getUser(uid);
    } catch {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    // 7. Set custom claims
    await adminAuth.setCustomUserClaims(uid, { admin: role === "admin" });

    // 8. Update Firestore document for display purposes
    //    (Admin SDK bypasses all security rules)
    await adminDb.collection("users").doc(uid).set(
      { role, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: `User ${uid} role set to ${role}`,
    });
  } catch (error) {
    console.error("Error setting user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
