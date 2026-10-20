"use client";

import React, { useState } from "react";
import { Flame, CheckCircle, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { formatCurrency } from "@/lib/utils";

export interface PendingRoutine {
  id: string;
  title: string;
  cost: number;
  promptMessage: string;
}

interface DailyReminderBannerProps {
  pendingRoutines: PendingRoutine[];
  displayCurrency?: string;
  exchangeRate?: number;
  onCheckInCompleted: () => void;
}

export function DailyReminderBanner({
  pendingRoutines,
  displayCurrency = "USD",
  exchangeRate = 1,
  onCheckInCompleted,
}: DailyReminderBannerProps) {
  const [currentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState("");

  if (pendingRoutines.length === 0) {
    return (
      <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>All daily routines checked off for today!</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10">
          Clean
        </span>
      </div>
    );
  }

  const routine = pendingRoutines[currentIndex] || pendingRoutines[0];
  const convertedCost = routine.cost * exchangeRate;
  const formattedCost = formatCurrency(convertedCost, displayCurrency);

  const handleAction = async (action: "CONFIRMED" | "SKIPPED") => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/routines/${routine.id}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to process check-in");

      if (action === "SKIPPED") {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#10B981", "#6366F1", "#F59E0B"],
        });

        setCelebrationMsg(`🎉 Saved ${formattedCost} today! Streak: ${json.data.cleanStreakDays} days!`);
        setTimeout(() => {
          setCelebrationMsg("");
          onCheckInCompleted();
        }, 1800);
      } else {
        onCheckInCompleted();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (celebrationMsg) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center gap-2 text-emerald-300 font-bold text-xs animate-pulse">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span>{celebrationMsg}</span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 shadow-md">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          <Flame className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Daily Routine Prompt ({pendingRoutines.length} pending)
            </span>
            <span className="text-[10px] text-slate-400">Today</span>
          </div>

          <p className="text-xs font-semibold text-slate-100">
            Did you buy {routine.title.toLowerCase()} today ({formattedCost})?
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              disabled={isSubmitting}
              onClick={() => handleAction("SKIPPED")}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95 disabled:opacity-50"
            >
              ❌ No, Skipped!
            </button>
            <button
              disabled={isSubmitting}
              onClick={() => handleAction("CONFIRMED")}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-950"
            >
              ✅ Yes, Bought
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
