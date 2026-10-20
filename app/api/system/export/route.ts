import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `finflow-backup-${dateStr}.json`;

    return new NextResponse(JSON.stringify(db, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[API GET /api/system/export] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export database" },
      { status: 500 }
    );
  }
}
