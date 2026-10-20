"use client";

import React from "react";
import { Wallet, BarChart3, Repeat, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

export type NavTab = "wallet" | "analytics" | "routines" | "simulator";

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "wallet" as NavTab, label: "Wallet", icon: Wallet },
    { id: "analytics" as NavTab, label: "Analytics", icon: BarChart3 },
    { id: "routines" as NavTab, label: "Routines", icon: Repeat },
    { id: "simulator" as NavTab, label: "What-If", icon: Lightbulb },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-[#0B0F19]/95 backdrop-blur-xl border-t border-slate-800/80 px-3 py-2">
      <div className="grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors active:scale-95"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-slate-800/70 border border-slate-700/50 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
                }`}
              />
              <span
                className={`text-[11px] font-medium mt-1 transition-colors ${
                  isActive ? "text-emerald-400 font-semibold" : "text-slate-400"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
