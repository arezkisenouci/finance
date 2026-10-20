import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    return NextResponse.json({
      success: true,
      data: db.categories,
    });
  } catch (error) {
    console.error("[API GET /api/categories] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
