"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  ArrowDownLeft,
  Calendar,
  Croissant,
  Salad,
  Utensils,
  Car,
  PieChart,
  Repeat,
  ShoppingBag,
  Laptop,
  Flame,
  Receipt,
} from "lucide-react";

interface AnalyticsSummary {
  totalSpent: number;
  totalIncome: number;
  netSavings: number;
  dailyAverage: number;
  routineExpensesTotal: number;
  discretionaryExpensesTotal: number;
}

interface QuickFourData {
  grandTotalQuickFour: number;
  categories: {
    breakfast: { total: number; count: number; percentage: number };
    lunch: { total: number; count: number; percentage: number };
    dinner: { total: number; count: number; percentage: number };
    transport: { total: number; count: number; percentage: number };
  };
}

interface CategoryRank {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
}

interface AnalyticsViewProps {
  displayCurrency: string;
  exchangeRate: number;
}

export function AnalyticsView({
  displayCurrency = "USD",
  exchangeRate = 1,
}: AnalyticsViewProps) {
  const [period, setPeriod] = useState<string>("this_month");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [quickFour, setQuickFour] = useState<QuickFourData | null>(null);
  const [categoryRanks, setCategoryRanks] = useState<CategoryRank[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      let queryParams = `period=${period}`;
      if (period === "custom" && startDate && endDate) {
        queryParams += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const [sumRes, qfRes, catRes] = await Promise.all([
        fetch(`/api/analytics/summary?${queryParams}`),
        fetch(`/api/analytics/quick-four?${queryParams}`),
        fetch(`/api/analytics/categories?${queryParams}`),
      ]);

      const [sumJson, qfJson, catJson] = await Promise.all([
        sumRes.json(),
        qfRes.json(),
        catRes.json(),
      ]);

      if (sumJson.success) setSummary(sumJson.data);
      if (qfJson.success) setQuickFour(qfJson.data);
      if (catJson.success) setCategoryRanks(catJson.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setIsLoading(false);
    }
  }, [period, startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const convert = (amount: number = 0) => amount * exchangeRate;

  const getCategoryIcon = (id: string) => {
    switch (id) {
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
      default:
        return Receipt;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Period Selector Tabs */}
      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          {[
            { id: "today", label: "Today" },
            { id: "this_week", label: "This Week" },
            { id: "this_month", label: "This Month" },
            { id: "custom", label: "Custom" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className={`py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                period === tab.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers */}
        {period === "custom" && (
          <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 animate-fadeIn">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Overview Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-[#151D2F] to-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Spent in Period
          </span>
          {summary && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                summary.netSavings >= 0
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}
            >
              {summary.netSavings >= 0 ? "Surplus: +" : "Deficit: -"}
              {formatCurrency(convert(Math.abs(summary.netSavings)), displayCurrency)}
            </span>
          )}
        </div>

        <div className="text-3xl font-extrabold text-white tracking-tight">
          {isLoading
            ? "---.--"
            : formatCurrency(convert(summary?.totalSpent || 0), displayCurrency)}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Daily Average</span>
            <span className="font-bold text-slate-200">
              {formatCurrency(convert(summary?.dailyAverage || 0), displayCurrency)} / day
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Total Income / Deposits</span>
            <span className="font-bold text-emerald-400">
              +{formatCurrency(convert(summary?.totalIncome || 0), displayCurrency)}
            </span>
          </div>
        </div>

        {/* Routine vs Discretionary Split */}
        {summary && summary.totalSpent > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Fixed Routines: {formatCurrency(convert(summary.routineExpensesTotal), displayCurrency)}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                Discretionary: {formatCurrency(convert(summary.discretionaryExpensesTotal), displayCurrency)}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
              <div
                style={{
                  width: `${(summary.routineExpensesTotal / summary.totalSpent) * 100}%`,
                }}
                className="h-full bg-amber-400"
              />
              <div
                style={{
                  width: `${(summary.discretionaryExpensesTotal / summary.totalSpent) * 100}%`,
                }}
                className="h-full bg-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. The "Big 4" Quick Categories Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            The Big 4 Breakdown
          </h4>
          {quickFour && (
            <span className="text-[10px] text-slate-500">
              Total: {formatCurrency(convert(quickFour.grandTotalQuickFour), displayCurrency)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            {
              key: "breakfast",
              name: "Breakfast",
              icon: Croissant,
              color: "text-amber-400",
              barColor: "bg-amber-400",
              data: quickFour?.categories.breakfast,
            },
            {
              key: "lunch",
              name: "Lunch",
              icon: Salad,
              color: "text-emerald-400",
              barColor: "bg-emerald-400",
              data: quickFour?.categories.lunch,
            },
            {
              key: "dinner",
              name: "Dinner",
              icon: Utensils,
              color: "text-indigo-400",
              barColor: "bg-indigo-400",
              data: quickFour?.categories.dinner,
            },
            {
              key: "transport",
              name: "Transport",
              icon: Car,
              color: "text-sky-400",
              barColor: "bg-sky-400",
              data: quickFour?.categories.transport,
            },
          ].map((item) => {
            const Icon = item.icon;
            const total = item.data?.total || 0;
            const count = item.data?.count || 0;
            const percentage = item.data?.percentage || 0;

            return (
              <div
                key={item.key}
                className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs font-bold text-white">{item.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {count}x
                  </span>
                </div>

                <div>
                  <span className="text-sm font-extrabold text-white block">
                    {formatCurrency(convert(total), displayCurrency)}
                  </span>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>Share:</span>
                    <span className="font-semibold text-slate-300">{percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                    <div
                      style={{ width: `${percentage}%` }}
                      className={`h-full ${item.barColor}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Full Category Share Rankings */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-indigo-400" />
            <span>Category Spending Ranking</span>
          </h4>
          <span className="text-[10px] text-slate-500">{categoryRanks.length} categories</span>
        </div>

        {categoryRanks.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">
            No expenses recorded for this period
          </p>
        ) : (
          <div className="space-y-2.5">
            {categoryRanks.map((cat, idx) => {
              const Icon = getCategoryIcon(cat.categoryId);
              return (
                <div key={cat.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 w-3">
                        #{idx + 1}
                      </span>
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-200">{cat.categoryName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {formatCurrency(convert(cat.total), displayCurrency)}
                      </span>
                      <span className="text-[10px] text-slate-400 w-10 text-right">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${cat.percentage}%` }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
