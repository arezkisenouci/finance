import { NextRequest, NextResponse } from "next/server";
import { updateDb } from "@/lib/db";
import { z } from "zod";

const DepositPayloadSchema = z.object({
  amount: z.number().positive("Deposit amount must be positive"),
  title: z.string().min(1, "Title is required"),
  category: z.string().default("Income"),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = DepositPayloadSchema.parse(body);

    const transactionId = `tx_dep_${Date.now()}`;
    let newBalance = 0;

    await updateDb((db) => {
      newBalance = parseFloat((db.wallet.balance + validated.amount).toFixed(2));
      db.wallet.balance = newBalance;
      db.wallet.updatedAt = new Date().toISOString();

      db.transactions.unshift({
        id: transactionId,
        title: validated.title,
        amount: validated.amount,
        type: "INCOME",
        categoryId: "cat_income",
        categoryName: validated.category,
        isQuickAction: false,
        isRoutine: false,
        isRefunded: false,
        date: validated.date || new Date().toISOString(),
        notes: validated.notes,
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Funds deposited successfully",
        data: {
          newBalance,
          transactionId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API POST /api/wallet/deposit] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Invalid payload" },
      { status: 400 }
    );
  }
}
