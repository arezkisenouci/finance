"use client";

import React, { useState, useEffect } from "react";
import { Plus, Flame, Sparkles, Trash2, Pause, Play, X } from "lucide-react";
import { formatCurrency, getCurrencySymbol } from "@/lib/utils";

interface RoutineWithStats {
  id: string;
  title: string;
  cost: number;
  currency: string;
  reminderTime: string;
  isActive: boolean;
  stats: {
    currentStreakSkipped: number;
    totalSavedThisMonth: number;
    totalSpentThisMonth: number;
  };
}

interface RoutinesManagerProps {
  displayCurrency?: string;
  exchangeRate?: number;
  onDataChanged: () => void;
}

export function RoutinesManager({
  displayCurrency = "USD",
  exchangeRate = 1,
  onDataChanged,
}: RoutinesManagerProps) {
  const [routines, setRoutines] = useState<RoutineWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Routine Form State
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");
  const [reminderTime, setReminderTime] = useState("20:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const symbol = getCurrencySymbol(displayCurrency);

  const fetchRoutines = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/routines");
      const json = await res.json();
      if (json.success) {
        setRoutines(json.data);
      }
    } catch (err) {
      console.error("Failed to load routines:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const totalSavedMonth = routines.reduce(
    (sum, r) => sum + (r.stats?.totalSavedThisMonth || 0),
    0
  );

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/routines/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        fetchRoutines();
        onDataChanged();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete routine "${title}"?`)) return;
    try {
      const res = await fetch(`/api/routines/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchRoutines();
        onDataChanged();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCost = parseFloat(cost);
    if (!title.trim() || isNaN(parsedCost) || parsedCost <= 0) {
      alert("Please enter valid routine title and cost");
      return;
    }

    // Convert cost to base USD if entered in another currency
    const costInBase = parseFloat((parsedCost / exchangeRate).toFixed(2));

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          cost: costInBase,
          categoryId: "cat_habits",
          frequency: "DAILY",
          reminderTime,
        }),
      });

      if (res.ok) {
        setTitle("");
        setCost("");
        setIsAddOpen(false);
        fetchRoutines();
        onDataChanged();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Habit Savings Hero Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-indigo-950/40 border border-amber-500/30 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Habit Milestones
              </span>
              <h3 className="text-sm font-bold text-white">Monthly Savings Pool</h3>
            </div>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition active:scale-95 shadow-md shadow-emerald-950"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Routine</span>
          </button>
        </div>

        <div className="my-2">
          <span className="text-3xl font-extrabold text-white">
            {formatCurrency(totalSavedMonth * exchangeRate, displayCurrency)}
          </span>
          <span className="text-xs text-emerald-400 font-semibold ml-2">
            Saved by skipping habits!
          </span>
        </div>

        <p className="text-[11px] text-slate-400">
          Daily reminders help you stay disciplined. Every time you skip, money stays in your wallet!
        </p>
      </div>

      {/* Routine Cards List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Routines & Habit Streaks
          </h4>
          <span className="text-[10px] text-slate-500">{routines.length} routines</span>
        </div>

        {isLoading ? (
          <div className="h-24 rounded-2xl bg-slate-900/50 animate-pulse" />
        ) : routines.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <Flame className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
            <p className="text-xs font-semibold text-slate-300">No routines configured</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tap "+ New Routine" to track habits like cigarettes, coffee, or snacks.
            </p>
          </div>
        ) : (
          routines.map((routine) => {
            const streak = routine.stats?.currentStreakSkipped || 0;
            const convertedCost = routine.cost * exchangeRate;
            const savedThisMonthConverted = (routine.stats?.totalSavedThisMonth || 0) * exchangeRate;
            const spentThisMonthConverted = (routine.stats?.totalSpentThisMonth || 0) * exchangeRate;

            return (
              <div
                key={routine.id}
                className={`p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 transition flex flex-col gap-2.5 ${
                  !routine.isActive ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{routine.title}</h4>
                      <p className="text-[10px] text-slate-400">
                        {formatCurrency(convertedCost, displayCurrency)} / day • Reminder at {routine.reminderTime}
                      </p>
                    </div>
                  </div>

                  {/* Clean Streak Badge */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                    <span>🔥</span>
                    <span>{streak} Days Clean</span>
                  </div>
                </div>

                {/* Bottom stats row */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <span>
                      Saved this month:{" "}
                      <strong className="text-emerald-400">
                        {formatCurrency(savedThisMonthConverted, displayCurrency)}
                      </strong>
                    </span>
                    <span>
                      Spent:{" "}
                      <strong className="text-rose-400">
                        {formatCurrency(spentThisMonthConverted, displayCurrency)}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(routine.id, routine.isActive)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white transition"
                      title={routine.isActive ? "Pause Routine" : "Activate Routine"}
                    >
                      {routine.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(routine.id, routine.title)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition"
                      title="Delete Routine"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Routine Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Create Daily Routine Habit</h3>
                <p className="text-[11px] text-slate-400">Cost in {displayCurrency} ({symbol.trim()})</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoutine} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Routine Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Packet of Cigarettes, Morning Latte"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Daily Cost ({displayCurrency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 font-extrabold text-sm">
                    {symbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="8.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Daily Reminder Prompt Time
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition active:scale-95 disabled:opacity-50 mt-4 shadow-lg shadow-amber-950"
              >
                {isSubmitting ? "Creating..." : `Save Routine & Activate Prompt (${symbol}${parseFloat(cost || "0").toFixed(2)})`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
