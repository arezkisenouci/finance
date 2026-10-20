import { NextRequest, NextResponse } from "next/server";
import { convertCurrency } from "@/lib/forex";
import { z } from "zod";

const ConvertPayloadSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  from: z.string().min(3).max(4),
  to: z.string().min(3).max(4),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, from, to } = ConvertPayloadSchema.parse(body);

    const { convertedAmount, rate } = await convertCurrency(amount, from, to);

    return NextResponse.json({
      success: true,
      data: {
        originalAmount: amount,
        fromCurrency: from.toUpperCase(),
        convertedAmount,
        toCurrency: to.toUpperCase(),
        rate,
      },
    });
  } catch (error: any) {
    console.error("[API POST /api/currency/convert] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to convert currency" },
      { status: 400 }
    );
  }
}
