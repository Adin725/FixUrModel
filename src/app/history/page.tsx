"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { GroundTruthHistory } from "@/types";
import {
  History,
  Database,
  ArrowLeft,
  User,
  Activity,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
} from "lucide-react";

export default function GroundTruthHistoryPage() {
  const { gtHistory, activeGtVersion, switchActiveGtVersion } = useAppStore();
  const [selectedImpactRec, setSelectedImpactRec] =
    useState<GroundTruthHistory | null>(null);

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-14">
      {/* Hero Bento Banner */}
      <div className="pin-card pin-card-lavender flex flex-wrap items-center justify-between gap-6 p-7">
        <div>
          <Link
            href="/ground-truth"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 transition-colors hover:text-indigo-800 dark:text-indigo-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Data Tes &amp; GT</span>
          </Link>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Audit Trail Ground Truth
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
            Riwayat perubahan dan manajemen versi aktif Ground Truth untuk audit
            konsistensi evaluasi.
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-2xl border border-indigo-200/80 bg-white px-4 py-2.5 shadow-xs dark:border-indigo-900/50 dark:bg-zinc-900">
          <Database className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
            GT Aktif:{" "}
            <strong className="font-mono text-indigo-600 dark:text-indigo-400">
              {activeGtVersion}
            </strong>
          </span>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="pin-card overflow-hidden">
        <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
          <h2 className="text-base font-black text-zinc-900 dark:text-white">
            Daftar Versi Ground Truth
          </h2>
          <p className="text-xs text-zinc-500">
            Setiap versi menyimpan snapshot label secara atomik
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="pin-table min-w-[800px]">
            <thead>
              <tr>
                <th className="w-24">Versi</th>
                <th className="w-48">Waktu WIB</th>
                <th className="w-36">Anggota Tim</th>
                <th className="w-32">Perubahan</th>
                <th>Alasan</th>
                <th className="w-36 text-center">Status</th>
                <th className="w-36 text-right">Audit</th>
              </tr>
            </thead>
            <tbody>
              {gtHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-14 text-center text-xs font-semibold text-zinc-400"
                  >
                    Belum ada riwayat perubahan tercatat.
                  </td>
                </tr>
              ) : (
                gtHistory.map((rec) => {
                  const isActive = rec.version === activeGtVersion;
                  return (
                    <tr
                      key={`${rec.version}-${rec.dateWIB}`}
                      className={
                        isActive
                          ? "bg-indigo-50/60 dark:bg-indigo-950/25"
                          : ""
                      }
                    >
                      <td className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                        {rec.version}
                      </td>

                      <td className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-zinc-400" />
                          <span>
                            {rec.dateWIB} &bull; {rec.timeWIB}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 font-bold text-[10px] text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {rec.changedByLeaderboardName
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">
                            {rec.changedByLeaderboardName}
                          </span>
                        </div>
                      </td>

                      <td className="font-mono font-bold text-zinc-900 dark:text-white">
                        {rec.changedCount} label
                      </td>

                      <td className="text-xs text-zinc-600 dark:text-zinc-300">
                        {rec.reason}
                      </td>

                      <td className="text-center">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => switchActiveGtVersion(rec.version)}
                            className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
                          >
                            Jadikan Aktif
                          </button>
                        )}
                      </td>

                      <td className="text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedImpactRec(rec)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                        >
                          <Activity className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>Dampak</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Impact Audit Modal */}
      {selectedImpactRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="pin-card w-full max-w-2xl p-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Analisis Dampak
                  </span>
                  <h3 className="text-base font-black text-zinc-900 dark:text-white">
                    Dampak Evaluasi Versi {selectedImpactRec.version}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedImpactRec(null)}
                className="rounded-xl border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                <div>
                  <strong>Waktu:</strong> {selectedImpactRec.dateWIB} (
                  {selectedImpactRec.timeWIB}) &bull;{" "}
                  <strong>Anggota Tim:</strong>{" "}
                  {selectedImpactRec.changedByLeaderboardName}
                </div>
                <div className="mt-1 font-semibold text-zinc-900 dark:text-white">
                  &ldquo;{selectedImpactRec.reason}&rdquo;
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="text-[10px] font-black uppercase text-zinc-400">
                    Rata-Rata Macro F1
                  </div>
                  <div className="mt-1 font-mono text-xl font-black text-zinc-900 dark:text-white">
                    {selectedImpactRec.newAvgMacroF1 !== undefined
                      ? `${(selectedImpactRec.newAvgMacroF1 * 100).toFixed(2)}%`
                      : "Terindeks"}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Seluruh submission dievaluasi ulang
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="text-[10px] font-black uppercase text-zinc-400">
                    Perubahan Ranking
                  </div>
                  <div className="mt-1 font-mono text-xl font-black text-zinc-900 dark:text-white">
                    {selectedImpactRec.rankingChanged
                      ? `${
                          selectedImpactRec.positionChangedCount || 1
                        } Submission Bergeser`
                      : "Stabil"}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Konsistensi peringkat leaderboard
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedImpactRec(null)}
                  className="rounded-xl bg-[#4d3fa3] px-6 py-2.5 text-xs font-black text-white hover:bg-[#3e3188]"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
