import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function calculateProjections(dailyCost: number) {
  const oneMonth = parseFloat((dailyCost * 30).toFixed(2));
  const threeMonths = parseFloat((dailyCost * 90).toFixed(2));
  const sixMonths = parseFloat((dailyCost * 180).toFixed(2));
  const oneYear = parseFloat((dailyCost * 365).toFixed(2));

  // 5 Years with monthly compounding at 7% annual return
  const monthlyDeposit = dailyCost * (365 / 12);
  const monthlyRate = 0.07 / 12;
  const months = 60;
  const compoundFactor = Math.pow(1 + monthlyRate, months);
  const fiveYearInvestedAt7Percent = parseFloat(
    (monthlyDeposit * ((compoundFactor - 1) / monthlyRate)).toFixed(2)
  );

  return {
    oneMonth,
    threeMonths,
    sixMonths,
    oneYear,
    fiveYearInvestedAt7Percent,
  };
}

export async function GET() {
  try {
    const db = await getDb();
    const activeRoutines = db.routines.filter((r) => r.isActive);

    const routinesProjections = activeRoutines.map((routine) => {
      const proj = calculateProjections(routine.cost);
      return {
        routineId: routine.id,
        title: routine.title,
        dailyCost: routine.cost,
        currency: routine.currency || "USD",
        projections: proj,
        purchasingPowerEquivalents: [
          `1 Month: 1x Sony WH-1000XM5 Headphones ($${proj.oneMonth})`,
          `6 Months: 1x High-End Custom PC Build ($${proj.sixMonths})`,
          `1 Year: 1x M3 Max MacBook Pro or International Trip ($${proj.oneYear})`,
          `5 Years (Invested @ 7%): Car or Real-Estate Down Payment ($${proj.fiveYearInvestedAt7Percent.toLocaleString()})`,
        ],
      };
    });

    const totalDailyCost = activeRoutines.reduce((sum, r) => sum + r.cost, 0);
    const combinedProjections = calculateProjections(totalDailyCost);

    return NextResponse.json({
      success: true,
      data: {
        totalDailyHabitCost: parseFloat(totalDailyCost.toFixed(2)),
        combinedProjections,
        routines: routinesProjections,
      },
    });
  } catch (error) {
    console.error("[API GET /api/simulator/routines] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate routine projections" },
      { status: 500 }
    );
  }
}
