"use client";

import React from "react";
import { X, Check, Globe } from "lucide-react";

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "DZD", name: "Algerian Dinar", symbol: "DA" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "DH" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
];

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency: string;
  onSelectCurrency: (code: string) => void;
  rates?: Record<string, number>;
}

export function CurrencyModal({
  isOpen,
  onClose,
  selectedCurrency,
  onSelectCurrency,
  rates = {},
}: CurrencyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Select Display Currency</h3>
              <p className="text-[11px] text-slate-400">View wallet and expenses with live bank rates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {SUPPORTED_CURRENCIES.map((curr) => {
            const isSelected = selectedCurrency === curr.code;
            const rate = rates[curr.code];

            return (
              <button
                key={curr.code}
                onClick={() => {
                  onSelectCurrency(curr.code);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border transition flex items-center justify-between text-left active:scale-95 ${
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-500/40 text-white"
                    : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isSelected
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {curr.symbol}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{curr.code}</span>
                      <span className="text-[11px] text-slate-400">• {curr.name}</span>
                    </div>
                    {rate && rate !== 1 && (
                      <span className="text-[10px] text-slate-500">
                        1 USD = {rate.toFixed(2)} {curr.code}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
