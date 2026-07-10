"use client";

import React from "react";
import Link from "next/link";
import {
  Trophy,
  Database,
  GitCompare,
  BarChart2,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function RootHomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50/80 p-8 sm:p-14 shadow-xl dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Decision Support Platform — Computer Vision</span>
        </div>

        <h1 className="mt-6 text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
          Pusat Evaluasi & Analisis Eksperimen Model Kompetisi Klasifikasi
        </h1>

        <p className="mt-4 max-w-3xl text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          Platform terpadu untuk tim dalam melakukan evaluasi performa Macro F1,
          analisis Generalization Gap, pelacakan histori eksperimen, serta
          iterasi perbaikan Pseudo Ground Truth secara kolaboratif.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-colors"
          >
            <span>Buka Dashboard Utama</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-xs sm:text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>Lihat Leaderboard</span>
          </Link>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/leaderboard"
          className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition-all hover:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <Trophy className="h-6 w-6 text-blue-600" />
          <h3 className="mt-3 text-base font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
            Leaderboard Submission
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Peringkat model berdasarkan Macro F1 Test, Generalization Gap, dan
            Evaluasi Lengkap.
          </p>
        </Link>

        <Link
          href="/analysis"
          className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition-all hover:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <BarChart2 className="h-6 w-6 text-violet-600" />
          <h3 className="mt-3 text-base font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
            Analisis Ground Truth
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Periksa Agreement antar submission, edit label manual, dan fokus
            pada gambar sulit.
          </p>
        </Link>

        <Link
          href="/progression"
          className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition-all hover:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <TrendingUp className="h-6 w-6 text-emerald-600" />
          <h3 className="mt-3 text-base font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
            Perkembangan Performa
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Pantau grafik kenaikan Macro F1 dan deteksi indikasi overfitting
            dari waktu ke waktu.
          </p>
        </Link>

        <Link
          href="/compare"
          className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition-all hover:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <GitCompare className="h-6 w-6 text-amber-600" />
          <h3 className="mt-3 text-base font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
            Perbandingan Dua Model
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Bandingkan keunggulan per kelas dan analisa Confusion Matrix side by
            side.
          </p>
        </Link>
      </div>
    </div>
  );
}
