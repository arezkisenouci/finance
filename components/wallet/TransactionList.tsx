"use client";

import React, { useState } from "react";
import { Transaction } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import {
  RotateCcw,
  Trash2,
  Laptop,
  ShoppingBag,
  Croissant,
  Salad,
  Utensils,
  Car,
  Flame,
  ArrowDownLeft,
  Receipt,
} from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  displayCurrency?: string;
  exchangeRate?: number;
  onTransactionMutated: () => void;
  isLoading?: boolean;
}

export function TransactionList({
  transactions,
  displayCurrency = "USD",
  exchangeRate = 1,
  onTransactionMutated,
  isLoading = false,
}: TransactionListProps) {
  const [actingId, setActingId] = useState<string | null>(null);

  const getCategoryIcon = (catId?: string) => {
    switch (catId) {
      case "cat_breakfast":
        return Croissant;
      case "cat_lunch":
        return Salad;
      case "cat_dinner":
        return Utensils;
      case "cat_transport":
        return Car;
      case "cat_habits":
        return Flame;
      case "cat_tech":
        return Laptop;
      case "cat_shopping":
        return ShoppingBag;
      case "cat_income":
        return ArrowDownLeft;
      default:
        return Receipt;
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Undo/Delete mistake: "${title}"?\n\nThe amount will be restored back to your wallet balance.`)) {
      return;
    }

    setActingId(id);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      onTransactionMutated();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActingId(null);
    }
  };

  const handleRefund = async (id: string, title: string) => {
    const reason = prompt(`Return / Refund "${title}":\n\nEnter refund reason or tap OK to confirm.`);
    if (reason === null) return;

    setActingId(id);
    try {
      const res = await fetch(`/api/transactions/${id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process refund");
      onTransactionMutated();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-slate-900/40 animate-pulse border border-slate-800/40" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60 my-2">
        <Receipt className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
        <p className="text-xs font-semibold text-slate-300">No transactions found</p>
        <p className="text-[11px] text-slate-500 mt-0.5">Use "+ Add Expense" or Quick Actions to start tracking</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const IconComponent = getCategoryIcon(tx.categoryId);
        const isExpense = tx.type === "EXPENSE";
        const isIncome = tx.type === "INCOME";
        const isRefund = tx.type === "REFUND";
        const isBusy = actingId === tx.id;

        // Convert transaction amount based on active display currency
        const convertedAmount = tx.amount * exchangeRate;

        return (
          <div
            key={tx.id}
            className={`p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 transition flex flex-col gap-2 ${
              tx.isRefunded ? "opacity-60 bg-slate-950/60" : ""
            }`}
          >
            {/* Main Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isIncome
                      ? "bg-emerald-500/15 text-emerald-400"
                      : isRefund
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className={`text-xs font-semibold text-slate-100 ${tx.isRefunded ? "line-through text-slate-400" : ""}`}>
                      {tx.title}
                    </p>
                    {tx.isRefunded && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        Refunded
                      </span>
                    )}
                    {tx.isRoutine && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        Routine
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {tx.categoryName || "General"} • {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {tx.notes && ` • ${tx.notes}`}
                  </p>
                </div>
              </div>

              {/* Amount Displayed in Active Display Currency */}
              <div className="text-right shrink-0">
                <p
                  className={`text-xs font-bold ${
                    isIncome || isRefund ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isIncome || isRefund ? "+" : "-"}
                  {formatCurrency(convertedAmount, displayCurrency)}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">{tx.type}</p>
              </div>
            </div>

            {/* Quick Actions Strip: Refund & Delete buttons */}
            <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-800/40">
              {isExpense && !tx.isRefunded && (
                <button
                  disabled={isBusy}
                  onClick={() => handleRefund(tx.id, tx.title)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/20 transition active:scale-95 disabled:opacity-50"
                  title="Return this item and credit money back to wallet"
                >
                  <RotateCcw className="w-3 h-3 text-indigo-400" />
                  <span>Return / Refund</span>
                </button>
              )}

              <button
                disabled={isBusy}
                onClick={() => handleDelete(tx.id, tx.title)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-[10px] font-semibold border border-slate-700/60 hover:border-rose-500/30 transition active:scale-95 disabled:opacity-50"
                title="Undo or remove mistake"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
