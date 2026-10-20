"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav, NavTab } from "@/components/layout/BottomNav";
import { WalletCard } from "@/components/wallet/WalletCard";
import { AddExpenseModal } from "@/components/wallet/AddExpenseModal";
import { AddFundsModal } from "@/components/wallet/AddFundsModal";
import { TransactionList } from "@/components/wallet/TransactionList";
import { QuickActionsBar, QuickActionPreset } from "@/components/quick-actions/QuickActionsBar";
import { QuickEntryKeypad } from "@/components/quick-actions/QuickEntryKeypad";
import { Category, Transaction } from "@/types/database";
import { Flame, Sparkles, TrendingUp } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("wallet");

  // Wallet State
  const [balance, setBalance] = useState<number>(3840.50);
  const [baseCurrency, setBaseCurrency] = useState<string>("USD");
  const [convertedBalances, setConvertedBalances] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [quickPresets, setQuickPresets] = useState<QuickActionPreset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal & Keypad States
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState<boolean>(false);
  const [selectedQuickPreset, setSelectedQuickPreset] = useState<QuickActionPreset | null>(null);
  const [isKeypadOpen, setIsKeypadOpen] = useState<boolean>(false);

  // Data Fetching
  const fetchWallet = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet");
      const json = await res.json();
      if (json.success) {
        setBalance(json.data.balance);
        setBaseCurrency(json.data.baseCurrency);
        setConvertedBalances(json.data.convertedBalances || {});
      }
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions?limit=20");
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data.transactions);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  const fetchQuickPresets = useCallback(async () => {
    try {
      const res = await fetch("/api/quick-actions");
      const json = await res.json();
      if (json.success) {
        setQuickPresets(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch quick presets:", err);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchWallet(),
      fetchTransactions(),
      fetchCategories(),
      fetchQuickPresets(),
    ]);
    setIsLoading(false);
  }, [fetchWallet, fetchTransactions, fetchCategories, fetchQuickPresets]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const handleOpenQuickKeypad = (preset: QuickActionPreset) => {
    setSelectedQuickPreset(preset);
    setIsKeypadOpen(true);
  };

  return (
    <div className="flex flex-col flex-1 pb-20">
      {/* Sticky Mobile Header */}
      <Header
        currentCurrency={baseCurrency}
        pendingRemindersCount={1}
        onOpenSettings={() => alert("Settings & Backup drawer will open in Phase 8")}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-4 space-y-4">
        {activeTab === "wallet" && (
          <>
            {/* 1. Digital Wallet Hero Card */}
            <WalletCard
              balance={balance}
              baseCurrency={baseCurrency}
              convertedBalances={convertedBalances}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onOpenAddFunds={() => setIsAddFundsOpen(true)}
              isLoading={isLoading}
            />

            {/* 2. Quick Actions Row (The Big 4) */}
            <QuickActionsBar
              presets={quickPresets}
              onSelectAction={handleOpenQuickKeypad}
            />

            {/* 3. Daily Routine Reminder Prompt */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 shadow-md">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Daily Routine Prompt
                    </span>
                    <span className="text-[10px] text-slate-400">Today</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200">
                    Did you buy a packet of cigarettes today ($8.00)?
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => alert("Skipped routine! Streak +1 and money saved (Phase 4)")}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition active:scale-95"
                    >
                      ❌ No, Skipped
                    </button>
                    <button
                      onClick={() => alert("Confirmed routine! $8.00 deducted from wallet (Phase 4)")}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition active:scale-95"
                    >
                      ✅ Yes, Bought
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. What-If Simulator Teaser */}
            <div
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
              onClick={() => setActiveTab("simulator")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">What-If Savings Simulator</h4>
                    <p className="text-[11px] text-slate-400">
                      If you quit cigarettes: <span className="text-emerald-400 font-semibold">+$240/mo</span> saved
                    </p>
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* 5. Live Transactions Ledger */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Transaction History & Actions
                </h3>
                <span className="text-[11px] text-slate-500">
                  {transactions.length} entries
                </span>
              </div>

              <TransactionList
                transactions={transactions}
                onTransactionMutated={refreshAllData}
                isLoading={isLoading}
              />
            </div>
          </>
        )}

        {activeTab === "analytics" && (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Analytics Dashboard</h3>
            <p className="text-xs">Period breakdowns (Day, Week, Month, Custom) with Big 4 category charts will be connected in Phase 7.</p>
          </div>
        )}

        {activeTab === "routines" && (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
              <Flame className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Daily Routines & Habits</h3>
            <p className="text-xs">Routine configuration, daily check-in histories, and streaks will be connected in Phase 4.</p>
          </div>
        )}

        {activeTab === "simulator" && (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">What-If Habit Simulator</h3>
            <p className="text-xs">Habit expense sliders, monthly/yearly projections, and compound interest calculations will be connected in Phase 5.</p>
          </div>
        )}
      </main>

      {/* Persistent Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        categories={categories}
        onExpenseAdded={refreshAllData}
      />

      {/* Add Funds Modal */}
      <AddFundsModal
        isOpen={isAddFundsOpen}
        onClose={() => setIsAddFundsOpen(false)}
        onFundsAdded={refreshAllData}
      />

      {/* 1-Tap Quick Action Keypad Bottom Sheet */}
      <QuickEntryKeypad
        isOpen={isKeypadOpen}
        onClose={() => setIsKeypadOpen(false)}
        preset={selectedQuickPreset}
        onSuccess={refreshAllData}
      />
    </div>
  );
}
