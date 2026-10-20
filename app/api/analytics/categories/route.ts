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

    const { filtered } = filterTransactionsByPeriod(
      db.transactions,
      period,
      startDate,
      endDate
    );

    const categoryTotals: Record<string, { total: number; name: string }> = {};
    let totalExpenseSum = 0;

    for (const t of filtered) {
      if (t.type === "EXPENSE" && !t.isRefunded) {
        totalExpenseSum += t.amount;
        if (!categoryTotals[t.categoryId]) {
          const cat = db.categories.find((c) => c.id === t.categoryId);
          categoryTotals[t.categoryId] = {
            total: 0,
            name: cat ? cat.name : t.categoryName || "Other",
          };
        }
        categoryTotals[t.categoryId].total += t.amount;
      }
    }

    const result = Object.entries(categoryTotals).map(([categoryId, val]) => {
      const percentage =
        totalExpenseSum > 0
          ? parseFloat(((val.total / totalExpenseSum) * 100).toFixed(2))
          : 0;

      return {
        categoryId,
        categoryName: val.name,
        total: parseFloat(val.total.toFixed(2)),
        percentage,
      };
    });

    // Sort descending by total
    result.sort((a, b) => b.total - a.total);

    return NextResponse.json({
      success: true,
      period,
      totalExpenseSum: parseFloat(totalExpenseSum.toFixed(2)),
      data: result,
    });
  } catch (error) {
    console.error("[API GET /api/analytics/categories] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to compute category breakdown" },
      { status: 500 }
    );
  }
}
