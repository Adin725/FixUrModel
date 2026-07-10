"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import {
  Target,
  Award,
  AlertCircle,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  Save,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
} from "lucide-react";

export default function OfficialCalibrationPage() {
  const {
    submissions,
    setOfficialActualF1,
    activeGtVersion,
    dataset,
  } = useAppStore();

  const [activeSlot, setActiveSlot] = useState<1 | 2 | 3>(1);

  const officialSub =
    submissions.find((s) => s.isOfficial && s.officialSlot === activeSlot) ||
    submissions.find((s) => s.isOfficial);

  const [actualInput, setActualInput] = useState(
    officialSub?.officialActualF1 !== undefined
      ? (officialSub.officialActualF1 * 100).toFixed(2)
      : ""
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync actualInput when switching slots
  React.useEffect(() => {
    if (officialSub?.officialActualF1 !== undefined) {
      setActualInput((officialSub.officialActualF1 * 100).toFixed(2));
    } else {
      setActualInput("");
    }
  }, [officialSub]);

  const handleSaveActual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialSub) return;
    const num = parseFloat(actualInput) / 100;
    if (!isNaN(num)) {
      setOfficialActualF1(officialSub.id, num);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  };

  const avgValF1 =
    submissions.length > 0
      ? submissions.reduce((acc, s) => acc + s.validationMacroF1, 0) /
        submissions.length
      : 0;
  const avgGtF1 =
    submissions.length > 0
      ? submissions.reduce((acc, s) => acc + s.testMacroF1, 0) /
        submissions.length
      : 0;
  const avgGeneralizationGap =
    submissions.length > 0
      ? submissions.reduce((acc, s) => acc + s.generalizationGap, 0) /
        submissions.length
      : 0;

  const optimisticCount = submissions.filter(
    (s) => s.generalizationGap > 0.01
  ).length;
  const pessimisticCount = submissions.filter(
    (s) => s.generalizationGap < -0.01
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <Target className="h-3 w-3" />
            <span>Official Calibration Module</span>
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Official Submission Calibration &amp; Historical Insight Analysis
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500">
            Analisis korelasi 3 arah antara Validasi Internal, Ground Truth Manual ({activeGtVersion}), dan Skor Aktual Evaluasi untuk Official Submission #1 sampai #3
          </p>
        </div>

        <Link
          href="/leaderboard"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
        >
          Kelola Official Slot di Leaderboard
        </Link>
      </div>

      {/* Official Slot Switcher Tabs (#1, #2, #3) */}
      <div className="flex flex-wrap items-center gap-3">
        {([1, 2, 3] as const).map((slot) => {
          const subForSlot = submissions.find(
            (s) => s.isOfficial && s.officialSlot === slot
          );
          const isActive = activeSlot === slot;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => setActiveSlot(slot)}
              className={`flex items-center gap-2.5 rounded-2xl px-5 py-3 text-xs font-bold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-md scale-100"
                  : "bg-white border border-zinc-200 text-zinc-700 hover:border-blue-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"
              }`}
            >
              <Target className="h-4 w-4" />
              <span>Official #{slot}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {subForSlot ? subForSlot.name : "Belum diisi"}
              </span>
            </button>
          );
        })}
      </div>

      {!officialSub ? (
        <div className="mx-auto max-w-4xl px-6 py-16 text-center space-y-6 rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            <Target className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white">
              Slot Official Submission #{activeSlot} Masih Kosong
            </h2>
            <p className="max-w-md mx-auto text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Silakan pilih salah satu submission pada Leaderboard dan tetapkan ke slot <strong className="text-zinc-900 dark:text-white">Official #{activeSlot}</strong> untuk melakukan kalibrasi aktual.
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <span>Pilih Model di Leaderboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Official Submission Summary & Actual Input */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Official Submission Slot #{activeSlot}
                  </span>
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                    {officialSub.name}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Arsitektur: {officialSub.modelName} &bull; Pengirim: {officialSub.leaderboardName}
                  </p>
                </div>

                <span className="rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                  Rank #{officialSub.rank}
                </span>
              </div>

              {/* 3-Way Core Metric Display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    1. Internal Validation F1
                  </span>
                  <div className="mt-2 text-2xl font-black font-mono text-zinc-900 dark:text-white">
                    {(officialSub.validationMacroF1 * 100).toFixed(2)}%
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Skor pada validation split
                  </span>
                </div>

                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    2. Manual Ground Truth F1
                  </span>
                  <div className="mt-2 text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                    {(officialSub.testMacroF1 * 100).toFixed(2)}%
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Evaluasi pada GT {activeGtVersion}
                  </span>
                </div>

                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    3. Actual Evaluation F1
                  </span>
                  <div className="mt-2 text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {officialSub.officialActualF1 !== undefined
                      ? `${(officialSub.officialActualF1 * 100).toFixed(2)}%`
                      : "Belum diisi"}
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Skor resmi pengujian luar
                  </span>
                </div>
              </div>

              {/* Three-Way Gap Breakdown */}
              {officialSub.officialActualF1 !== undefined && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Three-Way Gap Analysis (Delta)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="rounded-lg bg-white p-3 border border-zinc-200/80 dark:border-zinc-800 dark:bg-zinc-900">
                      <span className="font-semibold text-zinc-500 block">
                        Val &rarr; GT Manual
                      </span>
                      <span className="text-base font-black font-mono text-amber-600">
                        {officialSub.validationMacroF1 - officialSub.testMacroF1 > 0 ? "+" : ""}
                        {((officialSub.validationMacroF1 - officialSub.testMacroF1) * 100).toFixed(2)}%
                      </span>
                    </div>

                    <div className="rounded-lg bg-white p-3 border border-zinc-200/80 dark:border-zinc-800 dark:bg-zinc-900">
                      <span className="font-semibold text-zinc-500 block">
                        GT Manual &rarr; Actual
                      </span>
                      <span className="text-base font-black font-mono text-emerald-600">
                        {officialSub.testMacroF1 - officialSub.officialActualF1 > 0 ? "+" : ""}
                        {((officialSub.testMacroF1 - officialSub.officialActualF1) * 100).toFixed(2)}%
                      </span>
                    </div>

                    <div className="rounded-lg bg-white p-3 border border-zinc-200/80 dark:border-zinc-800 dark:bg-zinc-900">
                      <span className="font-semibold text-zinc-500 block">
                        Total Gap (Val &rarr; Actual)
                      </span>
                      <span className="text-base font-black font-mono text-zinc-900 dark:text-white">
                        {officialSub.validationMacroF1 - officialSub.officialActualF1 > 0 ? "+" : ""}
                        {((officialSub.validationMacroF1 - officialSub.officialActualF1) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Calibration Actual Score */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900 space-y-5">
              <div className="flex items-center gap-2.5">
                <Award className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Input Nilai Aktual Evaluasi
                </h3>
              </div>

              <p className="text-xs text-zinc-500 leading-relaxed">
                Masukkan nilai Macro F1 resmi yang didapatkan dari panitia atau server pengujian eksternal untuk slot <strong className="text-zinc-900 dark:text-white">Official #{activeSlot}</strong>.
              </p>

              <form onSubmit={handleSaveActual} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Actual Macro F1 (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={actualInput}
                    onChange={(e) => setActualInput(e.target.value)}
                    placeholder="Contoh: 88.40"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-mono text-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
                >
                  <Save className="h-4 w-4" />
                  <span>Simpan Nilai Aktual</span>
                </button>
              </form>

              {savedSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Nilai Aktual berhasil dikalibrasi ke dalam sistem</span>
                </div>
              )}
            </div>
          </div>

          {/* Historical Insight & Reliability Audit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Reliability Audit
                </span>
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>

              <h3 className="text-base font-black text-zinc-900 dark:text-white">
                Kualitas &amp; Reliabilitas Ground Truth Manual ({activeGtVersion})
              </h3>

              <div className="space-y-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {officialSub.officialActualF1 !== undefined ? (
                  <>
                    <p>
                      Selisih antara pengujian pada Ground Truth Manual platform dan nilai Aktual untuk Official #{activeSlot} adalah{" "}
                      <strong className="font-mono text-zinc-900 dark:text-white">
                        {Math.abs((officialSub.testMacroF1 - officialSub.officialActualF1) * 100).toFixed(2)}%
                      </strong>.
                    </p>

                    {Math.abs(officialSub.testMacroF1 - officialSub.officialActualF1) < 0.02 ? (
                      <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <span className="font-bold block mb-1">
                          Reliabilitas Sangat Tinggi (Terjamin)
                        </span>
                        Ground Truth manual platform ({activeGtVersion}) mencerminkan performa pengujian aktual dengan selisih di bawah 2%. Pelabelan manual yang dilakukan tim terbukti konsisten dengan standar evaluasi eksternal.
                      </div>
                    ) : (
                      <div className="rounded-xl bg-amber-50 p-4 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                        <span className="font-bold block mb-1">
                          Perlu Kalibrasi Ulang Sampel Ambigu
                        </span>
                        Terdapat perbedaan antara GT manual dan aktual. Disarankan meninjau ulang sampel gambar dengan tingkat kesepakatan (&lt; 100%) pada halaman Analisis GT.
                      </div>
                    )}
                  </>
                ) : (
                  <p className="italic text-zinc-400">
                    Silakan simpan Nilai Aktual di atas untuk melihat analisis reliabilitas Ground Truth Manual.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Trend &amp; Consistency
                </span>
                <Activity className="h-4 w-4 text-blue-600" />
              </div>

              <h3 className="text-base font-black text-zinc-900 dark:text-white">
                Distribusi Generalization Gap &amp; Pola Eksperimen
              </h3>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-950">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    Rata-Rata Gap Validasi
                  </span>
                  <div className="mt-1 text-base font-black font-mono text-zinc-900 dark:text-white">
                    {avgGeneralizationGap > 0 ? "+" : ""}
                    {(avgGeneralizationGap * 100).toFixed(2)}%
                  </div>
                </div>

                <div className="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-950">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    Kecenderungan Model
                  </span>
                  <div className="mt-1 text-base font-black text-zinc-900 dark:text-white">
                    {optimisticCount > pessimisticCount
                      ? "Cenderung Overfitting (Optimistic)"
                      : "Konsisten / Stabil"}
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Dari total <strong className="font-mono">{submissions.length}</strong> eksperimen yang tercatat, sebanyak{" "}
                <strong className="font-mono">{optimisticCount}</strong> model mengalami penurunan skor saat diuji pada GT manual (overfitting terhadap data validasi internal).
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
