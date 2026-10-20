import { NextRequest, NextResponse } from "next/server";
import { getDb, updateDb } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const transaction = db.transactions.find((t) => t.id === id);

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("[API GET /api/transactions/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let amountRestored = 0;
    let newBalance = 0;
    let found = false;

    await updateDb((db) => {
      const index = db.transactions.findIndex((t) => t.id === id);
      if (index === -1) return;

      found = true;
      const tx = db.transactions[index];

      // If this was an active, unrefunded expense, undo the deduction
      if (tx.type === "EXPENSE" && !tx.isRefunded) {
        amountRestored = tx.amount;
        newBalance = parseFloat((db.wallet.balance + tx.amount).toFixed(2));
      } else if (tx.type === "INCOME") {
        newBalance = parseFloat((db.wallet.balance - tx.amount).toFixed(2));
      } else {
        newBalance = db.wallet.balance;
      }

      db.wallet.balance = newBalance;
      db.wallet.updatedAt = new Date().toISOString();
      db.transactions.splice(index, 1);
    });

    if (!found) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transaction deleted. Balance restored.",
      data: {
        deletedTransactionId: id,
        amountRestored,
        newBalance,
      },
    });
  } catch (error: any) {
    console.error("[API DELETE /api/transactions/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
