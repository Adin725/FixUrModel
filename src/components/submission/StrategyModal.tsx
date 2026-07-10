"use client";

import React from "react";
import { Submission } from "@/types";
import { X, FileText, User, Calendar, Cpu } from "lucide-react";

interface StrategyModalProps {
  submission: Submission | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StrategyModal({
  submission,
  isOpen,
  onClose,
}: StrategyModalProps) {
  if (!isOpen || !submission) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
      <div className="h-full w-full max-w-md border-l border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <div>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                {submission.name}
              </span>
              <h2 className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                Detail Strategi Eksperimen
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 space-y-5">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-2">
              <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <Cpu className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-zinc-900 dark:text-white">
                  Model:
                </span>
                <span>{submission.modelName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <User className="h-4 w-4 text-violet-600" />
                <span className="font-semibold text-zinc-900 dark:text-white">
                  Leaderboard:
                </span>
                <span>{submission.leaderboardName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-zinc-900 dark:text-white">
                  Diunggah:
                </span>
                <span>{submission.uploadTimestampWIB}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Keterangan Strategi
                </span>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 shadow-xs">
                {submission.strategyDescription}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-zinc-900 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Tutup Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
