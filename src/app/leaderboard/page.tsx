"use client";

import React, { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { Submission } from "@/types";
import { UploadSubmissionModal } from "@/components/submission/UploadSubmissionModal";
import {
  Trophy,
  Upload,
  Search,
  Target,
  Trash2,
  Sparkles,
  Award,
  X,
} from "lucide-react";

export default function LeaderboardPage() {
  const {
    submissions,
    setOfficialSubmission,
    deleteSubmission,
    activeGtVersion,
  } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string>("ALL");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [confirmOfficialModalSub, setConfirmOfficialModalSub] =
    useState<Submission | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<1 | 2 | 3>(1);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => s.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.leaderboardName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTag =
        filterTag === "ALL" || (s.tags && s.tags.includes(filterTag));
      return matchSearch && matchTag;
    });
  }, [submissions, searchQuery, filterTag]);

  const handleConfirmOfficial = () => {
    if (confirmOfficialModalSub) {
      setOfficialSubmission(confirmOfficialModalSub.id, selectedSlot);
      setConfirmOfficialModalSub(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-14">
      {/* Hero Bento Header */}
      <div className="pin-card pin-card-lavender flex flex-wrap items-center justify-between gap-6 p-7">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
            <Sparkles className="h-3 w-3" />
            <span>Peringkat Eksperimen</span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Daftar Peringkat Eksperimen Model
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
            Daftar evaluasi model terhadap Ground Truth versi{" "}
            <strong className="font-mono text-indigo-600 dark:text-indigo-400">
              {activeGtVersion}
            </strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#4d3fa3] px-6 py-3.5 text-xs font-black text-white shadow-lg transition-transform active:scale-95 hover:bg-[#3d3185]"
        >
          <Upload className="h-4 w-4" />
          <span>Unggah Submission Baru</span>
        </button>
      </div>

      {/* Filter Bento Bar */}
      <div className="pin-card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama eksperimen, arsitektur, atau anggota tim..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mr-1">
            Tag:
          </span>
          {["ALL", ...allTags].map((tag) => {
            const active = filterTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setFilterTag(tag)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? "bg-[#4d3fa3] text-white shadow-xs"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {tag === "ALL" ? "Semua Tag" : tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Leaderboard Table Bento Card */}
      <div className="pin-card overflow-hidden">
        <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
          <h2 className="text-base font-black text-zinc-900 dark:text-white">
            Peringkat Keseluruhan
          </h2>
          <p className="text-xs text-zinc-500">
            Diurutkan otomatis berdasarkan skor Macro F1 pada data pengujian
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="pin-table min-w-[900px]">
            <thead>
              <tr>
                <th className="w-16 text-center">Rank</th>
                <th>Nama Eksperimen &amp; Model</th>
                <th className="w-40">Anggota Tim</th>
                <th className="w-32 text-right">Val F1</th>
                <th className="w-32 text-right">Test F1</th>
                <th className="w-32 text-right">Selisih</th>
                <th className="w-36 text-center">Slot Resmi</th>
                <th className="w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-14 text-center text-xs font-semibold text-zinc-400"
                  >
                    Belum ada submission yang sesuai dengan pencarian Anda.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub, idx) => {
                  const gapColor =
                    sub.generalizationGap >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : sub.generalizationGap >= -0.03
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-rose-600 dark:text-rose-400";

                  return (
                    <tr key={sub.id}>
                      <td className="text-center">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-xl font-mono text-xs font-black ${
                            idx < 3
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          #{idx + 1}
                        </span>
                      </td>

                      <td>
                        <div className="text-xs font-black text-zinc-900 dark:text-white">
                          {sub.name}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                          <span>
                            Arsitektur:{" "}
                            <strong className="text-zinc-700 dark:text-zinc-300">
                              {sub.modelName}
                            </strong>
                          </span>
                          {sub.tags && sub.tags.length > 0 && (
                            <div className="flex gap-1">
                              {sub.tags.map((t) => (
                                <span
                                  key={t}
                                  className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {sub.leaderboardName}
                      </td>

                      <td className="text-right font-mono text-xs font-semibold text-zinc-500">
                        {(sub.validationMacroF1 * 100).toFixed(2)}%
                      </td>

                      <td className="text-right font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {(sub.testMacroF1 * 100).toFixed(2)}%
                      </td>

                      <td className={`text-right font-mono font-black ${gapColor}`}>
                        {sub.generalizationGap > 0 ? "+" : ""}
                        {(sub.generalizationGap * 100).toFixed(2)}%
                      </td>

                      <td className="text-center">
                        {sub.isOfficial ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300">
                            <Target className="h-3 w-3" />
                            <span>Slot #{sub.officialSlot || 1}</span>
                          </span>
                        ) : (
                          <span className="text-zinc-400">&mdash;</span>
                        )}
                      </td>

                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setConfirmOfficialModalSub(sub)}
                            className="rounded-xl bg-indigo-50 px-2.5 py-1.5 text-[11px] font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300"
                            title="Tentukan Slot Resmi"
                          >
                            Resmi
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSubmission(sub.id)}
                            className="rounded-xl bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
                            title="Hapus Submission"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UploadSubmissionModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      {/* Official Calibration Dialog Bento */}
      {confirmOfficialModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="pin-card w-full max-w-md p-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <h3 className="text-base font-black text-zinc-900 dark:text-white">
                Pilih Slot Kalibrasi Resmi
              </h3>
              <button
                type="button"
                onClick={() => setConfirmOfficialModalSub(null)}
                className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-xs text-zinc-600 dark:text-zinc-400">
              Tentukan slot untuk model &ldquo;
              <strong>{confirmOfficialModalSub.name}</strong>&rdquo;.
            </p>

            <div className="my-5 flex gap-3">
              {[1, 2, 3].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot as 1 | 2 | 3)}
                  className={`flex-1 rounded-2xl py-3 text-xs font-black transition-all ${
                    selectedSlot === slot
                      ? "bg-[#4d3fa3] text-white shadow-md"
                      : "border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  Slot #{slot}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOfficialModalSub(null)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmOfficial}
                className="rounded-xl bg-[#4d3fa3] px-5 py-2 text-xs font-black text-white hover:bg-[#3d3185]"
              >
                Simpan Slot #{selectedSlot}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
