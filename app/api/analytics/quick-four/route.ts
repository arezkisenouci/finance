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

    const quickFourMap: Record<string, { total: number; count: number; name: string }> = {
      cat_breakfast: { total: 0, count: 0, name: "Breakfast" },
      cat_lunch: { total: 0, count: 0, name: "Lunch" },
      cat_dinner: { total: 0, count: 0, name: "Dinner" },
      cat_transport: { total: 0, count: 0, name: "Transport" },
    };

    let grandTotalQuickFour = 0;

    for (const t of filtered) {
      if (t.type === "EXPENSE" && !t.isRefunded && quickFourMap[t.categoryId]) {
        quickFourMap[t.categoryId].total += t.amount;
        quickFourMap[t.categoryId].count += 1;
        grandTotalQuickFour += t.amount;
      }
    }

    const categoriesResult: Record<string, any> = {};
    for (const [key, val] of Object.entries(quickFourMap)) {
      const percentage =
        grandTotalQuickFour > 0
          ? parseFloat(((val.total / grandTotalQuickFour) * 100).toFixed(2))
          : 0;

      const cleanKey = val.name.toLowerCase();
      categoriesResult[cleanKey] = {
        categoryId: key,
        name: val.name,
        total: parseFloat(val.total.toFixed(2)),
        count: val.count,
        percentage,
      };
    }

    return NextResponse.json({
      success: true,
      period,
      data: {
        grandTotalQuickFour: parseFloat(grandTotalQuickFour.toFixed(2)),
        categories: categoriesResult,
      },
    });
  } catch (error) {
    console.error("[API GET /api/analytics/quick-four] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to compute Quick Four analytics" },
      { status: 500 }
    );
  }
}
