"use client";

import React from "react";
import { Submission, DatasetItem } from "@/types";
import { Award, X, GitBranch } from "lucide-react";

interface SubmissionComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  newSubmission: Submission | null;
  previousBestSubmission: Submission | null;
  parentSubmission?: Submission | null;
  dataset: DatasetItem[];
}

export const SubmissionComparisonModal: React.FC<
  SubmissionComparisonModalProps
> = ({
  isOpen,
  onClose,
  newSubmission,
  previousBestSubmission,
  parentSubmission,
  dataset,
}) => {
  if (!isOpen || !newSubmission) return null;

  let newCorrectCount = 0;
  let fixedFromParent = 0;
  let regressedFromParent = 0;

  for (const item of dataset) {
    const newPred = newSubmission.predictions[item.id];
    if (newPred === item.groundTruthLabel) {
      newCorrectCount += 1;
    }
    if (parentSubmission) {
      const parPred = parentSubmission.predictions[item.id];
      const wasCorrect = parPred === item.groundTruthLabel;
      const isCorrect = newPred === item.groundTruthLabel;
      if (!wasCorrect && isCorrect) fixedFromParent += 1;
      if (wasCorrect && !isCorrect) regressedFromParent += 1;
    }
  }

  const deltaBestF1 = previousBestSubmission
    ? (newSubmission.testMacroF1 - previousBestSubmission.testMacroF1) * 100
    : newSubmission.testMacroF1 * 100;

  const deltaParentF1 = parentSubmission
    ? (newSubmission.testMacroF1 - parentSubmission.testMacroF1) * 100
    : 0;

  const generateParentInsight = () => {
    if (!parentSubmission) {
      return `Submission "${newSubmission.name}" merupakan Baseline Eksperimen baru. Menjadi titik awal pengembangan model untuk cabang penelitian ini.`;
    }

    const absF1 = Math.abs(deltaParentF1).toFixed(2);
    if (deltaParentF1 > 0) {
      return `Tujuan revisi berhasil tercapai. ${
        newSubmission.reasonOfRevision
          ? `Revisi "${newSubmission.reasonOfRevision}"`
          : "Revisi"
      } meningkatkan Macro F1 sebesar +${absF1}% dibanding parent eksperimen (${
        parentSubmission.name
      }). Sebanyak ${fixedFromParent} gambar salah menjadi benar, dan hanya ${regressedFromParent} gambar mengalami penurunan.`;
    } else if (deltaParentF1 === 0) {
      return `Revisi memberikan hasil setara dengan parent eksperimen (${parentSubmission.name}) dengan Macro F1 yang sama persis.`;
    } else {
      return `Revisi belum memberikan peningkatan dibanding parent (${parentSubmission.name}) dengan selisih -${absF1}% Macro F1 (${regressedFromParent} gambar benar menjadi salah). Disarankan meninjau kembali strategi atau augmentasi yang ditambahkan.`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Laporan Evaluasi Ganda
              </span>
              <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                Hasil Evaluasi Submission: {newSubmission.name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                <GitBranch className="h-3 w-3" />
                <span>Perbandingan vs Parent Experiment</span>
              </span>
              <span className="text-xs font-bold text-zinc-500">
                {parentSubmission ? parentSubmission.name : "Root Baseline"}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-black text-zinc-900 dark:text-white">
                {parentSubmission
                  ? `${newSubmission.name} vs ${parentSubmission.name}`
                  : "Baseline Baru (Tanpa Parent)"}
              </div>
              {newSubmission.reasonOfRevision && (
                <p className="text-xs text-zinc-500 italic">
                  &ldquo;{newSubmission.reasonOfRevision}&rdquo;
                </p>
              )}
            </div>

            {parentSubmission ? (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white p-3 border border-zinc-200/80 dark:border-zinc-800 dark:bg-zinc-900">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase">
                      Perubahan Macro F1
                    </span>
                    <span
                      className={`text-lg font-black font-mono ${
                        deltaParentF1 >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {deltaParentF1 >= 0 ? "+" : ""}
                      {deltaParentF1.toFixed(2)}%
                    </span>
                  </div>

                  <div className="rounded-xl bg-white p-3 border border-zinc-200/80 dark:border-zinc-800 dark:bg-zinc-900">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase">
                      Akurasi Sampel
                    </span>
                    <span className="text-sm font-black text-zinc-900 dark:text-white">
                      {newCorrectCount} / {dataset.length}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <div className="font-bold">Salah &rarr; Benar</div>
                    <div className="text-base font-black font-mono">
                      +{fixedFromParent} Sampel
                    </div>
                  </div>
                  <div className="rounded-xl bg-red-50 p-3 text-red-900 dark:bg-red-950/40 dark:text-red-300">
                    <div className="font-bold">Benar &rarr; Salah</div>
                    <div className="text-base font-black font-mono">
                      -{regressedFromParent} Sampel
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-white p-4 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                Submission ini bertindak sebagai awal eksperimen baseline.
              </div>
            )}

            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs font-medium text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200">
              {generateParentInsight()}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-2.5 py-1 text-[10px] font-bold uppercase text-white dark:bg-zinc-100 dark:text-zinc-900">
                <Award className="h-3 w-3" />
                <span>Perbandingan vs Leaderboard Terbaik</span>
              </span>
              <span className="text-xs font-bold text-zinc-500">
                {previousBestSubmission
                  ? previousBestSubmission.name
                  : "Ranking #1"}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-black text-zinc-900 dark:text-white">
                Peringkat Saat Ini: #{newSubmission.rank}
              </div>
              <p className="text-xs text-zinc-500">
                Macro F1 Test:{" "}
                <strong className="text-zinc-900 dark:text-white">
                  {(newSubmission.testMacroF1 * 100).toFixed(2)}%
                </strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-white p-3 border border-zinc-200/80 dark:border-zinc-800 dark:bg-zinc-900">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase">
                  Selisih vs Ranking #1
                </span>
                <span
                  className={`text-lg font-black font-mono ${
                    deltaBestF1 >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {deltaBestF1 >= 0 ? "+" : ""}
                  {deltaBestF1.toFixed(2)}%
                </span>
              </div>

              <div className="rounded-xl bg-white p-3 border border-zinc-200/80 dark:border-zinc-800 dark:bg-zinc-900">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase">
                  Generalization Gap
                </span>
                <span className="text-lg font-black font-mono text-zinc-900 dark:text-white">
                  {(newSubmission.generalizationGap * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              {newSubmission.rank === 1 ? (
                <span className="text-emerald-600 font-bold">
                  Model ini menempati posisi #1 pada Leaderboard saat ini!
                </span>
              ) : (
                <span>
                  Model ini berada pada posisi #{newSubmission.rank} di
                  Leaderboard secara keseluruhan.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Tutup &amp; Lihat Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};
