import { NextRequest, NextResponse } from "next/server";
import { getExchangeRates } from "@/lib/forex";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const base = searchParams.get("base") || "USD";
    const force = searchParams.get("force") === "true";

    const ratesData = await getExchangeRates(base, force);

    return NextResponse.json({
      success: true,
      ...ratesData,
    });
  } catch (error) {
    console.error("[API GET /api/currency/rates] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch currency rates" },
      { status: 500 }
    );
  }
}
