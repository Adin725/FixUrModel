"use client";

import React from "react";
import { Submission, ClassLabel } from "@/types";
import { CLASSES } from "@/lib/evaluator";
import {
  X,
  Activity,
  TrendingUp,
  TrendingDown,
  Layers,
  BarChart3,
  Grid,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface EvaluationModalProps {
  submission: Submission | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EvaluationModal({
  submission,
  isOpen,
  onClose,
}: EvaluationModalProps) {
  if (!isOpen || !submission) return null;

  const summary = submission.evaluationSummary;
  const gap = submission.generalizationGap;

  const chartData = summary.perClassMetrics.map((item) => ({
    className: item.className,
    Precision: Number((item.precision * 100).toFixed(2)),
    Recall: Number((item.recall * 100).toFixed(2)),
    "F1 Score": Number((item.f1Score * 100).toFixed(2)),
  }));

  const getClassBadgeColor = (cls: ClassLabel) => {
    switch (cls) {
      case "Recyclable":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
      case "Electronic":
        return "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300";
      case "Organic":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 items-center rounded-full bg-blue-600 px-2.5 text-xs font-bold text-white">
                Rank #{submission.rank}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {submission.name} — Evaluasi Lengkap
              </h2>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Model:{" "}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {submission.modelName}
              </span>{" "}
              • Leaderboard:{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {submission.leaderboardName}
              </span>{" "}
              • Diunggah: {submission.uploadTimestampWIB}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                1. Ringkasan Metrik Utama
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                <span className="block text-[11px] font-medium text-zinc-500">
                  Accuracy
                </span>
                <span className="mt-1 block text-lg font-bold text-zinc-900 dark:text-white">
                  {(summary.accuracy * 100).toFixed(2)}%
                </span>
              </div>

              <div className="rounded-xl border border-blue-500/30 bg-blue-50/50 p-3 dark:border-blue-500/30 dark:bg-blue-950/20">
                <span className="block text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  Macro F1 Test
                </span>
                <span className="mt-1 block text-lg font-bold text-blue-700 dark:text-blue-300">
                  {(summary.macroF1 * 100).toFixed(2)}%
                </span>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                <span className="block text-[11px] font-medium text-zinc-500">
                  Macro Precision
                </span>
                <span className="mt-1 block text-lg font-bold text-zinc-900 dark:text-white">
                  {(summary.macroPrecision * 100).toFixed(2)}%
                </span>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                <span className="block text-[11px] font-medium text-zinc-500">
                  Macro Recall
                </span>
                <span className="mt-1 block text-lg font-bold text-zinc-900 dark:text-white">
                  {(summary.macroRecall * 100).toFixed(2)}%
                </span>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                <span className="block text-[11px] font-medium text-zinc-500">
                  Micro F1
                </span>
                <span className="mt-1 block text-lg font-bold text-zinc-900 dark:text-white">
                  {(summary.microF1 * 100).toFixed(2)}%
                </span>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                <span className="block text-[11px] font-medium text-zinc-500">
                  Weighted F1
                </span>
                <span className="mt-1 block text-lg font-bold text-zinc-900 dark:text-white">
                  {(summary.weightedF1 * 100).toFixed(2)}%
                </span>
              </div>

              <div
                className={`rounded-xl border p-3 ${
                  gap >= 0
                    ? "border-emerald-500/30 bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300"
                    : gap >= -0.03
                    ? "border-amber-500/30 bg-amber-50/40 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300"
                    : "border-red-500/30 bg-red-50/40 text-red-800 dark:bg-red-950/20 dark:text-red-300"
                }`}
              >
                <span className="block text-[11px] font-medium opacity-80">
                  Generalization Gap
                </span>
                <div className="mt-1 flex items-center gap-1 text-lg font-bold">
                  {gap >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>
                    {gap > 0 ? "+" : ""}
                    {(gap * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-violet-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                2. Evaluasi Per Kelas (Classification Report)
              </h3>
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Kelas Target</th>
                    <th className="px-4 py-3 font-semibold">Precision</th>
                    <th className="px-4 py-3 font-semibold">Recall</th>
                    <th className="px-4 py-3 font-semibold">F1 Score</th>
                    <th className="px-4 py-3 font-semibold">Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {summary.perClassMetrics.map((m) => (
                    <tr
                      key={m.className}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40"
                    >
                      <td className="px-4 py-3 font-semibold">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getClassBadgeColor(
                            m.className
                          )}`}
                        >
                          {m.className}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {(m.precision * 100).toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {(m.recall * 100).toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {(m.f1Score * 100).toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-500">
                        {m.support} gambar
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Grid className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  3. Confusion Matrix Interaktif
                </h3>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30">
                <div className="text-[11px] font-semibold text-zinc-500 mb-2 text-center">
                  Prediksi Model (Kolom) vs Ground Truth (Baris)
                </div>
                <table className="w-full text-center text-xs">
                  <thead>
                    <tr>
                      <th className="p-2 text-zinc-400 font-medium">GT \ Pred</th>
                      {CLASSES.map((cls) => (
                        <th
                          key={cls}
                          className="p-2 font-bold text-zinc-700 dark:text-zinc-300"
                        >
                          {cls.slice(0, 4)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CLASSES.map((rowCls) => (
                      <tr key={rowCls}>
                        <td className="p-2 font-bold text-left text-zinc-700 dark:text-zinc-300">
                          {rowCls}
                        </td>
                        {CLASSES.map((colCls) => {
                          const val = summary.confusionMatrix[rowCls][colCls];
                          const isDiag = rowCls === colCls;
                          return (
                            <td
                              key={colCls}
                              className={`p-3 font-mono font-bold rounded-lg ${
                                isDiag
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : val > 0
                                  ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300"
                                  : "bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  4. Visualisasi Performa Antar Kelas (%)
                </h3>
              </div>

              <div className="h-64 w-full rounded-xl border border-zinc-200 p-3 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="className" stroke="#888" fontSize={11} />
                    <YAxis stroke="#888" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #333",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="Precision" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Recall" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="F1 Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Tutup Evaluasi
          </button>
        </div>
      </div>
    </div>
  );
}
