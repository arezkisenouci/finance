import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Find active routines that haven't been logged today
    const pendingRoutines = db.routines
      .filter((routine) => routine.isActive)
      .filter((routine) => {
        const hasLogToday = db.routine_logs.some(
          (log) => log.routineId === routine.id && log.date === todayStr
        );
        return !hasLogToday;
      })
      .map((routine) => ({
        id: routine.id,
        title: routine.title,
        cost: routine.cost,
        currency: routine.currency || "USD",
        reminderTime: routine.reminderTime,
        promptMessage: `Did you buy ${routine.title.toLowerCase()} today for $${routine.cost.toFixed(2)}?`,
      }));

    return NextResponse.json({
      success: true,
      date: todayStr,
      pendingCount: pendingRoutines.length,
      routines: pendingRoutines,
    });
  } catch (error) {
    console.error("[API GET /api/routines/pending-today] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pending daily routines" },
      { status: 500 }
    );
  }
}
