import { NextRequest, NextResponse } from "next/server";
import { updateDb } from "@/lib/db";
import { Transaction } from "@/types/database";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is acceptable
    }

    let originalTransaction: Transaction | null = null;
    let refundTransaction: Transaction | null = null;
    let newBalance = 0;
    let errorMsg = "";

    await updateDb((db) => {
      const tx = db.transactions.find((t) => t.id === id);

      if (!tx) {
        errorMsg = "Transaction not found";
        return;
      }

      if (tx.type !== "EXPENSE") {
        errorMsg = "Only EXPENSE transactions can be refunded";
        return;
      }

      if (tx.isRefunded) {
        errorMsg = "This transaction has already been refunded";
        return;
      }

      const nowIso = new Date().toISOString();
      tx.isRefunded = true;
      tx.refundedAt = nowIso;
      originalTransaction = { ...tx };

      const refundId = `tx_refund_${Date.now()}`;
      refundTransaction = {
        id: refundId,
        title: `Refund: ${tx.title}`,
        amount: tx.amount,
        type: "REFUND",
        categoryId: tx.categoryId,
        categoryName: tx.categoryName,
        isQuickAction: false,
        isRoutine: false,
        isRefunded: false,
        originalTransactionId: tx.id,
        date: nowIso,
        notes: body.reason ? `Reason: ${body.reason}` : "Item return / refund",
      };

      newBalance = parseFloat((db.wallet.balance + tx.amount).toFixed(2));
      db.wallet.balance = newBalance;
      db.wallet.updatedAt = nowIso;
      db.transactions.unshift(refundTransaction);
    });

    if (errorMsg) {
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Item marked as refunded. Balance credited.",
      data: {
        originalTransaction,
        refundTransaction,
        newBalance,
      },
    });
  } catch (error: any) {
    console.error("[API POST /api/transactions/[id]/refund] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process refund" },
      { status: 500 }
    );
  }
}
