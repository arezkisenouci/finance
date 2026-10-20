"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav, NavTab } from "@/components/layout/BottomNav";
import { PlusCircle, ArrowDownLeft, Flame, Sparkles, TrendingUp, Croissant, Salad, Utensils, Car, Laptop, ShoppingBag } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("wallet");
  const [currency] = useState("USD");

  return (
    <div className="flex flex-col flex-1 pb-20">
      {/* Sticky Mobile Header */}
      <Header
        currentCurrency={currency}
        pendingRemindersCount={1}
        onOpenSettings={() => alert("Settings & Backup drawer will open in Phase 8")}
      />

      {/* Main Tab Views */}
      <main className="flex-1 px-4 py-4 space-y-4">
        {activeTab === "wallet" && (
          <>
            {/* 1. Digital Wallet Hero Card */}
            <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-slate-900 via-[#131B2E] to-slate-900 border border-slate-800 shadow-xl">
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                <span>TOTAL WALLET BALANCE</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px] border border-emerald-500/20">
                  Active
                </span>
              </div>

              <div className="text-3xl font-extrabold tracking-tight text-white my-1">
                $3,840<span className="text-slate-400 text-2xl font-semibold">.50</span>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2 mb-5">
                <span>≈ €3,552.46 EUR</span>
                <span>•</span>
                <span>≈ ¥582,603 JPY</span>
              </div>

              {/* Action Buttons: Add Expense & Add Funds */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => alert("Add Expense Drawer will open (Phase 2)")}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-semibold text-xs border border-rose-500/30 transition active:scale-95"
                >
                  <PlusCircle className="w-4 h-4 text-rose-400" />
                  <span>+ Add Expense</span>
                </button>
                <button
                  onClick={() => alert("Add Funds Modal will open (Phase 2)")}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold text-xs border border-emerald-500/30 transition active:scale-95"
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                  <span>+ Add Funds</span>
                </button>
              </div>
            </div>

            {/* 2. Quick Actions Row (The Big 4) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  ⚡ Quick Actions
                </h3>
                <span className="text-[11px] text-slate-500">1-Tap Fast Entry</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "breakfast", name: "Breakfast", icon: Croissant, color: "text-amber-400", bg: "bg-amber-500/10" },
                  { id: "lunch", name: "Lunch", icon: Salad, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { id: "dinner", name: "Dinner", icon: Utensils, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                  { id: "transport", name: "Transport", icon: Car, color: "text-sky-400", bg: "bg-sky-500/10" },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => alert(`Quick log for ${action.name} (Phase 3)`)}
                      className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition active:scale-95 group"
                    >
                      <div className={`p-2 rounded-xl ${action.bg} ${action.color} mb-1.5 transition group-hover:scale-110`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-medium text-slate-300 truncate w-full text-center">
                        {action.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

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
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                 onClick={() => setActiveTab("simulator")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">What-If Savings Simulator</h4>
                    <p className="text-[11px] text-slate-400">If you quit cigarettes: <span className="text-emerald-400 font-semibold">+$240/mo</span> saved</p>
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* 5. Recent Transactions Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Recent Activity
                </h3>
                <span className="text-[11px] text-emerald-400 font-medium cursor-pointer">View All</span>
              </div>

              <div className="space-y-1.5">
                {[
                  { id: "1", title: "Custom Gaming PC Build", cat: "Electronics", amount: -1250.00, date: "Oct 18", icon: Laptop },
                  { id: "2", title: "Supermarket Groceries", cat: "Shopping", amount: -65.20, date: "Oct 19", icon: ShoppingBag },
                  { id: "3", title: "Quick Lunch - Salad Bowl", cat: "Lunch", amount: -14.50, date: "Today", icon: Salad },
                ].map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{item.title}</p>
                          <p className="text-[10px] text-slate-400">{item.cat} • {item.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-rose-400">
                          -${Math.abs(item.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
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
    </div>
  );
}
