"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import {
  RotateCcw,
  ShieldAlert,
  Download,
  Database,
  FlaskConical,
  Search,
  Sun,
  Moon,
} from "lucide-react";
import { downloadLeaderboardPDF } from "@/lib/pdfExport";

export const TopHeader: React.FC = () => {
  const { activeGtVersion, dataset, submissions, resetAllProcessToZero } =
    useAppStore();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleConfirmReset = () => {
    resetAllProcessToZero();
    setIsResetModalOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-zinc-200/80 bg-white/80 px-8 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="flex flex-1 items-center gap-4 max-w-md">
          <div className="flex w-full items-center gap-2.5 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-zinc-800 transition-colors focus-within:border-blue-500 focus-within:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:focus-within:border-blue-500 dark:focus-within:bg-zinc-900">
            <Search className="h-4 w-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari eksperimen, arsitektur, atau peneliti..."
              className="w-full bg-transparent text-xs font-medium outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white px-3.5 py-1.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <Database className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              GT:{" "}
              <strong className="font-mono text-blue-600 dark:text-blue-400">
                {activeGtVersion}
              </strong>
            </span>
            <span className="text-[11px] font-medium text-zinc-500">
              ({dataset.length} sampel)
            </span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white px-3.5 py-1.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <FlaskConical className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Run:{" "}
              <strong className="font-mono text-zinc-900 dark:text-white">
                {submissions.length}
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={toggleDarkMode}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-white text-zinc-600 shadow-2xs transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            title={isDarkMode ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-zinc-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              downloadLeaderboardPDF(
                submissions,
                activeGtVersion,
                dataset.length
              )
            }
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Laporan</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/60">
                <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Konfirmasi Reset Platform
                </h3>
                <p className="text-xs text-zinc-500">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <p className="mb-6 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Anda akan mereset seluruh data submission eksperimen dan
              mengembalikan versi Ground Truth ke kondisi awal (0 sampel
              terindeks). Platform akan kembali bersih untuk putaran penelitian
              baru.
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="rounded-xl bg-zinc-100 px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Ya, Reset Seluruh Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
