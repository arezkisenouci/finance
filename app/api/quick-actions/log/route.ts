import { NextRequest, NextResponse } from "next/server";
import { updateDb } from "@/lib/db";
import { z } from "zod";

const QuickActionLogSchema = z.object({
  categoryId: z.string().min(1, "categoryId is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = QuickActionLogSchema.parse(body);

    const transactionId = `tx_quick_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    let newBalance = 0;
    let categoryName = "Quick Action";

    await updateDb((db) => {
      const cat = db.categories.find((c) => c.id === validated.categoryId);
      categoryName = cat ? cat.name : "Quick Expense";

      newBalance = parseFloat((db.wallet.balance - validated.amount).toFixed(2));
      db.wallet.balance = newBalance;
      db.wallet.updatedAt = new Date().toISOString();

      db.transactions.unshift({
        id: transactionId,
        title: `Quick ${categoryName}`,
        amount: validated.amount,
        type: "EXPENSE",
        categoryId: validated.categoryId,
        categoryName,
        isQuickAction: true,
        isRoutine: false,
        isRefunded: false,
        date: new Date().toISOString(),
        notes: validated.notes,
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: `Quick ${categoryName} logged`,
        data: {
          transactionId,
          amount: validated.amount,
          newBalance,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API POST /api/quick-actions/log] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to log quick action" },
      { status: 400 }
    );
  }
}
