"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import {
  Target,
  Award,
  CheckCircle2,
  Save,
  ArrowRight,
  ShieldCheck,
  Activity,
  Sparkles,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export default function OfficialCalibrationPage() {
  const { submissions, setOfficialActualF1, activeGtVersion } = useAppStore();

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

  const valF1Pct = officialSub ? officialSub.validationMacroF1 * 100 : 0;
  const gtF1Pct = officialSub ? officialSub.testMacroF1 * 100 : 0;
  const actualF1Pct =
    officialSub && officialSub.officialActualF1 !== undefined
      ? officialSub.officialActualF1 * 100
      : undefined;

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-14">
      {/* Hero Bento Header */}
      <div className="pin-card pin-card-lavender flex flex-wrap items-center justify-between gap-6 p-7">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
            <Sparkles className="h-3 w-3" />
            <span>Pilihan Resmi</span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Kalibrasi Official Submission
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
            Analisis korelasi 3 arah antara Validasi Internal, Ground Truth (
            {activeGtVersion}), dan Skor Aktual Evaluasi Slot #1 sampai #3.
          </p>
        </div>

        <Link
          href="/leaderboard"
          className="rounded-2xl bg-[#4d3fa3] px-5 py-3 text-xs font-black text-white shadow-lg transition-transform active:scale-95 hover:bg-[#3d3185]"
        >
          Kelola Slot Resmi
        </Link>
      </div>

      {/* Official Slot Switcher Bento */}
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
              className={`flex items-center gap-2.5 rounded-2xl px-5 py-3.5 text-xs font-bold transition-all ${
                isActive
                  ? "pin-card-selected"
                  : "pin-card text-zinc-700 hover:border-indigo-300 dark:text-zinc-300"
              }`}
            >
              <Target className="h-4 w-4" />
              <span>Slot #{slot}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] ${
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
        <div className="pin-card mx-auto max-w-3xl space-y-6 p-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Target className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-black text-zinc-900 dark:text-white">
              Slot Official #{activeSlot} Belum Ditetapkan
            </h2>
            <p className="mx-auto max-w-md text-xs text-zinc-500">
              Pilih model di Leaderboard dan tetapkan sebagai Official #{activeSlot}{" "}
              untuk melakukan kalibrasi nilai aktual eksternal.
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#4d3fa3] px-6 py-3 text-xs font-black text-white shadow-md hover:bg-[#3d3185]"
          >
            <span>Pilih di Leaderboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="pin-card space-y-6 p-7 lg:col-span-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Slot Resmi #{activeSlot}
                  </span>
                  <h2 className="mt-1 text-2xl font-black text-zinc-900 dark:text-white">
                    {officialSub.name}
                  </h2>
                  <p className="mt-0.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Arsitektur: {officialSub.modelName} &bull; Anggota Tim:{" "}
                    {officialSub.leaderboardName}
                  </p>
                </div>

                <span className="rounded-2xl bg-zinc-900 px-4 py-2 font-mono text-xs font-black text-white dark:bg-zinc-100 dark:text-zinc-900">
                  Rank #{officialSub.rank}
                </span>
              </div>

              {/* 3-Way Core Metric Bento Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="pin-card pin-card-sky p-5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-950/70 dark:text-indigo-200">
                    1. Validasi Internal
                  </span>
                  <div className="mt-2 font-mono text-2xl font-black text-indigo-950 dark:text-white">
                    {valF1Pct.toFixed(2)}%
                  </div>
                  <span className="mt-1 block text-[11px] font-semibold text-indigo-900/70 dark:text-indigo-300">
                    Split validasi model
                  </span>
                </div>

                <div className="pin-card pin-card-mint p-5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-950/70 dark:text-emerald-200">
                    2. Ground Truth Platform
                  </span>
                  <div className="mt-2 font-mono text-2xl font-black text-emerald-950 dark:text-white">
                    {gtF1Pct.toFixed(2)}%
                  </div>
                  <span className="mt-1 block text-[11px] font-semibold text-emerald-900/70 dark:text-emerald-300">
                    Evaluasi GT {activeGtVersion}
                  </span>
                </div>

                <div className="pin-card pin-card-lavender p-5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-violet-950/70 dark:text-violet-200">
                    3. Nilai Aktual Eksternal
                  </span>
                  <div className="mt-2 font-mono text-2xl font-black text-violet-950 dark:text-white">
                    {actualF1Pct !== undefined
                      ? `${actualF1Pct.toFixed(2)}%`
                      : "Belum Dikalibrasi"}
                  </div>
                  <span className="mt-1 block text-[11px] font-semibold text-violet-900/70 dark:text-violet-300">
                    Hasil pengujian eksternal
                  </span>
                </div>
              </div>

              {/* Intuitive 3-Way Correlation Breakdown (Explicit & Clear) */}
              {actualF1Pct !== undefined && (
                <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                      Analisis Deviasi &amp; Korelasi 3 Arah
                    </h4>
                    <span className="text-[11px] font-semibold text-zinc-500">
                      Perbandingan antar tahapan pengujian
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Generalization Gap */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                      <div className="text-[11px] font-bold text-zinc-500">
                        Generalization Gap
                      </div>
                      <div className="mt-1 font-mono text-xl font-black text-amber-600 dark:text-amber-400">
                        {valF1Pct - gtF1Pct > 0 ? "+" : ""}
                        {(valF1Pct - gtF1Pct).toFixed(2)}%
                      </div>
                      <p className="mt-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        Selisih Validasi ke Ground Truth platform
                      </p>
                    </div>

                    {/* Calibration Delta */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                      <div className="text-[11px] font-bold text-zinc-500">
                        Calibration Delta
                      </div>
                      <div className="mt-1 font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">
                        {gtF1Pct - actualF1Pct > 0 ? "+" : ""}
                        {(gtF1Pct - actualF1Pct).toFixed(2)}%
                      </div>
                      <p className="mt-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        Selisih Ground Truth ke Aktual eksternal
                      </p>
                    </div>

                    {/* Total Deviasi */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                      <div className="text-[11px] font-bold text-zinc-500">
                        Total Deviasi Evaluasi
                      </div>
                      <div className="mt-1 font-mono text-xl font-black text-zinc-900 dark:text-white">
                        {valF1Pct - actualF1Pct > 0 ? "+" : ""}
                        {(valF1Pct - actualF1Pct).toFixed(2)}%
                      </div>
                      <p className="mt-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        Jarak dari Validasi ke Aktual eksternal
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Input Card */}
            <div className="pin-card space-y-5 p-7 lg:col-span-4">
              <div className="flex items-center gap-2.5">
                <Award className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-black text-zinc-900 dark:text-white">
                  Input Nilai Aktual
                </h3>
              </div>

              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Masukkan skor Macro F1 resmi hasil pengujian eksternal untuk
                slot <strong className="text-zinc-900 dark:text-white">Official #{activeSlot}</strong>.
              </p>

              <form onSubmit={handleSaveActual} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Skor Aktual F1 (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={actualInput}
                    onChange={(e) => setActualInput(e.target.value)}
                    placeholder="Contoh: 88.40"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-sm font-bold text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4d3fa3] py-3.5 text-xs font-black text-white shadow-md hover:bg-[#3d3185]"
                >
                  <Save className="h-4 w-4" />
                  <span>Simpan Kalibrasi</span>
                </button>
              </form>

              {savedSuccess && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Kalibrasi berhasil disimpan</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="pin-card space-y-4 p-7">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  Audit Reliabilitas
                </span>
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>

              <h3 className="text-base font-black text-zinc-900 dark:text-white">
                Reliabilitas Ground Truth ({activeGtVersion})
              </h3>

              <div className="space-y-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {actualF1Pct !== undefined ? (
                  <>
                    <p>
                      Selisih antara pengujian pada Ground Truth platform dan
                      nilai Aktual untuk Official #{activeSlot} adalah{" "}
                      <strong className="font-mono font-bold text-zinc-900 dark:text-white">
                        {Math.abs(gtF1Pct - actualF1Pct).toFixed(2)}%
                      </strong>
                      .
                    </p>

                    {Math.abs(gtF1Pct - actualF1Pct) < 2.0 ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <span className="mb-1 block font-bold">
                          Reliabilitas Sangat Presisi
                        </span>
                        Ground Truth platform mencerminkan performa pengujian
                        aktual eksternal dengan selisih sangat rendah (&lt; 2%).
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                        <span className="mb-1 block font-bold">
                          Perlu Tinjauan Sampel Ambigu
                        </span>
                        Disarankan memeriksa kembali sampel dengan tingkat
                        kesepakatan rendah pada halaman Analisis GT.
                      </div>
                    )}
                  </>
                ) : (
                  <p className="italic text-zinc-400">
                    Simpan skor aktual untuk mengaudit reliabilitas.
                  </p>
                )}
              </div>
            </div>

            <div className="pin-card space-y-4 p-7">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  Pola Generalization
                </span>
                <Activity className="h-4 w-4 text-indigo-600" />
              </div>

              <h3 className="text-base font-black text-zinc-900 dark:text-white">
                Distribusi Generalization Gap
              </h3>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-[10px] font-black uppercase text-zinc-400">
                    Rata-Rata Gap
                  </span>
                  <div className="mt-1 font-mono text-xl font-black text-zinc-900 dark:text-white">
                    {avgGeneralizationGap > 0 ? "+" : ""}
                    {(avgGeneralizationGap * 100).toFixed(2)}%
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-[10px] font-black uppercase text-zinc-400">
                    Kecenderungan Model
                  </span>
                  <div className="mt-1 text-xs font-black text-zinc-900 dark:text-white">
                    {optimisticCount > pessimisticCount
                      ? "Cenderung Optimistic"
                      : "Stabil & Konsisten"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
