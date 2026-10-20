"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, TrendingUp, DollarSign, Laptop, Plane, Headphones, ShieldCheck, Flame, Sliders } from "lucide-react";

interface RoutineProjection {
  routineId: string;
  title: string;
  dailyCost: number;
  currency: string;
  projections: {
    oneMonth: number;
    threeMonths: number;
    sixMonths: number;
    oneYear: number;
    fiveYearInvestedAt7Percent: number;
  };
  purchasingPowerEquivalents: string[];
}

export function WhatIfSimulatorView() {
  const [routines, setRoutines] = useState<RoutineProjection[]>([]);
  const [selectedRoutines, setSelectedRoutines] = useState<string[]>([]);
  const [dailyCustomAmount, setDailyCustomAmount] = useState<number>(8.00);
  const [useCustomSlider, setUseCustomSlider] = useState<boolean>(false);
  const [durationMonths, setDurationMonths] = useState<number>(12); // Default 1 year
  const [interestRate] = useState<number>(7.0); // 7% S&P 500 historical average
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSimulatorData() {
      try {
        const res = await fetch("/api/simulator/routines");
        const json = await res.json();
        if (json.success && json.data.routines) {
          setRoutines(json.data.routines);
          // Select all active by default
          setSelectedRoutines(json.data.routines.map((r: RoutineProjection) => r.routineId));
          if (json.data.routines.length > 0) {
            setDailyCustomAmount(json.data.routines[0].dailyCost);
          }
        }
      } catch (err) {
        console.error("Failed to load simulator data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSimulatorData();
  }, []);

  // Compute active daily spend
  const computedDailySpend = useCustomSlider
    ? dailyCustomAmount
    : routines
        .filter((r) => selectedRoutines.includes(r.routineId))
        .reduce((sum, r) => sum + r.dailyCost, 0) || dailyCustomAmount;

  // Real-time calculations
  const monthlySavings = computedDailySpend * (365 / 12);
  const totalCashSaved = computedDailySpend * (durationMonths * (365 / 12));

  // Compound interest calculation
  const monthlyRate = interestRate / 100 / 12;
  const compoundFactor = Math.pow(1 + monthlyRate, durationMonths);
  const totalInvested = monthlyRate > 0
    ? monthlySavings * ((compoundFactor - 1) / monthlyRate)
    : totalCashSaved;
  const interestEarned = Math.max(0, totalInvested - totalCashSaved);

  const toggleRoutine = (id: string) => {
    setUseCustomSlider(false);
    setSelectedRoutines((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Future Wealth Simulator
            </span>
            <h3 className="text-sm font-bold text-white">What-If Habit Savings</h3>
          </div>
        </div>
        <p className="text-[11px] text-slate-400">
          Discover how small daily routine expenses accumulate into life-changing wealth over time.
        </p>
      </div>

      {/* Routine Checkboxes Selection */}
      <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Select Your Routine Habits
          </span>
          <button
            onClick={() => setUseCustomSlider(!useCustomSlider)}
            className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <Sliders className="w-3 h-3" />
            <span>{useCustomSlider ? "Pick from Habits" : "Custom Amount Slider"}</span>
          </button>
        </div>

        {!useCustomSlider ? (
          <div className="space-y-2">
            {routines.map((routine) => {
              const isChecked = selectedRoutines.includes(routine.routineId);
              return (
                <div
                  key={routine.routineId}
                  onClick={() => toggleRoutine(routine.routineId)}
                  className={`p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    isChecked
                      ? "bg-indigo-500/10 border-indigo-500/40 text-white"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Controlled by parent div click
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-bold">{routine.title}</p>
                      <p className="text-[10px] text-slate-400">Daily habit expense</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    ${routine.dailyCost.toFixed(2)}/day
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Custom Slider */
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Custom Daily Expense:</span>
              <span className="font-extrabold text-emerald-400 text-base">
                ${dailyCustomAmount.toFixed(2)} / day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="0.5"
              value={dailyCustomAmount}
              onChange={(e) => setDailyCustomAmount(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>$1/day</span>
              <span>$25/day</span>
              <span>$50/day</span>
            </div>
          </div>
        )}
      </div>

      {/* Time Horizon Segmented Control */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
          Time Horizon
        </label>
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          {[
            { months: 1, label: "1 Mo" },
            { months: 6, label: "6 Mo" },
            { months: 12, label: "1 Year" },
            { months: 60, label: "5 Years" },
          ].map((item) => (
            <button
              key={item.months}
              onClick={() => setDurationMonths(item.months)}
              className={`py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                durationMonths === item.months
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projected Savings Hero Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-[#151D2F] to-slate-900 border border-emerald-500/30 shadow-2xl space-y-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
            Projected Total Cash Saved
          </span>
          <div className="flex items-baseline mt-1">
            <span className="text-3xl font-black text-white">
              +${totalCashSaved.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 ml-2">
              in {durationMonths >= 12 ? `${durationMonths / 12} year(s)` : `${durationMonths} month(s)`}
            </span>
          </div>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Monthly Rate</span>
            <span className="text-xs font-bold text-slate-200">
              ${monthlySavings.toFixed(2)} / mo
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Invested @ 7% CAGR</span>
            <span className="text-xs font-bold text-emerald-400">
              ${totalInvested.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {interestEarned > 0 && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold flex items-center justify-between">
            <span>Compound Interest Earned:</span>
            <strong className="text-emerald-400">+${interestEarned.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
        )}
      </div>

      {/* Tangible Purchasing Power Benchmarks */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          🎁 What You Could Buy Instead
        </h4>

        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800/80">
            <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400 shrink-0">
              <Laptop className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-white">Custom High-End PC / MacBook Pro</p>
              <p className="text-[10px] text-slate-400">Unlocked in ~6 to 12 months of savings</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800/80">
            <div className="p-2 rounded-lg bg-sky-500/15 text-sky-400 shrink-0">
              <Plane className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-white">All-Inclusive International Vacation</p>
              <p className="text-[10px] text-slate-400">Unlocked in ~1 year of clean habit streak</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800/80">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-white">Car or Real Estate Down Payment</p>
              <p className="text-[10px] text-slate-400">Unlocked in 5 years with 7% compound growth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
