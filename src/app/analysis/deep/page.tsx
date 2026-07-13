"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ClassLabel } from "@/types";
import { useAppStore } from "@/lib/store";
import { computeItemAgreement } from "@/lib/evaluator";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  AlertTriangle,
  Hash,
} from "lucide-react";

export default function DeepAnalysisPage() {
  const { dataset, submissions, updateSingleGroundTruthLabel } =
    useAppStore();

  const [editingLabels, setEditingLabels] = useState<
    Record<number, ClassLabel>
  >({});
  const [savedRowId, setSavedRowId] = useState<number | null>(null);

  const predictionsList = useMemo(
    () => submissions.map((s) => s.predictions),
    [submissions]
  );

  const difficultItems = useMemo(() => {
    const list = dataset
      .map((item) => {
        const agreement = computeItemAgreement(
          item.id,
          item.groundTruthLabel,
          predictionsList
        );
        return {
          ...item,
          agreement,
        };
      })
      .filter((item) => item.agreement < 100);

    list.sort((a, b) => a.agreement - b.agreement);
    return list;
  }, [dataset, predictionsList]);

  const handleSaveLabel = (itemId: number) => {
    const newLabel = editingLabels[itemId];
    if (!newLabel) return;
    updateSingleGroundTruthLabel(
      itemId,
      newLabel,
      `Koreksi label pada sampel ID #${itemId} menjadi ${newLabel}`
    );
    setSavedRowId(itemId);
    setTimeout(() => {
      setSavedRowId(null);
    }, 2000);
  };

  const getAgreementBadge = (agr: number) => {
    if (agr < 60) {
      return "bg-rose-600 text-white";
    }
    return "bg-amber-500 text-white";
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-14">
      {/* Hero Banner Bento */}
      <div className="pin-card pin-card-rose flex flex-wrap items-center justify-between gap-6 p-7">
        <div>
          <Link
            href="/analysis"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:underline dark:text-rose-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Analisis Keseluruhan</span>
          </Link>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Investigasi Kasus Sulit &amp; Ambiguitas Model
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
            Menyorot sampel dengan kesepakatan prediksi &lt; 100% untuk
            pemeriksaan kalibrasi Ground Truth secara langsung.
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-2xl bg-white/80 px-4 py-3 text-xs font-black text-rose-800 shadow-sm dark:bg-zinc-900 dark:text-rose-300">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          <span>
            Terdeteksi {difficultItems.length} Sampel Ambigu
          </span>
        </div>
      </div>

      <div className="pin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="pin-table">
            <thead>
              <tr>
                <th className="w-24">ID Sampel</th>
                <th>Ground Truth (Tinjau &amp; Simpan)</th>
                {submissions.map((sub) => (
                  <th key={sub.id} className="text-indigo-600 dark:text-indigo-400">
                    {sub.name}
                  </th>
                ))}
                <th className="text-right">Agreement</th>
              </tr>
            </thead>
            <tbody>
              {difficultItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={submissions.length + 3}
                    className="py-14 text-center text-xs font-semibold text-zinc-400"
                  >
                    Seluruh prediksi submission mencapai kesepakatan 100%
                    dengan Ground Truth.
                  </td>
                </tr>
              ) : (
                difficultItems.map((item) => {
                  const currentLabel =
                    editingLabels[item.id] || item.groundTruthLabel;
                  const isModified =
                    currentLabel !== item.groundTruthLabel;
                  const isRecentlySaved = savedRowId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={
                        isModified
                          ? "bg-amber-50/70 dark:bg-amber-950/20"
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
                              setEditingLabels({
                                ...editingLabels,
                                [item.id]: e.target.value as ClassLabel,
                              })
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
                            <button
                              type="button"
                              onClick={() => handleSaveLabel(item.id)}
                              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-black text-white shadow-sm hover:bg-indigo-700"
                            >
                              <Save className="h-3.5 w-3.5" />
                              <span>Simpan</span>
                            </button>
                          )}

                          {isRecentlySaved && (
                            <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Tersimpan
                            </span>
                          )}
                        </div>
                      </td>

                      {submissions.map((sub) => {
                        const pred = sub.predictions[item.id] || "Recyclable";
                        const matchesGT = pred === item.groundTruthLabel;

                        return (
                          <td
                            key={sub.id}
                            className={`font-semibold ${
                              matchesGT
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
    </div>
  );
}
