"use client";

import React from "react";
import { PlusCircle, ArrowDownLeft, ShieldCheck, Wallet as WalletIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface WalletCardProps {
  balance: number;
  baseCurrency: string;
  convertedBalances?: Record<string, number>;
  onOpenAddExpense: () => void;
  onOpenAddFunds: () => void;
  isLoading?: boolean;
}

export function WalletCard({
  balance,
  baseCurrency,
  convertedBalances = {},
  onOpenAddExpense,
  onOpenAddFunds,
  isLoading = false,
}: WalletCardProps) {
  const integerPart = Math.floor(balance);
  const decimalPart = Math.abs(balance % 1).toFixed(2).slice(1);

  return (
    <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-slate-900 via-[#131B2E] to-slate-900 border border-slate-800 shadow-2xl">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1.5">
        <div className="flex items-center gap-1.5">
          <WalletIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span className="tracking-wider uppercase text-[10px] font-bold">Total Wallet Balance</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px] border border-emerald-500/20 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          Live
        </span>
      </div>

      {/* Hero Balance Display */}
      <div className="my-1.5 flex items-baseline">
        <span className="text-xl font-bold text-slate-300 mr-1">$</span>
        <span className="text-3xl font-extrabold tracking-tight text-white">
          {isLoading ? "---.--" : integerPart.toLocaleString("en-US")}
        </span>
        <span className="text-slate-400 text-2xl font-semibold">{decimalPart}</span>
        <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
          {baseCurrency}
        </span>
      </div>

      {/* Converted Currencies Live Preview */}
      <div className="text-[11px] text-slate-400 flex items-center gap-2 mb-5 overflow-x-auto whitespace-nowrap py-0.5">
        {convertedBalances.EUR && (
          <span>≈ {formatCurrency(convertedBalances.EUR, "EUR")}</span>
        )}
        {convertedBalances.GBP && (
          <>
            <span>•</span>
            <span>≈ {formatCurrency(convertedBalances.GBP, "GBP")}</span>
          </>
        )}
        {convertedBalances.JPY && (
          <>
            <span>•</span>
            <span>≈ {formatCurrency(convertedBalances.JPY, "JPY")}</span>
          </>
        )}
      </div>

      {/* Action Buttons: Add Expense & Add Funds */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onOpenAddExpense}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-semibold text-xs border border-rose-500/30 transition active:scale-95 shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-rose-400" />
          <span>+ Add Expense</span>
        </button>

        <button
          onClick={onOpenAddFunds}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold text-xs border border-emerald-500/30 transition active:scale-95 shadow-sm"
        >
          <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          <span>+ Add Funds</span>
        </button>
      </div>
    </div>
  );
}
