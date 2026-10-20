"use client";

import React from "react";
import { SlidersHorizontal, Bell, ChevronDown } from "lucide-react";

interface HeaderProps {
  currentCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
  pendingRemindersCount?: number;
  onOpenSettings?: () => void;
}

export function Header({
  currentCurrency = "USD",
  pendingRemindersCount = 1,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full px-4 py-3 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/60 flex items-center justify-between">
      {/* Settings / Brand */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
          aria-label="Settings and Backups"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-sm font-semibold tracking-wide text-white">FinFlow</h1>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Personal Finance</p>
        </div>
      </div>

      {/* Right Actions: Currency Pill & Reminder Bell */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-200 hover:border-slate-700 transition active:scale-95">
          <span>{currentCurrency}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        <button
          className="relative p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white transition active:scale-95"
          aria-label="Daily Routine Notifications"
        >
          <Bell className="w-4 h-4" />
          {pendingRemindersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
              {pendingRemindersCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
