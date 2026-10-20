"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export function SettingsDrawer({
  isOpen,
  onClose,
  onDataRestored,
}: SettingsDrawerProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    window.location.href = "/api/system/export";
    setTimeout(() => {
      setIsExporting(false);
      setFeedbackMsg("Database backup exported successfully!");
      setTimeout(() => setFeedbackMsg(""), 3000);
    }, 1000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setErrorMsg("");
    setFeedbackMsg("");

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const res = await fetch("/api/system/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to restore database");

      setFeedbackMsg("Database restored successfully!");
      onDataRestored();
      setTimeout(() => {
        setFeedbackMsg("");
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid JSON backup file");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        "Reset all data to default baseline?\n\nA safety backup of your current database will be saved automatically."
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/system/reset", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to reset");

      setFeedbackMsg("Database reset to defaults!");
      onDataRestored();
      setTimeout(() => {
        setFeedbackMsg("");
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert("App can be installed via your browser menu ('Add to Home Screen' or 'Install FinFlow')");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Settings & Data Storage</h3>
            <p className="text-[11px] text-slate-400">Pure JSON Flat-File Architecture</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {feedbackMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Database Backup Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Database Backups & Portability
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col items-center justify-center gap-1.5 text-center transition active:scale-95"
            >
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <Download className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">Export Backup</span>
              <span className="text-[10px] text-slate-500">Download db.json</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col items-center justify-center gap-1.5 text-center transition active:scale-95"
            >
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">Restore Backup</span>
              <span className="text-[10px] text-slate-500">Upload JSON</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />
        </div>

        {/* PWA Mobile Installation */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Mobile Home Screen</p>
              <p className="text-[10px] text-slate-400">Install as standalone native PWA</p>
            </div>
          </div>
          <button
            onClick={handleInstallPWA}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition active:scale-95"
          >
            Install
          </button>
        </div>

        {/* Reset Option */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Danger Zone
          </h4>
          <button
            onClick={handleReset}
            className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Database to Defaults</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-500 pt-2">
          FinFlow v1.0.0 • Pure JSON Atomic Storage • Node.js
        </div>
      </div>
    </div>
  );
}
