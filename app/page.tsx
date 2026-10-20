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
import { DailyReminderBanner, PendingRoutine } from "@/components/routines/DailyReminderBanner";
import { RoutinesManager } from "@/components/routines/RoutinesManager";
import { WhatIfSimulatorView } from "@/components/simulator/WhatIfSimulatorView";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { CurrencyModal } from "@/components/currency/CurrencyModal";
import { SettingsDrawer } from "@/components/settings/SettingsDrawer";
import { Category, Transaction } from "@/types/database";
import { Sparkles, TrendingUp } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("wallet");

  // Wallet & Multi-Currency State
  const [balance, setBalance] = useState<number>(3840.50);
  const [baseCurrency, setBaseCurrency] = useState<string>("USD");
  const [displayCurrency, setDisplayCurrency] = useState<string>("USD");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [convertedBalances, setConvertedBalances] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [quickPresets, setQuickPresets] = useState<QuickActionPreset[]>([]);
  const [pendingRoutines, setPendingRoutines] = useState<PendingRoutine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal States
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState<boolean>(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [selectedQuickPreset, setSelectedQuickPreset] = useState<QuickActionPreset | null>(null);
  const [isKeypadOpen, setIsKeypadOpen] = useState<boolean>(false);

  // Fetch Wallet
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

  // Fetch Currency Rates
  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch("/api/currency/rates");
      const json = await res.json();
      if (json.success && json.rates) {
        setExchangeRates(json.rates);
      }
    } catch (err) {
      console.error("Failed to fetch rates:", err);
    }
  }, []);

  // Fetch Transactions
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

  // Fetch Categories
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

  // Fetch Quick Presets
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

  // Fetch Pending Daily Routines
  const fetchPendingRoutines = useCallback(async () => {
    try {
      const res = await fetch("/api/routines/pending-today");
      const json = await res.json();
      if (json.success) {
        setPendingRoutines(json.routines || []);
      }
    } catch (err) {
      console.error("Failed to fetch pending routines:", err);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchWallet(),
      fetchRates(),
      fetchTransactions(),
      fetchCategories(),
      fetchQuickPresets(),
      fetchPendingRoutines(),
    ]);
    setIsLoading(false);
  }, [fetchWallet, fetchRates, fetchTransactions, fetchCategories, fetchQuickPresets, fetchPendingRoutines]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const handleOpenQuickKeypad = (preset: QuickActionPreset) => {
    setSelectedQuickPreset(preset);
    setIsKeypadOpen(true);
  };

  const activeExchangeRate = exchangeRates[displayCurrency] || 1;

  return (
    <div className="flex flex-col flex-1 pb-20">
      {/* Sticky Mobile Header */}
      <Header
        currentCurrency={displayCurrency}
        onOpenCurrencySelector={() => setIsCurrencyModalOpen(true)}
        pendingRemindersCount={pendingRoutines.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-4 space-y-4">
        {activeTab === "wallet" && (
          <>
            {/* 1. Digital Wallet Hero Card */}
            <WalletCard
              balance={balance}
              baseCurrency={baseCurrency}
              displayCurrency={displayCurrency}
              exchangeRate={activeExchangeRate}
              convertedBalances={convertedBalances}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onOpenAddFunds={() => setIsAddFundsOpen(true)}
              isLoading={isLoading}
            />

            {/* 2. Quick Actions Row (The Big 4) */}
            <QuickActionsBar
              presets={quickPresets}
              displayCurrency={displayCurrency}
              exchangeRate={activeExchangeRate}
              onSelectAction={handleOpenQuickKeypad}
            />

            {/* 3. Daily Routine Reminder Prompt */}
            <DailyReminderBanner
              pendingRoutines={pendingRoutines}
              displayCurrency={displayCurrency}
              exchangeRate={activeExchangeRate}
              onCheckInCompleted={refreshAllData}
            />

            {/* 4. What-If Simulator Teaser Card */}
            <div
              className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 hover:border-indigo-500/50 transition cursor-pointer active:scale-95 shadow-sm"
              onClick={() => setActiveTab("simulator")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">What-If Habit Simulator</h4>
                    <p className="text-[11px] text-slate-300">
                      If you quit cigarettes: <span className="text-emerald-400 font-bold">+$240/mo</span> saved
                    </p>
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-indigo-400" />
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
                displayCurrency={displayCurrency}
                exchangeRate={activeExchangeRate}
                onTransactionMutated={refreshAllData}
                isLoading={isLoading}
              />
            </div>
          </>
        )}

        {activeTab === "analytics" && (
          <AnalyticsView
            displayCurrency={displayCurrency}
            exchangeRate={activeExchangeRate}
          />
        )}

        {activeTab === "routines" && (
          <RoutinesManager
            displayCurrency={displayCurrency}
            exchangeRate={activeExchangeRate}
            onDataChanged={refreshAllData}
          />
        )}

        {activeTab === "simulator" && (
          <WhatIfSimulatorView />
        )}
      </main>

      {/* Persistent Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Add Expense Modal with Dynamic Currency Input */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        categories={categories}
        currency={displayCurrency}
        onExpenseAdded={refreshAllData}
      />

      {/* Add Funds Modal with Dynamic Currency Input */}
      <AddFundsModal
        isOpen={isAddFundsOpen}
        onClose={() => setIsAddFundsOpen(false)}
        currency={displayCurrency}
        onFundsAdded={refreshAllData}
      />

      {/* 1-Tap Quick Action Keypad Bottom Sheet */}
      <QuickEntryKeypad
        isOpen={isKeypadOpen}
        onClose={() => setIsKeypadOpen(false)}
        preset={selectedQuickPreset}
        currency={displayCurrency}
        exchangeRate={activeExchangeRate}
        onSuccess={refreshAllData}
      />

      {/* Multi-Currency Selection Modal */}
      <CurrencyModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        selectedCurrency={displayCurrency}
        onSelectCurrency={setDisplayCurrency}
        rates={exchangeRates}
      />

      {/* Settings & JSON Backup Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDataRestored={refreshAllData}
      />
    </div>
  );
}
