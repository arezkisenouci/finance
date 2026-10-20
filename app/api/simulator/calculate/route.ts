import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CalculateSimulatorSchema = z.object({
  dailyExpenseAmount: z.number().positive("Daily expense must be greater than 0"),
  durationMonths: z.number().int().min(1).default(12),
  annualInterestRate: z.number().min(0).default(7.0),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dailyExpenseAmount, durationMonths, annualInterestRate } =
      CalculateSimulatorSchema.parse(body);

    const monthlyExpense = parseFloat((dailyExpenseAmount * (365 / 12)).toFixed(2));
    const totalCashSaved = parseFloat((dailyExpenseAmount * (durationMonths * (365 / 12))).toFixed(2));

    // Future Value of monthly contributions formula:
    // FV = P * [ ((1 + r/12)^n - 1) / (r/12) ]
    let totalInvestedReturn = totalCashSaved;
    let interestEarned = 0;

    if (annualInterestRate > 0) {
      const monthlyRate = annualInterestRate / 100 / 12;
      const compoundFactor = Math.pow(1 + monthlyRate, durationMonths);
      totalInvestedReturn = parseFloat(
        (monthlyExpense * ((compoundFactor - 1) / monthlyRate)).toFixed(2)
      );
      interestEarned = parseFloat((totalInvestedReturn - totalCashSaved).toFixed(2));
    }

    return NextResponse.json({
      success: true,
      data: {
        dailyAmount: dailyExpenseAmount,
        monthlyExpense,
        durationMonths,
        annualInterestRate,
        totalCashSaved,
        totalInvestedReturn,
        interestEarned,
      },
    });
  } catch (error: any) {
    console.error("[API POST /api/simulator/calculate] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to calculate simulation" },
      { status: 400 }
    );
  }
}
