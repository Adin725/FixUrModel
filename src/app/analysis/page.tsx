"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ClassLabel } from "@/types";
import { useAppStore } from "@/lib/store";
import { computeItemAgreement } from "@/lib/evaluator";
import {
  Save,
  CheckCircle2,
  ArrowRight,
  Search,
  RotateCcw,
  Database,
  SlidersHorizontal,
  Hash,
} from "lucide-react";

export default function GroundTruthAnalysisPage() {
  const { dataset, submissions, updateGroundTruthBatch, activeGtVersion } =
    useAppStore();

  const [pageSize, setPageSize] = useState<number | "all">(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchId, setSearchId] = useState("");
  const [filterAgreement, setFilterAgreement] = useState<
    "all" | "disagree" | "perfect"
  >("all");
  const [editingLabels, setEditingLabels] = useState<Record<number, ClassLabel>>(
    {}
  );
  const [revisionReason, setRevisionReason] = useState("");
  const [batchResult, setBatchResult] = useState<{
    changedCount: number;
    submissionCount: number;
    version: string;
  } | null>(null);

  const predictionsList = useMemo(
    () => submissions.map((s) => s.predictions),
    [submissions]
  );

  const enrichedItems = useMemo(() => {
    return dataset
      .map((item) => ({
        ...item,
        agreement: computeItemAgreement(
          item.id,
          item.groundTruthLabel,
          predictionsList
        ),
      }))
      .filter((item) => {
        if (searchId && !String(item.id).includes(searchId)) return false;
        if (filterAgreement === "disagree" && item.agreement === 100)
          return false;
        if (filterAgreement === "perfect" && item.agreement < 100)
          return false;
        return true;
      })
      .sort((a, b) => a.agreement - b.agreement || a.id - b.id);
  }, [dataset, predictionsList, searchId, filterAgreement]);

  const totalPages =
    pageSize === "all"
      ? 1
      : Math.max(1, Math.ceil(enrichedItems.length / (pageSize as number)));
  const paginatedItems =
    pageSize === "all"
      ? enrichedItems
      : enrichedItems.slice(
          (currentPage - 1) * (pageSize as number),
          currentPage * (pageSize as number)
        );

  const pendingCount = Object.keys(editingLabels).length;

  const handleStageLabelChange = (itemId: number, newLabel: ClassLabel) => {
    const original = dataset.find((d) => d.id === itemId);
    if (original && original.groundTruthLabel === newLabel) {
      const next = { ...editingLabels };
      delete next[itemId];
      setEditingLabels(next);
    } else {
      setEditingLabels({ ...editingLabels, [itemId]: newLabel });
    }
  };

  const handleSubmitBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingCount === 0) return;
    const reason =
      revisionReason.trim() || `Revisi manual GT sebanyak ${pendingCount} sampel`;
    const changedCount = updateGroundTruthBatch(editingLabels, reason);
    setBatchResult({
      changedCount,
      submissionCount: submissions.length,
      version: activeGtVersion,
    });
    setEditingLabels({});
    setRevisionReason("");
  };

  const getAgreementBadge = (agr: number) =>
    agr === 100
      ? "bg-emerald-500 text-white shadow-xs"
      : agr >= 70
      ? "bg-amber-500 text-white shadow-xs"
      : "bg-rose-600 text-white shadow-xs";

  const filterBtns = [
    { key: "all", label: "Semua Sampel", color: "bg-indigo-600 text-white" },
    {
      key: "disagree",
      label: "Ambigu (< 100%)",
      color: "bg-amber-600 text-white",
    },
    {
      key: "perfect",
      label: "Konsisten (100%)",
      color: "bg-emerald-600 text-white",
    },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-14">
      {/* Hero Header Bento Banner */}
      <div className="pin-card pin-card-lavender flex flex-wrap items-center justify-between gap-6 p-7">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
            Analisis Konsistensi &amp; Kalibrasi
          </span>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Audit Ambiguitas Prediksi vs Ground Truth
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
            Koreksi label tabular secara berjenjang dan observasi perbandingan
            prediksi seluruh submission model secara konsisten tanpa overhead
            preview biner.
          </p>
        </div>

        <Link
          href="/analysis/deep"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#4d3fa3] px-5 py-3 text-xs font-black text-white shadow-lg transition-transform active:scale-95 hover:bg-[#3d3185]"
        >
          <span>Investigasi Kasus Sulit</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {batchResult && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <div className="text-xs">
            <strong>Ground Truth versi {batchResult.version} aktif:</strong>{" "}
            Berhasil merevisi {batchResult.changedCount} sampel label dan
            menghitung ulang {batchResult.submissionCount} submission model.
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="pin-card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari ID Sampel..."
              className="w-48 rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-3 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <div className="flex gap-1.5 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
            {filterBtns.map(({ key, label, color }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setFilterAgreement(key);
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  filterAgreement === key
                    ? color
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Baris per halaman:</span>
          {[10, 50, 100, "all"].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                setPageSize(size as number | "all");
                setCurrentPage(1);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                pageSize === size
                  ? "bg-[#4d3fa3] text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {size === "all" ? "Semua" : size}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tabular Analysis Table (ZERO IMAGE PREVIEW COLUMN) */}
      <div className="pin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="pin-table">
            <thead>
              <tr>
                <th className="w-24">ID Sampel</th>
                <th>Ground Truth Aktif (Pilih Koreksi)</th>
                {submissions.map((sub) => (
                  <th key={sub.id} className="text-indigo-600 dark:text-indigo-400">
                    {sub.name}
                  </th>
                ))}
                <th className="text-right">Agreement</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={3 + submissions.length}
                    className="py-12 text-center text-xs text-zinc-400"
                  >
                    Tidak ada sampel data sesuai filter pencarian saat ini.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const currentLabel =
                    editingLabels[item.id] || item.groundTruthLabel;
                  const isModified = currentLabel !== item.groundTruthLabel;
                  return (
                    <tr
                      key={item.id}
                      className={
                        isModified
                          ? "bg-amber-50/60 dark:bg-amber-950/20"
                          : ""
                      }
                    >
                      <td className="font-mono font-black text-zinc-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 text-zinc-400" />
                          <span>#{item.id}</span>
                        </div>
                      </td>

                      <td>
                        <div className="flex items-center gap-2.5">
                          <select
                            value={currentLabel}
                            onChange={(e) =>
                              handleStageLabelChange(
                                item.id,
                                e.target.value as ClassLabel
                              )
                            }
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold outline-none transition-colors ${
                              isModified
                                ? "border-2 border-amber-500 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                                : "border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                            }`}
                          >
                            <option value="Recyclable">0 — Recyclable</option>
                            <option value="Electronic">1 — Electronic</option>
                            <option value="Organic">2 — Organic</option>
                          </select>
                          {isModified && (
                            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black text-white">
                              Direvisi
                            </span>
                          )}
                        </div>
                      </td>

                      {submissions.map((sub) => {
                        const pred = sub.predictions[item.id] || "Recyclable";
                        const matches = pred === item.groundTruthLabel;
                        return (
                          <td
                            key={sub.id}
                            className={`font-semibold ${
                              matches
                                ? "text-zinc-600 dark:text-zinc-300"
                                : "font-black text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {pred}
                          </td>
                        );
                      })}

                      <td className="text-right">
                        <span
                          className={`inline-block rounded-xl px-3 py-1 font-mono text-xs font-black ${getAgreementBadge(
                            item.agreement
                          )}`}
                        >
                          {item.agreement}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pageSize !== "all" && totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
          <span>
            Halaman <strong className="text-zinc-900 dark:text-white">{currentPage}</strong> dari {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {/* Batch Commit Pinterest Card */}
      <div className="pin-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Konfirmasi Kolektif Revisi Ground Truth
              </h3>
              <p className="text-xs text-zinc-500">
                Akan menerapkan koreksi pada {pendingCount} sampel dan mengaudit
                ulang evaluasi F1
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-3.5 py-1 text-xs font-black ${
              pendingCount > 0
                ? "bg-amber-500 text-white"
                : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
            }`}
          >
            {pendingCount} Sampel Diubah
          </span>
        </div>

        <form onSubmit={handleSubmitBatch} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Alasan Audit &amp; Catatan Revisi
            </label>
            <input
              type="text"
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="Contoh: Koreksi label sampel bernomor #14 dan #89 berdasarkan pengujian lapangan..."
              disabled={pendingCount === 0}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold outline-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setEditingLabels({})}
              disabled={pendingCount === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Batal</span>
            </button>
            <button
              type="submit"
              disabled={pendingCount === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4d3fa3] px-6 py-2.5 text-xs font-black text-white shadow-md transition-transform active:scale-95 hover:bg-[#3d3185] disabled:opacity-40"
            >
              <Save className="h-4 w-4" />
              <span>
                Terapkan Perubahan ({pendingCount} Sampel)
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
