"use client";

import React from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { ValidationVsTestAnalysis } from "@/components/dashboard/ValidationVsTestAnalysis";
import {
  Trophy,
  Users,
  Database,
  Award,
  FileArchive,
  GitBranch,
  ArrowUpRight,
} from "lucide-react";

export default function DashboardPage() {
  const { submissions, users, activeGtVersion, dataset, activityLogs } =
    useAppStore();

  const bestModel =
    submissions.length > 0
      ? submissions.reduce((best, curr) =>
          curr.testMacroF1 > best.testMacroF1 ? curr : best
        )
      : null;

  const topThree = [...submissions]
    .sort((a, b) => b.testMacroF1 - a.testMacroF1)
    .slice(0, 3);

  const topFive = [...submissions]
    .sort((a, b) => b.testMacroF1 - a.testMacroF1)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-zinc-200/80 pb-6 dark:border-zinc-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Pusat Kendali Peneliti
          </span>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            Ringkasan Evaluasi &amp; Peringkat Model
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Pantau performa submission, korelasi pseudo-test, dan riwayat
            perubahan Ground Truth secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/lineage"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-800 shadow-2xs transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <GitBranch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Alur Eksperimen</span>
          </Link>

          <Link
            href="/ground-truth"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <FileArchive className="h-4 w-4" />
            <span>Unggah Ground Truth CSV</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Total Submission
            </div>
            <div className="mt-1 font-mono text-2xl font-black text-zinc-900 dark:text-white">
              {submissions.length}
            </div>
            <div className="truncate text-xs text-zinc-500">
              Eksperimen model tersimpan
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Users className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Anggota Tim
            </div>
            <div className="mt-1 font-mono text-2xl font-black text-zinc-900 dark:text-white">
              {users.length}
            </div>
            <div className="truncate text-xs text-zinc-500">
              Peneliti aktif di platform
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-sm">
            <Database className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Versi Ground Truth
            </div>
            <div className="mt-1 font-mono text-2xl font-black text-zinc-900 dark:text-white">
              {activeGtVersion}
            </div>
            <div className="truncate text-xs text-zinc-500">
              {dataset.length} sampel terindeks
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm">
            <Award className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Skor F1 Tertinggi
            </div>
            <div className="mt-1 font-mono text-2xl font-black text-zinc-900 dark:text-white">
              {bestModel
                ? `${(bestModel.testMacroF1 * 100).toFixed(1)}%`
                : "—"}
            </div>
            <div className="truncate text-xs text-zinc-500">
              {bestModel ? bestModel.name : "Belum ada eksperimen"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ValidationVsTestAnalysis submissions={submissions} />
        </div>

        <div className="flex flex-col gap-5 lg:col-span-4">
          <div className="flex h-full flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    3 Model Terbaik Teratas
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Berdasarkan skor Macro F1
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  Top Rank
                </span>
              </div>

              {topThree.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-400">
                  Belum ada model tersimpan. Unggah model pertama Anda.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {topThree.map((sub, idx) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5 transition-colors dark:border-zinc-800/80 dark:bg-zinc-950/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-mono text-xs font-bold text-white">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-white">
                            {sub.name}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            {sub.modelName} &bull;{" "}
                            <strong className="text-zinc-700 dark:text-zinc-300">
                              {sub.leaderboardName}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-sm font-black text-blue-600 dark:text-blue-400">
                          {(sub.testMacroF1 * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Daftar Peringkat Model Terkini
                </h3>
                <p className="text-xs text-zinc-500">
                  5 model terbaru yang dievaluasi sistem
                </p>
              </div>
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
              >
                <span>Lihat Semua</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                    <th className="p-3.5">Rank</th>
                    <th className="p-3.5">Nama Submission</th>
                    <th className="p-3.5">Peneliti</th>
                    <th className="p-3.5">Arsitektur</th>
                    <th className="p-3.5 text-right">Val F1</th>
                    <th className="p-3.5 text-right">Test F1</th>
                    <th className="p-3.5 text-right">Gen. Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {topFive.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-zinc-400"
                      >
                        Belum ada submission tercatat.
                      </td>
                    </tr>
                  ) : (
                    topFive.map((sub, idx) => {
                      const gapColor =
                        sub.generalizationGap >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : sub.generalizationGap >= -0.03
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400";

                      return (
                        <tr
                          key={sub.id}
                          className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        >
                          <td className="p-3.5 font-bold text-zinc-400">
                            #{idx + 1}
                          </td>
                          <td className="p-3.5 font-bold text-zinc-900 dark:text-white">
                            {sub.name}
                            {sub.isOfficial && (
                              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                Official Slot #{sub.officialSlot || 1}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 font-medium text-zinc-600 dark:text-zinc-300">
                            {sub.leaderboardName}
                          </td>
                          <td className="p-3.5 text-zinc-500 dark:text-zinc-400">
                            {sub.modelName}
                          </td>
                          <td className="p-3.5 text-right font-mono text-zinc-500">
                            {(sub.validationMacroF1 * 100).toFixed(2)}%
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {(sub.testMacroF1 * 100).toFixed(2)}%
                          </td>
                          <td
                            className={`p-3.5 text-right font-mono font-bold ${gapColor}`}
                          >
                            {sub.generalizationGap > 0 ? "+" : ""}
                            {(sub.generalizationGap * 100).toFixed(2)}%
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

        <div className="lg:col-span-4">
          <div className="h-full rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Log Aktivitas Terakhir
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500">
              Riwayat perubahan sistem dan dataset
            </p>

            <div className="mt-4 space-y-3">
              {activityLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5 dark:border-zinc-800/80 dark:bg-zinc-950/40"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-white">
                    <span>{log.title}</span>
                    <span className="font-mono text-[10px] font-normal text-zinc-400">
                      {log.timestampWIB}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {log.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
