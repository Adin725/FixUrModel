"use client";

import React, { useState } from "react";
import { ClassLabel } from "@/types";
import { useAppStore } from "@/lib/store";
import { CLASSES } from "@/lib/evaluator";
import {
  GitCompare,
  CheckCircle2,
  Award,
  Layers,
  BarChart3,
  Sparkles,
  TrendingUp,
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
  AreaChart,
  Area,
} from "recharts";

export default function CompareModelsPage() {
  const { submissions } = useAppStore();

  const [idA, setIdA] = useState<string>(
    submissions.length > 0 ? submissions[0].id : ""
  );
  const [idB, setIdB] = useState<string>(
    submissions.length > 1 ? submissions[1].id : ""
  );

  const modelA = submissions.find((s) => s.id === idA) || null;
  const modelB = submissions.find((s) => s.id === idB) || null;

  const getAutomatedInsights = () => {
    if (!modelA || !modelB) return [];
    const insights: string[] = [];

    const f1Diff = (modelA.testMacroF1 - modelB.testMacroF1) * 100;
    if (Math.abs(f1Diff) >= 0.1) {
      if (f1Diff > 0) {
        insights.push(
          `${modelA.name} memiliki keunggulan keseluruhan Macro F1 sebesar +${f1Diff.toFixed(2)}% dibandingkan ${modelB.name}.`
        );
      } else {
        insights.push(
          `${modelB.name} memiliki keunggulan keseluruhan Macro F1 sebesar +${Math.abs(f1Diff).toFixed(2)}% dibandingkan ${modelA.name}.`
        );
      }
    }

    const perClassA = modelA.evaluationSummary.perClassMetrics;
    const perClassB = modelB.evaluationSummary.perClassMetrics;

    for (const cls of CLASSES) {
      const mA = perClassA.find((c) => c.className === cls);
      const mB = perClassB.find((c) => c.className === cls);
      if (mA && mB) {
        const diffCls = (mA.f1Score - mB.f1Score) * 100;
        if (diffCls > 1.0) {
          insights.push(
            `${modelA.name} memiliki performa lebih baik pada kelas ${cls} (+${diffCls.toFixed(2)}% F1).`
          );
        } else if (diffCls < -1.0) {
          insights.push(
            `${modelB.name} memiliki performa lebih baik pada kelas ${cls} (+${Math.abs(diffCls).toFixed(2)}% F1).`
          );
        }
      }
    }

    if (insights.length === 0) {
      insights.push(
        "Kedua model memiliki performa yang sangat mirip di seluruh kelas."
      );
    }
    return insights;
  };

  const chartData = CLASSES.map((cls) => {
    const mA =
      modelA?.evaluationSummary.perClassMetrics.find(
        (m) => m.className === cls
      ) || null;
    const mB =
      modelB?.evaluationSummary.perClassMetrics.find(
        (m) => m.className === cls
      ) || null;

    return {
      className: cls,
      [modelA ? `${modelA.name} (F1)` : "Model A"]: mA
        ? Number((mA.f1Score * 100).toFixed(2))
        : 0,
      [modelB ? `${modelB.name} (F1)` : "Model B"]: mB
        ? Number((mB.f1Score * 100).toFixed(2))
        : 0,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
          Enterprise Comparative Evaluation Studio
        </span>
        <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
          Perbandingan Komprehensif Dua Model
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500">
          Analisis keunggulan per kelas visualisasi kurva modern &amp; keputusan otomatis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-blue-500/30 bg-white p-5 shadow-sm dark:border-blue-500/30 dark:bg-zinc-900">
          <label className="block text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
            Pilih Model A (Utama)
          </label>
          <select
            value={idA}
            onChange={(e) => setIdA(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          >
            {submissions.map((sub) => (
              <option key={sub.id} value={sub.id}>
                Rank #{sub.rank} — {sub.name} ({sub.modelName}) [Macro F1:{" "}
                {(sub.testMacroF1 * 100).toFixed(2)}%]
              </option>
            ))}
          </select>
          {modelA && (
            <div className="mt-3 text-xs text-zinc-500 space-y-1">
              <div>
                Author:{" "}
                <strong className="text-zinc-800 dark:text-zinc-200">
                  {modelA.leaderboardName}
                </strong>
              </div>
              <div className="truncate">
                Strategi: {modelA.strategyDescription}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-indigo-500/30 bg-white p-5 shadow-sm dark:border-indigo-500/30 dark:bg-zinc-900">
          <label className="block text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
            Pilih Model B (Pembanding)
          </label>
          <select
            value={idB}
            onChange={(e) => setIdB(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          >
            {submissions.map((sub) => (
              <option key={sub.id} value={sub.id}>
                Rank #{sub.rank} — {sub.name} ({sub.modelName}) [Macro F1:{" "}
                {(sub.testMacroF1 * 100).toFixed(2)}%]
              </option>
            ))}
          </select>
          {modelB && (
            <div className="mt-3 text-xs text-zinc-500 space-y-1">
              <div>
                Author:{" "}
                <strong className="text-zinc-800 dark:text-zinc-200">
                  {modelB.leaderboardName}
                </strong>
              </div>
              <div className="truncate">
                Strategi: {modelB.strategyDescription}
              </div>
            </div>
          )}
        </div>
      </div>

      {modelA && modelB && (
        <div className="space-y-8">
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-50/70 via-white to-blue-50/70 p-6 dark:from-blue-950/20 dark:via-zinc-900 dark:to-blue-950/20 shadow-sm">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-sm mb-3">
              <Sparkles className="h-5 w-5" />
              <span>Ringkasan Pengambilan Keputusan (Automated Insights)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getAutomatedInsights().map((ins, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl border border-blue-500/20 bg-white/80 p-3.5 text-xs font-semibold text-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-200 shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{ins}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-3">
              1. Perbandingan Metrik Keseluruhan
            </h2>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-200 bg-zinc-50 uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold">Metrik</th>
                    <th className="px-4 py-3.5 font-semibold text-blue-600">
                      {modelA.name} ({modelA.modelName})
                    </th>
                    <th className="px-4 py-3.5 font-semibold text-indigo-600">
                      {modelB.name} ({modelB.modelName})
                    </th>
                    <th className="px-4 py-3.5 font-semibold">Selisih (A - B)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {[
                    {
                      label: "Accuracy",
                      valA: modelA.evaluationSummary.accuracy,
                      valB: modelB.evaluationSummary.accuracy,
                    },
                    {
                      label: "Macro F1",
                      valA: modelA.evaluationSummary.macroF1,
                      valB: modelB.evaluationSummary.macroF1,
                    },
                    {
                      label: "Macro Precision",
                      valA: modelA.evaluationSummary.macroPrecision,
                      valB: modelB.evaluationSummary.macroPrecision,
                    },
                    {
                      label: "Macro Recall",
                      valA: modelA.evaluationSummary.macroRecall,
                      valB: modelB.evaluationSummary.macroRecall,
                    },
                    {
                      label: "Micro F1",
                      valA: modelA.evaluationSummary.microF1,
                      valB: modelB.evaluationSummary.microF1,
                    },
                    {
                      label: "Weighted F1",
                      valA: modelA.evaluationSummary.weightedF1,
                      valB: modelB.evaluationSummary.weightedF1,
                    },
                  ].map((row) => {
                    const diff = (row.valA - row.valB) * 100;
                    return (
                      <tr
                        key={row.label}
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                      >
                        <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-white">
                          {row.label}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {(row.valA * 100).toFixed(2)}%
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {(row.valB * 100).toFixed(2)}%
                        </td>
                        <td className="px-4 py-3.5 font-mono font-semibold">
                          <span
                            className={
                              diff > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : diff < 0
                                ? "text-red-600 dark:text-red-400"
                                : "text-zinc-400"
                            }
                          >
                            {diff > 0 ? "+" : ""}
                            {diff.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-3">
                2. Perbandingan F1 Score Per Kelas (Grafik Visual)
              </h2>
              <div className="h-80 w-full rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="className" stroke="#888" fontSize={11} />
                    <YAxis stroke="#888" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #333",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar
                      dataKey={`${modelA.name} (F1)`}
                      fill="#2563EB"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey={`${modelB.name} (F1)`}
                      fill="#6366F1"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-3">
                3. Perbandingan Classification Report Per Kelas (Visual Bars Modern)
              </h2>
              <div className="space-y-4">
                {CLASSES.map((cls) => {
                  const mA =
                    modelA.evaluationSummary.perClassMetrics.find(
                      (m) => m.className === cls
                    );
                  const mB =
                    modelB.evaluationSummary.perClassMetrics.find(
                      (m) => m.className === cls
                    );

                  const f1A = mA ? mA.f1Score * 100 : 0;
                  const f1B = mB ? mB.f1Score * 100 : 0;
                  const precA = mA ? mA.precision * 100 : 0;
                  const precB = mB ? mB.precision * 100 : 0;
                  const recA = mA ? mA.recall * 100 : 0;
                  const recB = mB ? mB.recall * 100 : 0;

                  return (
                    <div
                      key={cls}
                      className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3.5"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
                        <span className="text-sm font-black text-zinc-900 dark:text-white">
                          Kelas {cls}
                        </span>
                        <div className="flex items-center gap-3 font-mono text-xs font-bold">
                          <span className="text-blue-600">
                            {modelA.name}: {f1A.toFixed(1)}% F1
                          </span>
                          <span className="text-zinc-300">|</span>
                          <span className="text-indigo-600">
                            {modelB.name}: {f1B.toFixed(1)}% F1
                          </span>
                        </div>
                      </div>

                      {/* Visual Precision Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                          <span>Precision (A vs B)</span>
                          <span className="font-mono">
                            {precA.toFixed(1)}% vs {precB.toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-blue-600 transition-all"
                              style={{ width: `${precA}%` }}
                            />
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-indigo-600 transition-all"
                              style={{ width: `${precB}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Visual Recall Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                          <span>Recall (A vs B)</span>
                          <span className="font-mono">
                            {recA.toFixed(1)}% vs {recB.toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all"
                              style={{ width: `${recA}%` }}
                            />
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-indigo-500 transition-all"
                              style={{ width: `${recB}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Visual F1 Score Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                          <span>F1-Score (A vs B)</span>
                          <span className="font-mono">
                            {f1A.toFixed(1)}% vs {f1B.toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-3 w-full rounded-full bg-zinc-100 overflow-hidden dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
                              style={{ width: `${f1A}%` }}
                            />
                          </div>
                          <div className="h-3 w-full rounded-full bg-zinc-100 overflow-hidden dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all"
                              style={{ width: `${f1B}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
