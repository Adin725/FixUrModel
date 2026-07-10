"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ClassLabel } from "@/types";
import { useAppStore } from "@/lib/store";
import { computeItemAgreement } from "@/lib/evaluator";
import { ItemThumbnail } from "@/components/ui/ItemThumbnail";
import {
  Sparkles,
  ArrowLeft,
  Save,
  CheckCircle,
  AlertTriangle,
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
      `Analisis Mendalam: Koreksi manual label pada gambar ID #${itemId} menjadi ${newLabel}`
    );
    setSavedRowId(itemId);
    setTimeout(() => {
      setSavedRowId(null);
    }, 2000);
  };

  const getAgreementBadgeStyle = (agr: number) => {
    if (agr < 60) {
      return "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300";
    }
    return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/analysis"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Analisis Lengkap</span>
            </Link>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Analisis Mendalam Ground Truth (Kasus Sulit)
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500">
            Hanya menampilkan gambar dengan Agreement &lt; 100%, diurutkan dari
            Agreement terendah menuju tertinggi
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-50/70 px-4 py-2.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Ditemukan <strong>{difficultItems.length}</strong> gambar ambigu!
            yok guys kita cek bareng!
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50 uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
              <tr>
                <th className="px-4 py-3 font-semibold">Preview Gambar</th>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">
                  Ground Truth (Tinjau Ulang)
                </th>
                {submissions.map((sub) => (
                  <th
                    key={sub.id}
                    className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400"
                  >
                    {sub.name}
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold text-right">
                  Agreement (Terendah)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {difficultItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={submissions.length + 4}
                    className="px-4 py-12 text-center text-zinc-500"
                  >
                    Luar biasa! Seluruh prediksi model mencapai 100% agreement
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
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                    >
                      <td className="px-4 py-3">
                        <ItemThumbnail
                          id={item.id}
                          imageNumber={item.imageNumber}
                          label={item.groundTruthLabel}
                          size="sm"
                        />
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-zinc-900 dark:text-white">
                        #{item.id}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={currentLabel}
                            onChange={(e) =>
                              setEditingLabels({
                                ...editingLabels,
                                [item.id]: e.target.value as ClassLabel,
                              })
                            }
                            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-800 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                          >
                            <option value="Recyclable">Recyclable</option>
                            <option value="Electronic">Electronic</option>
                            <option value="Organic">Organic</option>
                          </select>

                          {isModified && (
                            <button
                              type="button"
                              onClick={() => handleSaveLabel(item.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                            >
                              <Save className="h-3.5 w-3.5" />
                              <span>Save</span>
                            </button>
                          )}

                          {isRecentlySaved && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Tersimpan!
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
                            className={`px-4 py-3 font-medium ${matchesGT
                                ? "text-zinc-800 dark:text-zinc-200"
                                : "font-bold text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20"
                              }`}
                          >
                            {pred}
                          </td>
                        );
                      })}

                      <td className="px-4 py-3 text-right font-mono font-bold">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${getAgreementBadgeStyle(
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
