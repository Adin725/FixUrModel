"use client";

import React, { useState } from "react";
import { DatasetItem, ClassLabel } from "@/types";
import {
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from "lucide-react";

interface GtValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  dataset: DatasetItem[];
  filename?: string;
}

export const GtValidationModal: React.FC<GtValidationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  dataset,
  filename = "GroundTruth.csv",
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen || dataset.length === 0) return null;

  const total = dataset.length;
  const count0 = dataset.filter((d) => d.groundTruthLabel === "Recyclable").length;
  const count1 = dataset.filter((d) => d.groundTruthLabel === "Electronic").length;
  const count2 = dataset.filter((d) => d.groundTruthLabel === "Organic").length;

  const pct0 = total > 0 ? ((count0 / total) * 100).toFixed(1) : "0";
  const pct1 = total > 0 ? ((count1 / total) * 100).toFixed(1) : "0";
  const pct2 = total > 0 ? ((count2 / total) * 100).toFixed(1) : "0";

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(
      reason.trim() || `Pembaruan Ground Truth dari file CSV (${filename})`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-zinc-900 bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-zinc-100 dark:bg-zinc-900 dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.85)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-4 dark:border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-zinc-900 bg-amber-300 text-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-block rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white dark:bg-zinc-100 dark:text-zinc-900">
                Validasi Pembacaan CSV
              </span>
              <h3 className="mt-1 text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                Analisis Distribusi Ground Truth
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border-2 border-zinc-900 p-2 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Overview Stats */}
        <div className="mt-5 grid grid-cols-4 gap-3">
          <div className="rounded-xl border-2 border-zinc-900 bg-zinc-100 p-3.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-zinc-100 dark:bg-zinc-800">
            <span className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">
              Total Sampel
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-zinc-900 dark:text-white">
              {total}
            </div>
            <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
              Sampel Terbaca
            </span>
          </div>

          <div className="rounded-xl border-2 border-zinc-900 bg-emerald-100 p-3.5 text-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black uppercase text-emerald-800">
              Label 0 (Recyclable)
            </span>
            <div className="mt-1 font-mono text-2xl font-black">
              {count0}
            </div>
            <span className="text-[10px] font-bold text-emerald-900">
              {pct0}% dari total
            </span>
          </div>

          <div className="rounded-xl border-2 border-zinc-900 bg-blue-100 p-3.5 text-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black uppercase text-blue-800">
              Label 1 (Electronic)
            </span>
            <div className="mt-1 font-mono text-2xl font-black">
              {count1}
            </div>
            <span className="text-[10px] font-bold text-blue-900">
              {pct1}% dari total
            </span>
          </div>

          <div className="rounded-xl border-2 border-zinc-900 bg-amber-100 p-3.5 text-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black uppercase text-amber-800">
              Label 2 (Organic)
            </span>
            <div className="mt-1 font-mono text-2xl font-black">
              {count2}
            </div>
            <span className="text-[10px] font-bold text-amber-900">
              {pct2}% dari total
            </span>
          </div>
        </div>

        {/* Visual Distribution Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <span>Komposisi Kelas Ground Truth</span>
            <span className="font-mono text-zinc-500">{filename}</span>
          </div>
          <div className="flex h-5 w-full overflow-hidden rounded-lg border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-zinc-100">
            {count0 > 0 && (
              <div
                style={{ width: `${pct0}%` }}
                className="flex items-center justify-center bg-emerald-400 text-[10px] font-black text-zinc-900"
                title={`0 (Recyclable): ${count0}`}
              >
                {Number(pct0) > 10 ? `${pct0}%` : ""}
              </div>
            )}
            {count1 > 0 && (
              <div
                style={{ width: `${pct1}%` }}
                className="flex items-center justify-center bg-blue-400 text-[10px] font-black text-zinc-900"
                title={`1 (Electronic): ${count1}`}
              >
                {Number(pct1) > 10 ? `${pct1}%` : ""}
              </div>
            )}
            {count2 > 0 && (
              <div
                style={{ width: `${pct2}%` }}
                className="flex items-center justify-center bg-amber-400 text-[10px] font-black text-zinc-900"
                title={`2 (Organic): ${count2}`}
              >
                {Number(pct2) > 10 ? `${pct2}%` : ""}
              </div>
            )}
          </div>
        </div>

        {/* Sample Preview Table */}
        <div className="mt-5 rounded-xl border-2 border-zinc-900 bg-zinc-50 p-3.5 dark:border-zinc-100 dark:bg-zinc-950">
          <div className="mb-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
            Pratinjau Sampel Label CSV Terbaca (8 Sampel Pertama):
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {dataset.slice(0, 8).map((item) => {
              const code =
                item.groundTruthLabel === "Recyclable"
                  ? 0
                  : item.groundTruthLabel === "Electronic"
                  ? 1
                  : 2;
              const badgeColor =
                code === 0
                  ? "bg-emerald-300 text-zinc-900"
                  : code === 1
                  ? "bg-blue-300 text-zinc-900"
                  : "bg-amber-300 text-zinc-900";

              return (
                <div
                  key={item.id}
                  className="flex flex-col items-center justify-center rounded-lg border border-zinc-300 bg-white p-2 text-center shadow-2xs dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <span className="font-mono text-[10px] text-zinc-500">
                    #{item.id}
                  </span>
                  <span
                    className={`mt-1 rounded px-1.5 py-0.5 font-mono text-xs font-black ${badgeColor}`}
                  >
                    L-{code}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Confirmation */}
        <form onSubmit={handleConfirm} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
              Catatan / Alasan Pembaruan Ground Truth (Disimpan ke Riwayat Audit)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Contoh: Koreksi label manual dari CSV ${filename}`}
              className="w-full rounded-xl border-2 border-zinc-900 bg-white px-3.5 py-2.5 text-xs font-semibold text-zinc-900 focus:outline-none dark:border-zinc-100 dark:bg-zinc-950 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border-2 border-zinc-900 px-5 py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl border-2 border-zinc-900 bg-blue-600 px-6 py-2.5 text-xs font-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-700 dark:border-zinc-100 dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.9)]"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Terapkan & Evaluasi Ulang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
