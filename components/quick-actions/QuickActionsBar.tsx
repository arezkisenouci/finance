"use client";

import React from "react";
import { Croissant, Salad, Utensils, Car } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface QuickActionPreset {
  id: string;
  name: string;
  icon: string;
  defaultAmount: number;
  recentAverage?: number;
}

interface QuickActionsBarProps {
  presets: QuickActionPreset[];
  displayCurrency?: string;
  exchangeRate?: number;
  onSelectAction: (preset: QuickActionPreset) => void;
}

export function QuickActionsBar({
  presets,
  displayCurrency = "USD",
  exchangeRate = 1,
  onSelectAction,
}: QuickActionsBarProps) {
  const getActionStyles = (id: string) => {
    switch (id) {
      case "cat_breakfast":
        return {
          icon: Croissant,
          color: "text-amber-400",
          bg: "bg-amber-500/10 group-hover:bg-amber-500/20",
          border: "hover:border-amber-500/40",
        };
      case "cat_lunch":
        return {
          icon: Salad,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
          border: "hover:border-emerald-500/40",
        };
      case "cat_dinner":
        return {
          icon: Utensils,
          color: "text-indigo-400",
          bg: "bg-indigo-500/10 group-hover:bg-indigo-500/20",
          border: "hover:border-indigo-500/40",
        };
      case "cat_transport":
        return {
          icon: Car,
          color: "text-sky-400",
          bg: "bg-sky-500/10 group-hover:bg-sky-500/20",
          border: "hover:border-sky-500/40",
        };
      default:
        return {
          icon: Utensils,
          color: "text-slate-400",
          bg: "bg-slate-800",
          border: "hover:border-slate-700",
        };
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          ⚡ Quick Actions (The Big 4)
        </h3>
        <span className="text-[10px] text-emerald-400 font-medium">1-Tap Fast Logging</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {presets.map((preset) => {
          const styles = getActionStyles(preset.id);
          const Icon = styles.icon;
          const displayAvg = (preset.recentAverage || preset.defaultAmount) * exchangeRate;

          return (
            <button
              key={preset.id}
              onClick={() => onSelectAction(preset)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 ${styles.border} transition active:scale-95 group shadow-sm`}
            >
              <div
                className={`p-2 rounded-xl ${styles.bg} ${styles.color} mb-1.5 transition group-hover:scale-110`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-slate-200 truncate w-full text-center">
                {preset.name}
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5 font-medium">
                ~{formatCurrency(displayAvg, displayCurrency)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
