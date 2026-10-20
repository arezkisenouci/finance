"use client";

import React, { useState, useEffect } from "react";
import { X, Delete, Check, Sparkles } from "lucide-react";
import { QuickActionPreset } from "./QuickActionsBar";

interface QuickEntryKeypadProps {
  isOpen: boolean;
  onClose: () => void;
  preset: QuickActionPreset | null;
  onSuccess: () => void;
}

export function QuickEntryKeypad({
  isOpen,
  onClose,
  preset,
  onSuccess,
}: QuickEntryKeypadProps) {
  const [amountStr, setAmountStr] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (preset) {
      const avg = preset.recentAverage || preset.defaultAmount;
      setAmountStr(avg.toFixed(2));
      setNotes("");
      setError("");
    }
  }, [preset]);

  if (!isOpen || !preset) return null;

  const triggerHaptic = () => {
    try {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(10);
      }
    } catch {
      // Haptics not supported or ignored
    }
  };

  const handleKeyPress = (char: string) => {
    triggerHaptic();
    if (char === "⌫") {
      setAmountStr((prev) => prev.slice(0, -1));
      return;
    }

    if (char === ".") {
      if (amountStr.includes(".")) return;
      setAmountStr((prev) => (prev ? `${prev}.` : "0."));
      return;
    }

    // Limit to two decimal places
    if (amountStr.includes(".")) {
      const parts = amountStr.split(".");
      if (parts[1]?.length >= 2) return;
    }

    // Max amount limit
    if (parseFloat(amountStr + char) > 99999) return;

    setAmountStr((prev) => (prev === "0" ? char : prev + char));
  };

  const handleAddAmount = (addValue: number) => {
    triggerHaptic();
    const curr = parseFloat(amountStr) || 0;
    setAmountStr((curr + addValue).toFixed(2));
  };

  const handleResetAvg = () => {
    triggerHaptic();
    const avg = preset.recentAverage || preset.defaultAmount;
    setAmountStr(avg.toFixed(2));
  };

  const handleSubmit = async () => {
    triggerHaptic();
    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/quick-actions/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: preset.id,
          amount: parsedAmount,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to log quick expense");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0F172A] border-t border-x border-slate-800 rounded-t-3xl p-5 shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Quick Log: {preset.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-2 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Large Amount Display */}
        <div className="py-4 text-center">
          <span className="text-xl font-bold text-slate-400 mr-1">$</span>
          <span className="text-4xl font-extrabold tracking-tight text-white">
            {amountStr || "0.00"}
          </span>
        </div>

        {/* Quick Add Chips */}
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <button
            onClick={() => handleAddAmount(1)}
            className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700/60 active:scale-95 transition"
          >
            +$1
          </button>
          <button
            onClick={() => handleAddAmount(5)}
            className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700/60 active:scale-95 transition"
          >
            +$5
          </button>
          <button
            onClick={() => handleAddAmount(10)}
            className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700/60 active:scale-95 transition"
          >
            +$10
          </button>
          <button
            onClick={handleResetAvg}
            className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 active:scale-95 transition flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>Avg (~${(preset.recentAverage || preset.defaultAmount).toFixed(0)})</span>
          </button>
        </div>

        {/* Optional Note */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Add quick note (e.g. subway, tacos)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Numeric Keypad Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((btn) => (
            <button
              key={btn}
              onClick={() => handleKeyPress(btn)}
              className="py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-lg border border-slate-800/80 transition active:scale-95 flex items-center justify-center shadow-sm"
            >
              {btn === "⌫" ? <Delete className="w-5 h-5 text-slate-400" /> : btn}
            </button>
          ))}
        </div>

        {/* Confirm Action Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !amountStr || parseFloat(amountStr) <= 0}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-950"
        >
          <Check className="w-4 h-4" />
          <span>
            {isSubmitting ? "Deducting..." : `Confirm & Pay $${parseFloat(amountStr || "0").toFixed(2)}`}
          </span>
        </button>
      </div>
    </div>
  );
}
