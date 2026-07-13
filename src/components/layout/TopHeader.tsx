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
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDark =
      savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
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
      <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-zinc-200/70 bg-white/85 px-8 backdrop-blur-md dark:border-zinc-800/80 dark:bg-[#0a0d17]/85">
        <div className="flex flex-1 items-center gap-4 max-w-md">
          <div className="flex w-full items-center gap-2.5 rounded-full border border-zinc-200/90 bg-zinc-50/90 px-4 py-2 text-zinc-800 transition-all focus-within:border-indigo-500 focus-within:bg-white focus-within:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:focus-within:border-indigo-500">
            <Search className="h-4 w-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari bereksperimen, ID sampel, atau peneliti..."
              className="w-full bg-transparent text-xs font-semibold outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3.5 py-1.5 dark:border-indigo-900/50 dark:bg-indigo-950/40">
            <Database className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
              GT Versi:{" "}
              <strong className="font-mono text-indigo-600 dark:text-indigo-400">
                {activeGtVersion}
              </strong>
            </span>
            <span className="text-[11px] font-semibold text-indigo-600/70 dark:text-indigo-400/70">
              ({dataset.length} sampel)
            </span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-3.5 py-1.5 dark:border-emerald-900/50 dark:bg-emerald-950/40">
            <FlaskConical className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
              Submission:{" "}
              <strong className="font-mono text-emerald-700 dark:text-emerald-300">
                {submissions.length}
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={toggleDarkMode}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-transform active:scale-95 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            title={
              isDarkMode ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"
            }
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
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
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-transform active:scale-95 hover:from-indigo-700 hover:to-violet-700"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Unduh Laporan</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/80 px-3.5 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="pin-card w-full max-w-md p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60">
                <ShieldAlert className="h-6 w-6 text-rose-600 dark:text-rose-400" />
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
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
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
