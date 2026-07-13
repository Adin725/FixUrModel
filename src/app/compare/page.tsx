"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { CLASSES } from "@/lib/evaluator";
import { CheckCircle2, Sparkles } from "lucide-react";
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
          `${modelA.name} memiliki keunggulan Macro F1 sebesar +${f1Diff.toFixed(2)}% dibandingkan ${modelB.name}.`
        );
      } else {
        insights.push(
          `${modelB.name} memiliki keunggulan Macro F1 sebesar +${Math.abs(f1Diff).toFixed(2)}% dibandingkan ${modelA.name}.`
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
            `${modelA.name} unggul pada kelas ${cls} (+${diffCls.toFixed(2)}% F1).`
          );
        } else if (diffCls < -1.0) {
          insights.push(
            `${modelB.name} unggul pada kelas ${cls} (+${Math.abs(diffCls).toFixed(2)}% F1).`
          );
        }
      }
    }

    if (insights.length === 0) {
      insights.push(
        "Kedua model memiliki performa seimbang di seluruh kelas."
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
    <div className="mx-auto max-w-7xl space-y-7 pb-14">
      {/* Hero Bento Header */}
      <div className="pin-card pin-card-lavender flex flex-wrap items-center justify-between gap-6 p-7">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
            <Sparkles className="h-3 w-3" />
            <span>Komparasi Model</span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Perbandingan Komprehensif Dua Model
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
            Analisis keunggulan per kelas dan perbandingan metrik evaluasi
            secara berdampingan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="pin-card p-5">
          <label className="mb-2 block text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Pilih Model A (Utama)
          </label>
          <select
            value={idA}
            onChange={(e) => setIdA(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            {submissions.map((sub) => (
              <option key={sub.id} value={sub.id}>
                Rank #{sub.rank} — {sub.name} ({sub.modelName}) [Macro F1:{" "}
                {(sub.testMacroF1 * 100).toFixed(2)}%]
              </option>
            ))}
          </select>
          {modelA && (
            <div className="mt-3 space-y-1 text-xs text-zinc-500">
              <div>
                Anggota Tim:{" "}
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

        <div className="pin-card p-5">
          <label className="mb-2 block text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Pilih Model B (Pembanding)
          </label>
          <select
            value={idB}
            onChange={(e) => setIdB(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            {submissions.map((sub) => (
              <option key={sub.id} value={sub.id}>
                Rank #{sub.rank} — {sub.name} ({sub.modelName}) [Macro F1:{" "}
                {(sub.testMacroF1 * 100).toFixed(2)}%]
              </option>
            ))}
          </select>
          {modelB && (
            <div className="mt-3 space-y-1 text-xs text-zinc-500">
              <div>
                Anggota Tim:{" "}
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
        <div className="space-y-7">
          <div className="pin-card pin-card-lavender p-6">
            <div className="mb-3 flex items-center gap-2 text-xs font-black text-indigo-900 dark:text-indigo-200">
              <Sparkles className="h-4 w-4" />
              <span>Ringkasan Komparasi</span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {getAutomatedInsights().map((ins, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-2xl bg-white/80 p-4 text-xs font-semibold text-zinc-800 shadow-2xs dark:bg-zinc-900 dark:text-zinc-200"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                  <span>{ins}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pin-card overflow-hidden">
            <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
              <h2 className="text-base font-black text-zinc-900 dark:text-white">
                Perbandingan Metrik Keseluruhan
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="pin-table min-w-[700px]">
                <thead>
                  <tr>
                    <th>Metrik</th>
                    <th className="text-indigo-600">
                      {modelA.name} ({modelA.modelName})
                    </th>
                    <th className="text-violet-600">
                      {modelB.name} ({modelB.modelName})
                    </th>
                    <th>Selisih (A - B)</th>
                  </tr>
                </thead>
                <tbody>
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
                      <tr key={row.label}>
                        <td className="font-bold text-zinc-900 dark:text-white">
                          {row.label}
                        </td>
                        <td className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                          {(row.valA * 100).toFixed(2)}%
                        </td>
                        <td className="font-mono font-black text-violet-600 dark:text-violet-400">
                          {(row.valB * 100).toFixed(2)}%
                        </td>
                        <td className="font-mono font-bold">
                          <span
                            className={
                              diff > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : diff < 0
                                ? "text-rose-600 dark:text-rose-400"
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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="pin-card space-y-4 p-6">
              <h2 className="text-base font-black text-zinc-900 dark:text-white">
                F1 Score Per Kelas
              </h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="className" stroke="#888" fontSize={11} />
                    <YAxis stroke="#888" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        backgroundColor: "#18181b",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar
                      dataKey={`${modelA.name} (F1)`}
                      fill="#4d3fa3"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey={`${modelB.name} (F1)`}
                      fill="#7c3aed"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pin-card space-y-4 p-6">
              <h2 className="text-base font-black text-zinc-900 dark:text-white">
                Rincian Performa Per Kelas
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
                      className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2 dark:border-zinc-800">
                        <span className="text-xs font-black text-zinc-900 dark:text-white">
                          Kelas {cls}
                        </span>
                        <div className="font-mono text-xs font-bold">
                          <span className="text-indigo-600">
                            A: {f1A.toFixed(1)}%
                          </span>
                          <span className="mx-2 text-zinc-300">|</span>
                          <span className="text-violet-600">
                            B: {f1B.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                          <span>Precision (A vs B)</span>
                          <span className="font-mono">
                            {precA.toFixed(1)}% vs {precB.toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-2 w-full rounded-full bg-zinc-200 overflow-hidden dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-[#4d3fa3]"
                              style={{ width: `${precA}%` }}
                            />
                          </div>
                          <div className="h-2 w-full rounded-full bg-zinc-200 overflow-hidden dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-violet-600"
                              style={{ width: `${precB}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                          <span>Recall (A vs B)</span>
                          <span className="font-mono">
                            {recA.toFixed(1)}% vs {recB.toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-2 w-full rounded-full bg-zinc-200 overflow-hidden dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-[#4d3fa3]"
                              style={{ width: `${recA}%` }}
                            />
                          </div>
                          <div className="h-2 w-full rounded-full bg-zinc-200 overflow-hidden dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-violet-600"
                              style={{ width: `${recB}%` }}
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
