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
  Sparkles,
  Zap,
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
    <div className="mx-auto max-w-7xl space-y-7 pb-14">
      {/* Pinterest Creative Hero Bento Banner */}
      <div className="pin-card pin-card-lavender flex flex-wrap items-center justify-between gap-6 p-7 sm:p-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
            <Sparkles className="h-3 w-3" />
            <span>AI Research Studio</span>
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            Ringkasan Evaluasi &amp; Peringkat Model
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-sm">
            Pantau performa submission, korelasi pseudo-test, dan stabilitas
            arsitektur secara langsung dengan sinkronisasi metadata atomik.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/lineage"
            className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200 bg-white px-5 py-3 text-xs font-black text-indigo-950 shadow-sm transition-transform active:scale-95 dark:border-indigo-800 dark:bg-zinc-900 dark:text-white"
          >
            <GitBranch className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Alur Eksperimen</span>
          </Link>

          <Link
            href="/ground-truth"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#4d3fa3] px-5 py-3 text-xs font-black text-white shadow-lg transition-transform active:scale-95 hover:bg-[#3e3188]"
          >
            <FileArchive className="h-4 w-4" />
            <span>Unggah Ground Truth CSV</span>
          </Link>
        </div>
      </div>

      {/* Colorful Bento Stat Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="pin-card pin-card-sky pin-card-hover p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-950/70 dark:text-indigo-200">
              Total Submission
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-black text-indigo-950 dark:text-white">
            {submissions.length}
          </div>
          <div className="mt-1 text-xs font-semibold text-indigo-900/70 dark:text-indigo-300">
            Eksperimen model tersimpan
          </div>
        </div>

        <div className="pin-card pin-card-mint pin-card-hover p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950/70 dark:text-emerald-200">
              Anggota Tim
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-black text-emerald-950 dark:text-white">
            {users.length}
          </div>
          <div className="mt-1 text-xs font-semibold text-emerald-900/70 dark:text-emerald-300">
            Anggota tim aktif
          </div>
        </div>

        <div className="pin-card pin-card-lavender pin-card-hover p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-violet-950/70 dark:text-violet-200">
              Ground Truth Versi
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm">
              <Database className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-black text-violet-950 dark:text-white">
            {activeGtVersion}
          </div>
          <div className="mt-1 text-xs font-semibold text-violet-900/70 dark:text-violet-300">
            {dataset.length} sampel metadata terindeks
          </div>
        </div>

        <div className="pin-card pin-card-rose pin-card-hover p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-950/70 dark:text-rose-200">
              Skor F1 Tertinggi
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-sm">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-black text-rose-950 dark:text-white">
            {bestModel ? `${(bestModel.testMacroF1 * 100).toFixed(1)}%` : "—"}
          </div>
          <div className="mt-1 truncate text-xs font-semibold text-rose-900/70 dark:text-rose-300">
            {bestModel ? bestModel.name : "Belum ada eksperimen"}
          </div>
        </div>
      </div>

      {/* Analytical Core + Pinterest Showcase Banner */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ValidationVsTestAnalysis submissions={submissions} />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="pin-card pin-card-violet-gradient flex h-full flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between border-b border-white/20 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-indigo-200">
                    <Zap className="h-3 w-3" />
                    <span>Top Performer</span>
                  </div>
                  <h3 className="mt-1 text-base font-black text-white">
                    3 Model Terbaik Teratas
                  </h3>
                </div>
                <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black text-white">
                  Leaderboard
                </span>
              </div>

              {topThree.length === 0 ? (
                <div className="py-12 text-center text-xs text-indigo-200">
                  Belum ada model tersimpan. Unggah model pertama Anda.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {topThree.map((sub, idx) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between rounded-2xl bg-white/10 p-4 transition-transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-mono text-xs font-black text-[#4d3fa3] shadow-sm">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="text-xs font-black text-white">
                            {sub.name}
                          </div>
                          <div className="text-[11px] text-indigo-200">
                            {sub.modelName} &bull;{" "}
                            <strong className="text-white">
                              {sub.leaderboardName}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-base font-black text-white">
                          {(sub.testMacroF1 * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/leaderboard"
              className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-xs font-black text-[#4d3fa3] shadow-lg transition-transform active:scale-95 hover:bg-indigo-50"
            >
              <span>Lihat Seluruh Peringkat</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Table + Activity Bento Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="pin-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-black text-zinc-900 dark:text-white">
                  Daftar Peringkat Model Terkini
                </h3>
                <p className="text-xs text-zinc-500">
                  Diurutkan berdasarkan skor pengujian tertinggi
                </p>
              </div>
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3.5 py-1.5 text-xs font-black text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400"
              >
                <span>Lihat Leaderboard</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="pin-table">
                <thead>
                  <tr>
                    <th className="p-4">Rank</th>
                    <th className="p-4">Nama Submission</th>
                    <th className="p-4">Anggota Tim</th>
                    <th className="p-4">Arsitektur</th>
                    <th className="p-4 text-right">Val F1</th>
                    <th className="p-4 text-right">Test F1</th>
                    <th className="p-4 text-right">Gen. Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {topFive.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-14 text-center text-zinc-400"
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
                          : "text-rose-600 dark:text-rose-400";

                      return (
                        <tr key={sub.id}>
                          <td className="p-4 font-black text-zinc-400">
                            #{idx + 1}
                          </td>
                          <td className="p-4 font-black text-zinc-900 dark:text-white">
                            {sub.name}
                            {sub.isOfficial && (
                              <span className="ml-2 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[9px] font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                Official Slot #{sub.officialSlot || 1}
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-semibold text-zinc-700 dark:text-zinc-300">
                            {sub.leaderboardName}
                          </td>
                          <td className="p-4 text-zinc-500 dark:text-zinc-400">
                            {sub.modelName}
                          </td>
                          <td className="p-4 text-right font-mono font-semibold text-zinc-500">
                            {(sub.validationMacroF1 * 100).toFixed(2)}%
                          </td>
                          <td className="p-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                            {(sub.testMacroF1 * 100).toFixed(2)}%
                          </td>
                          <td
                            className={`p-4 text-right font-mono font-black ${gapColor}`}
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
          <div className="pin-card flex h-full flex-col justify-between p-6">
            <div>
              <h3 className="text-base font-black text-zinc-900 dark:text-white">
                Log Aktivitas Terakhir
              </h3>
              <p className="mt-0.5 text-xs text-zinc-500">
                Riwayat pembaruan sistem &amp; dataset
              </p>

              <div className="mt-5 space-y-3">
                {activityLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
                  >
                    <div className="flex items-center justify-between text-xs font-black text-zinc-900 dark:text-white">
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
    </div>
  );
}
