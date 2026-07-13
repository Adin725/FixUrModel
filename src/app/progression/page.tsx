"use client";

import React, { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { TrendingUp, User, Sparkles } from "lucide-react";

export default function ProgressionPage() {
  const { submissions, users } = useAppStore();
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");

  const filteredSubmissions = useMemo(() => {
    let list = [...submissions];
    if (selectedAuthor !== "all")
      list = list.filter((s) => s.leaderboardName === selectedAuthor);
    list.sort((a, b) => {
      const idxA = parseInt(a.name.replace(/\D/g, "") || "1", 10);
      const idxB = parseInt(b.name.replace(/\D/g, "") || "1", 10);
      return idxA - idxB;
    });
    return list;
  }, [submissions, selectedAuthor]);

  const chartData = useMemo(
    () =>
      filteredSubmissions.map((sub) => ({
        name: sub.name,
        "F1 Validasi (%)": Number((sub.validationMacroF1 * 100).toFixed(2)),
        "F1 Test (%)": Number((sub.testMacroF1 * 100).toFixed(2)),
        "Gen. Gap (%)": Number((sub.generalizationGap * 100).toFixed(2)),
      })),
    [filteredSubmissions]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-14">
      {/* Hero Bento Header */}
      <div className="pin-card pin-card-lavender flex flex-wrap items-center justify-between gap-6 p-7">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
            <Sparkles className="h-3 w-3" />
            <span>Perkembangan Eksperimen</span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Trajektori Performa Model
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
            Perkembangan kronologis skor Macro F1 Validasi vs Test dan stabilitas
            Generalization Gap.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-500">Anggota Tim:</span>
          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <option value="all">Semua Anggota</option>
            {users.map((u) => (
              <option key={u.id} value={u.leaderboardName}>
                {u.leaderboardName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modern SaaS Chart Bento Card */}
      <div className="pin-card p-6">
        <div className="mb-4">
          <h2 className="text-base font-black text-zinc-900 dark:text-white">
            Grafik Perkembangan ({filteredSubmissions.length} Eksperimen)
          </h2>
          <p className="text-xs text-zinc-500">
            Perbandingan F1 Validasi vs Test dan dinamika Generalization Gap
          </p>
        </div>

        {chartData.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-xs font-semibold text-zinc-400">
            Belum ada data eksperimen untuk ditampilkan.
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "#18181b",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Line
                  type="monotone"
                  dataKey="F1 Validasi (%)"
                  stroke="#4d3fa3"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#4d3fa3" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="F1 Test (%)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Gen. Gap (%)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Table Bento Container */}
      <div className="pin-card overflow-hidden">
        <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
          <h3 className="text-base font-black text-zinc-900 dark:text-white">
            Rincian Perkembangan Eksperimen
          </h3>
          <p className="text-xs text-zinc-500">
            Daftar lengkap eksperimen berurutan berdasarkan waktu submission
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="pin-table min-w-[760px]">
            <thead>
              <tr>
                <th className="w-16">No</th>
                <th>Submission</th>
                <th>Anggota Tim</th>
                <th>Arsitektur</th>
                <th className="text-right">F1 Validasi</th>
                <th className="text-right">F1 Test</th>
                <th className="text-right">Gen. Gap</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-14 text-center text-xs font-semibold text-zinc-400"
                  >
                    Belum ada submission tercatat.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub, idx) => {
                  const gap = sub.generalizationGap;
                  const gapColor =
                    gap >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : gap >= -0.03
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-rose-600 dark:text-rose-400";

                  return (
                    <tr key={sub.id}>
                      <td className="font-mono font-black text-zinc-400">
                        #{idx + 1}
                      </td>
                      <td className="font-black text-zinc-900 dark:text-white">
                        {sub.name}
                      </td>
                      <td className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {sub.leaderboardName}
                      </td>
                      <td className="text-xs text-zinc-500 dark:text-zinc-400">
                        {sub.modelName}
                      </td>
                      <td className="text-right font-mono text-xs font-semibold text-zinc-500">
                        {(sub.validationMacroF1 * 100).toFixed(2)}%
                      </td>
                      <td className="text-right font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {(sub.testMacroF1 * 100).toFixed(2)}%
                      </td>
                      <td className={`text-right font-mono font-black ${gapColor}`}>
                        {gap > 0 ? "+" : ""}
                        {(gap * 100).toFixed(2)}%
                      </td>
                      <td className="font-mono text-xs text-zinc-400">
                        {sub.uploadTimestampWIB}
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
