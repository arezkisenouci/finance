import { NextRequest, NextResponse } from "next/server";
import { updateDb } from "@/lib/db";
import { RoutineLogStatusSchema } from "@/types/database";
import { z } from "zod";

const RoutineCheckInSchema = z.object({
  action: z.enum(["CONFIRMED", "SKIPPED"]),
  date: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = RoutineCheckInSchema.parse(body);

    const targetDate = validated.date || new Date().toISOString().split("T")[0];
    const nowIso = new Date().toISOString();

    let responseData: any = null;
    let errorMsg = "";

    await updateDb((db) => {
      const routine = db.routines.find((r) => r.id === id);
      if (!routine) {
        errorMsg = "Routine not found";
        return;
      }

      // Check if already logged for this date
      const existingLog = db.routine_logs.find(
        (l) => l.routineId === id && l.date === targetDate
      );
      if (existingLog) {
        errorMsg = `Routine already checked in for ${targetDate}`;
        return;
      }

      const logId = `rtl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

      if (validated.action === "CONFIRMED") {
        // User bought it -> Cut money from wallet
        const txId = `tx_rt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const newBalance = parseFloat((db.wallet.balance - routine.cost).toFixed(2));
        db.wallet.balance = newBalance;
        db.wallet.updatedAt = nowIso;

        const category = db.categories.find((c) => c.id === routine.categoryId);
        const categoryName = category ? category.name : "Habits";

        db.transactions.unshift({
          id: txId,
          title: routine.title,
          amount: routine.cost,
          type: "EXPENSE",
          categoryId: routine.categoryId,
          categoryName,
          isQuickAction: false,
          isRoutine: true,
          routineId: routine.id,
          isRefunded: false,
          date: nowIso,
          notes: "Daily routine check-in",
        });

        db.routine_logs.unshift({
          id: logId,
          routineId: routine.id,
          date: targetDate,
          status: "CONFIRMED",
          transactionId: txId,
          savedAmount: 0,
          loggedAt: nowIso,
        });

        responseData = {
          success: true,
          action: "CONFIRMED",
          message: `Expense logged for daily routine: ${routine.title}`,
          data: {
            transactionId: txId,
            amountDeducted: routine.cost,
            newBalance,
          },
        };
      } else {
        // User skipped it -> Saved money!
        db.routine_logs.unshift({
          id: logId,
          routineId: routine.id,
          date: targetDate,
          status: "SKIPPED",
          savedAmount: routine.cost,
          loggedAt: nowIso,
        });

        // Compute streak of skipped days
        const routineLogs = db.routine_logs
          .filter((l) => l.routineId === routine.id)
          .sort((a, b) => b.date.localeCompare(a.date));

        let cleanStreakDays = 0;
        for (const log of routineLogs) {
          if (log.status === "SKIPPED") {
            cleanStreakDays++;
          } else {
            break;
          }
        }

        const currentMonthPrefix = targetDate.slice(0, 7);
        const totalMonthSavings = db.routine_logs
          .filter((l) => l.routineId === routine.id && l.date.startsWith(currentMonthPrefix))
          .reduce((sum, l) => sum + (l.status === "SKIPPED" ? l.savedAmount : 0), 0);

        responseData = {
          success: true,
          action: "SKIPPED",
          message: `Awesome! You skipped this routine today and saved $${routine.cost.toFixed(2)}!`,
          data: {
            savedToday: routine.cost,
            cleanStreakDays,
            totalMonthSavings: parseFloat(totalMonthSavings.toFixed(2)),
            balanceUnchanged: db.wallet.balance,
          },
        };
      }
    });

    if (errorMsg) {
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("[API POST /api/routines/[id]/checkin] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process check-in" },
      { status: 500 }
    );
  }
}
