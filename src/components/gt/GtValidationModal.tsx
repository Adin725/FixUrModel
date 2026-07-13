"use client";

import React, { useState } from "react";
import { DatasetItem } from "@/types";
import { CheckCircle2, X, FileSpreadsheet } from "lucide-react";

interface GtValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingDataset?: DatasetItem[] | null;
  dataset?: DatasetItem[];
  csvFileName?: string;
  filename?: string;
  csvInfo?: { totalIds: number; totalLabels: number } | null;
  onApply?: (reason: string) => void;
  onConfirm?: (reason: string) => void;
}

export const GtValidationModal: React.FC<GtValidationModalProps> = ({
  isOpen,
  onClose,
  pendingDataset,
  dataset,
  csvFileName,
  filename,
  onApply,
  onConfirm,
}) => {
  const [reason, setReason] = useState("");

  const activeDataset = pendingDataset || dataset || [];
  const activeFileName = csvFileName || filename || "GroundTruth.csv";
  const handleConfirmAction = onApply || onConfirm;

  if (!isOpen || activeDataset.length === 0) return null;

  const total = activeDataset.length;
  const count0 = activeDataset.filter(
    (d) => d.groundTruthLabel === "Recyclable"
  ).length;
  const count1 = activeDataset.filter(
    (d) => d.groundTruthLabel === "Electronic"
  ).length;
  const count2 = activeDataset.filter(
    (d) => d.groundTruthLabel === "Organic"
  ).length;

  const pct0 = total > 0 ? ((count0 / total) * 100).toFixed(1) : "0";
  const pct1 = total > 0 ? ((count1 / total) * 100).toFixed(1) : "0";
  const pct2 = total > 0 ? ((count2 / total) * 100).toFixed(1) : "0";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handleConfirmAction) {
      handleConfirmAction(
        reason.trim() || `Pembaruan dari file CSV (${activeFileName})`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Validasi Tabular
              </span>
              <h3 className="mt-0.5 text-base font-bold text-zinc-900 dark:text-white">
                Analisis Distribusi Ground Truth
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-3">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-950">
            <span className="text-[10px] font-bold uppercase text-zinc-400">
              Total Sampel
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-zinc-900 dark:text-white">
              {total}
            </div>
            <span className="text-[10px] text-zinc-500">Terbaca dari CSV</span>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="text-[10px] font-bold uppercase">
              0 (Recyclable)
            </span>
            <div className="mt-1 font-mono text-2xl font-black">{count0}</div>
            <span className="text-[10px]">{pct0}% dari total</span>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300">
            <span className="text-[10px] font-bold uppercase">
              1 (Electronic)
            </span>
            <div className="mt-1 font-mono text-2xl font-black">{count1}</div>
            <span className="text-[10px]">{pct1}% dari total</span>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300">
            <span className="text-[10px] font-bold uppercase">
              2 (Organic)
            </span>
            <div className="mt-1 font-mono text-2xl font-black">{count2}</div>
            <span className="text-[10px]">{pct2}% dari total</span>
          </div>
        </div>

        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <span>Komposisi Kelas Ground Truth</span>
            <span className="font-mono text-zinc-500">{activeFileName}</span>
          </div>
          <div className="flex h-4 w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
            {count0 > 0 && (
              <div
                style={{ width: `${pct0}%` }}
                className="flex items-center justify-center bg-emerald-500 text-[10px] font-black text-white"
                title={`0 (Recyclable): ${count0}`}
              >
                {Number(pct0) > 10 ? `${pct0}%` : ""}
              </div>
            )}
            {count1 > 0 && (
              <div
                style={{ width: `${pct1}%` }}
                className="flex items-center justify-center bg-blue-500 text-[10px] font-black text-white"
                title={`1 (Electronic): ${count1}`}
              >
                {Number(pct1) > 10 ? `${pct1}%` : ""}
              </div>
            )}
            {count2 > 0 && (
              <div
                style={{ width: `${pct2}%` }}
                className="flex items-center justify-center bg-amber-500 text-[10px] font-black text-white"
                title={`2 (Organic): ${count2}`}
              >
                {Number(pct2) > 10 ? `${pct2}%` : ""}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Catatan / Alasan Audit Pembaruan
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Contoh: Koreksi label dari ${activeFileName}`}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 px-5 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Terapkan &amp; Sinkronkan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
