import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const targetCurrenciesParam = searchParams.get("targetCurrencies") || "EUR,GBP,JPY,DZD";
    const targetCurrencies = targetCurrenciesParam.split(",").map((c) => c.trim().toUpperCase());

    const { balance, baseCurrency, updatedAt } = db.wallet;
    const rates = db.exchange_rates_cache.rates || {};

    const convertedBalances: Record<string, number> = {};
    for (const currency of targetCurrencies) {
      if (rates[currency]) {
        convertedBalances[currency] = parseFloat((balance * rates[currency]).toFixed(2));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        balance,
        baseCurrency,
        updatedAt,
        convertedBalances,
      },
    });
  } catch (error) {
    console.error("[API GET /api/wallet] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wallet details" },
      { status: 500 }
    );
  }
}
