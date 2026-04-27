import { NextRequest, NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    // ── Auth: Verify caller is an admin ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!decoded.admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Business logic (unchanged) ──
    const { title, rows } = await req.json();
    
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!email || !key || !sheetId) {
      return NextResponse.json({ success: false, error: "Credentials missing" }, { status: 400 });
    }

    // Initialize auth
    const serviceAccountAuth = new JWT({
      email: email,
      key: key.replace(/\\n/g, '\n'), // Handle literal \n if present
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo(); 
    
    // Check if sheet exists
    let sheet = doc.sheetsByTitle[title];
    const headers = ['رقم الطلب', 'تاريخ الطلب', 'قيمة الطلب (د.أ)'];

    if (sheet) {
      // If it exists, clear it and reset headers
      await sheet.clear();
      await sheet.setHeaderRow(headers);
    } else {
      // If it doesn't exist, create a new worksheet with this title
      sheet = await doc.addSheet({ title, headerValues: headers });
    }

    // Add all rows from the report
    if (rows && rows.length > 0) {
      await sheet.addRows(rows);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error syncing to Google Sheets:", error);
    return NextResponse.json({ success: false, error: "Failed to sync" }, { status: 500 });
  }
}
