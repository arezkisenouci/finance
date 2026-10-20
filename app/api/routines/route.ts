import { NextRequest, NextResponse } from "next/server";
import { getDb, updateDb } from "@/lib/db";
import { Routine } from "@/types/database";
import { z } from "zod";

const CreateRoutineSchema = z.object({
  title: z.string().min(1, "Routine title is required"),
  cost: z.number().positive("Routine cost must be greater than 0"),
  categoryId: z.string().default("cat_habits"),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).default("DAILY"),
  reminderTime: z.string().default("20:00"),
});

export async function GET() {
  try {
    const db = await getDb();
    const now = new Date();
    const currentMonthPrefix = now.toISOString().slice(0, 7); // YYYY-MM

    const routinesWithStats = db.routines.map((routine) => {
      // Find logs for this routine
      const routineLogs = db.routine_logs
        .filter((l) => l.routineId === routine.id)
        .sort((a, b) => b.date.localeCompare(a.date)); // Latest date first

      // Calculate streak of consecutive SKIPPED days
      let currentStreakSkipped = 0;
      for (const log of routineLogs) {
        if (log.status === "SKIPPED") {
          currentStreakSkipped++;
        } else {
          break; // Streak broken
        }
      }

      // Calculate total saved and spent this month
      const thisMonthLogs = routineLogs.filter((l) => l.date.startsWith(currentMonthPrefix));
      const totalSavedThisMonth = thisMonthLogs.reduce(
        (sum, l) => sum + (l.status === "SKIPPED" ? l.savedAmount : 0),
        0
      );
      const totalSpentThisMonth = thisMonthLogs.reduce(
        (sum, l) => sum + (l.status === "CONFIRMED" ? routine.cost : 0),
        0
      );

      return {
        ...routine,
        stats: {
          currentStreakSkipped,
          totalSavedThisMonth: parseFloat(totalSavedThisMonth.toFixed(2)),
          totalSpentThisMonth: parseFloat(totalSpentThisMonth.toFixed(2)),
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: routinesWithStats,
    });
  } catch (error) {
    console.error("[API GET /api/routines] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch routines" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateRoutineSchema.parse(body);

    const routineId = `rt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    let createdRoutine: Routine | null = null;

    await updateDb((db) => {
      createdRoutine = {
        id: routineId,
        title: validated.title,
        cost: validated.cost,
        currency: db.wallet.baseCurrency || "USD",
        categoryId: validated.categoryId,
        frequency: validated.frequency,
        reminderTime: validated.reminderTime,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      db.routines.push(createdRoutine);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Routine created successfully",
        data: createdRoutine,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API POST /api/routines] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create routine" },
      { status: 400 }
    );
  }
}
