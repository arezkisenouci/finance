import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const DEFAULT_PRESETS = [
  { id: "cat_breakfast", name: "Breakfast", icon: "Croissant", defaultAmount: 7.50 },
  { id: "cat_lunch", name: "Lunch", icon: "Salad", defaultAmount: 14.00 },
  { id: "cat_dinner", name: "Dinner", icon: "Utensils", defaultAmount: 22.00 },
  { id: "cat_transport", name: "Transport", icon: "Car", defaultAmount: 4.50 },
];

export async function GET() {
  try {
    const db = await getDb();

    const presetsWithAverages = DEFAULT_PRESETS.map((preset) => {
      // Find matching transactions to calculate dynamic average
      const matchingTxs = db.transactions
        .filter((t) => t.categoryId === preset.id && t.type === "EXPENSE" && !t.isRefunded)
        .slice(0, 10);

      let recentAverage = preset.defaultAmount;
      if (matchingTxs.length > 0) {
        const sum = matchingTxs.reduce((acc, t) => acc + t.amount, 0);
        recentAverage = parseFloat((sum / matchingTxs.length).toFixed(2));
      }

      return {
        ...preset,
        recentAverage,
      };
    });

    return NextResponse.json({
      success: true,
      data: presetsWithAverages,
    });
  } catch (error) {
    console.error("[API GET /api/quick-actions] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quick action presets" },
      { status: 500 }
    );
  }
}
