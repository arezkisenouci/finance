import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { filterTransactionsByPeriod } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "this_month";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const { filtered, daysInPeriod } = filterTransactionsByPeriod(
      db.transactions,
      period,
      startDate,
      endDate
    );

    let totalSpent = 0;
    let totalIncome = 0;
    let routineExpensesTotal = 0;

    for (const t of filtered) {
      if (t.type === "EXPENSE" && !t.isRefunded) {
        totalSpent += t.amount;
        if (t.isRoutine) {
          routineExpensesTotal += t.amount;
        }
      } else if (t.type === "INCOME") {
        totalIncome += t.amount;
      }
    }

    const netSavings = parseFloat((totalIncome - totalSpent).toFixed(2));
    const dailyAverage = parseFloat((totalSpent / daysInPeriod).toFixed(2));
    const discretionaryExpensesTotal = parseFloat(
      Math.max(0, totalSpent - routineExpensesTotal).toFixed(2)
    );

    return NextResponse.json({
      success: true,
      period,
      data: {
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        netSavings,
        dailyAverage,
        routineExpensesTotal: parseFloat(routineExpensesTotal.toFixed(2)),
        discretionaryExpensesTotal,
      },
    });
  } catch (error) {
    console.error("[API GET /api/analytics/summary] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to compute analytics summary" },
      { status: 500 }
    );
  }
}
