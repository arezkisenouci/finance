import { NextRequest, NextResponse } from "next/server";
import { updateDb } from "@/lib/db";
import { z } from "zod";

const BaseCurrencySchema = z.object({
  newBaseCurrency: z.string().min(3).max(4),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { newBaseCurrency } = BaseCurrencySchema.parse(body);
    const upperCurrency = newBaseCurrency.toUpperCase();

    let previousBalance = 0;
    let previousCurrency = "USD";
    let newBalance = 0;
    let rateApplied = 1;

    await updateDb((db) => {
      previousBalance = db.wallet.balance;
      previousCurrency = db.wallet.baseCurrency;

      if (previousCurrency === upperCurrency) {
        newBalance = previousBalance;
        return;
      }

      const rates = db.exchange_rates_cache.rates || {};
      rateApplied = rates[upperCurrency] || 1;

      newBalance = parseFloat((previousBalance * rateApplied).toFixed(2));
      db.wallet.balance = newBalance;
      db.wallet.baseCurrency = upperCurrency;
      db.wallet.updatedAt = new Date().toISOString();
    });

    return NextResponse.json({
      success: true,
      message: `Base currency updated to ${upperCurrency}`,
      data: {
        previousBalance,
        previousCurrency,
        newBalance,
        newBaseCurrency: upperCurrency,
        rateApplied,
      },
    });
  } catch (error: any) {
    console.error("[API PATCH /api/wallet/base-currency] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update base currency" },
      { status: 400 }
    );
  }
}
