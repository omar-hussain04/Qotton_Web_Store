import { NextResponse } from "next/server";
import { setDoc, doc } from "firebase/firestore";
import { productsCollection } from "@/lib/db";
import { mockProducts } from "@/lib/data";

export async function GET(req: Request) {
  // Always require the SEED_SECRET header — no dev-mode bypass
  const seedSecret = process.env.SEED_SECRET;

  if (!seedSecret) {
    console.warn("⚠️ SEED_SECRET env var is not set — seed endpoint is disabled.");
    return NextResponse.json(
      { error: "Seed endpoint is disabled. Set SEED_SECRET to enable." },
      { status: 503 }
    );
  }

  const providedSecret = req.headers.get("x-seed-secret");
  if (providedSecret !== seedSecret) {
    return NextResponse.json(
      { error: "Unauthorized. Invalid or missing x-seed-secret header." },
      { status: 401 }
    );
  }

  if (process.env.NODE_ENV === "production") {
    console.warn("⚠️ Seed endpoint called in PRODUCTION by authorized client.");
  }

  try {
    let count = 0;
    for (const product of mockProducts) {
      const productRef = doc(productsCollection, product.id);
      await setDoc(productRef, product);
      count++;
    }
    return NextResponse.json({ message: `Successfully seeded ${count} products to Firestore.` });
  } catch (error: unknown) {
    console.error("Error seeding DB:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
