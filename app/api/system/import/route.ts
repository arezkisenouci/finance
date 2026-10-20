import { NextRequest, NextResponse } from "next/server";
import { writeDb } from "@/lib/db";
import { createBackup } from "@/lib/backup";
import { DatabaseSchema } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const validated = DatabaseSchema.parse(rawBody);

    // Create a safety snapshot before overwriting
    await createBackup("pre-import-safety");

    // Atomically overwrite database
    await writeDb(validated);

    return NextResponse.json({
      success: true,
      message: "Database imported and restored successfully",
      data: {
        walletBalance: validated.wallet.balance,
        transactionsCount: validated.transactions.length,
        routinesCount: validated.routines.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[API POST /api/system/import] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.errors
          ? `Schema validation failed: ${error.errors.map((e: any) => e.message).join(", ")}`
          : error.message || "Failed to import database",
      },
      { status: 400 }
    );
  }
}
