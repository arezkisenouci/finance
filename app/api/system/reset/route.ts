import { NextResponse } from "next/server";
import { writeDb, DEFAULT_DATABASE } from "@/lib/db";
import { createBackup } from "@/lib/backup";

export async function POST() {
  try {
    await createBackup("pre-reset-safety");
    await writeDb(DEFAULT_DATABASE);

    return NextResponse.json({
      success: true,
      message: "Database reset to initial defaults successfully",
    });
  } catch (error) {
    console.error("[API POST /api/system/reset] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset database" },
      { status: 500 }
    );
  }
}
