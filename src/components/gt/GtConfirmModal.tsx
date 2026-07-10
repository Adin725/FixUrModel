"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface GtConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export function GtConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title = "Konfirmasi Perubahan Ground Truth",
  message = "Apakah Anda yakin ingin mengganti Ground Truth yang sedang digunakan? Seluruh evaluasi submission berikutnya akan menggunakan Ground Truth terbaru.",
}: GtConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
          >
            Ya, Ganti Ground Truth
          </button>
        </div>
      </div>
    </div>
  );
}
