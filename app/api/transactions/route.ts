import { NextRequest, NextResponse } from "next/server";
import { getDb, updateDb } from "@/lib/db";
import { Transaction, TransactionTypeSchema } from "@/types/database";
import { z } from "zod";

const CreateTransactionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be positive"),
  type: TransactionTypeSchema.default("EXPENSE"),
  categoryId: z.string(),
  isQuickAction: z.boolean().default(false),
  isRoutine: z.boolean().default(false),
  routineId: z.string().optional(),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);

    const period = searchParams.get("period");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const categoryId = searchParams.get("categoryId");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let transactions = [...db.transactions];

    // Filter by type
    if (type) {
      transactions = transactions.filter((t) => t.type === type);
    }

    // Filter by category
    if (categoryId) {
      transactions = transactions.filter((t) => t.categoryId === categoryId);
    }

    // Filter by date / period
    const now = new Date();
    if (period === "today") {
      const todayStr = now.toISOString().split("T")[0];
      transactions = transactions.filter((t) => t.date.startsWith(todayStr));
    } else if (period === "this_week") {
      const dayOfWeek = now.getDay() || 7; // Monday = 1
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
      startOfWeek.setHours(0, 0, 0, 0);
      transactions = transactions.filter((t) => new Date(t.date) >= startOfWeek);
    } else if (period === "this_month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      transactions = transactions.filter((t) => new Date(t.date) >= startOfMonth);
    } else if (period === "custom" && (startDateParam || endDateParam)) {
      if (startDateParam) {
        const start = new Date(startDateParam);
        transactions = transactions.filter((t) => new Date(t.date) >= start);
      }
      if (endDateParam) {
        const end = new Date(endDateParam);
        end.setHours(23, 59, 59, 999);
        transactions = transactions.filter((t) => new Date(t.date) <= end);
      }
    }

    // Sort descending by date
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalCount = transactions.length;
    const startIndex = (page - 1) * limit;
    const paginated = transactions.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: {
        totalCount,
        page,
        limit,
        transactions: paginated,
      },
    });
  } catch (error) {
    console.error("[API GET /api/transactions] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateTransactionSchema.parse(body);

    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    let createdTransaction: Transaction | null = null;
    let updatedBalance = 0;

    await updateDb((db) => {
      const category = db.categories.find((c) => c.id === validated.categoryId);
      const categoryName = category ? category.name : "General";

      createdTransaction = {
        id: transactionId,
        title: validated.title,
        amount: validated.amount,
        type: validated.type,
        categoryId: validated.categoryId,
        categoryName,
        isQuickAction: validated.isQuickAction,
        isRoutine: validated.isRoutine,
        routineId: validated.routineId,
        isRefunded: false,
        date: validated.date || new Date().toISOString(),
        notes: validated.notes,
      };

      // Mutate wallet balance
      if (validated.type === "EXPENSE") {
        updatedBalance = parseFloat((db.wallet.balance - validated.amount).toFixed(2));
      } else {
        updatedBalance = parseFloat((db.wallet.balance + validated.amount).toFixed(2));
      }

      db.wallet.balance = updatedBalance;
      db.wallet.updatedAt = new Date().toISOString();
      db.transactions.unshift(createdTransaction);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Transaction logged successfully",
        data: {
          transaction: createdTransaction,
          updatedBalance,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API POST /api/transactions] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Invalid transaction payload" },
      { status: 400 }
    );
  }
}
