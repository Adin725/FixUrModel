"use client";

import React from "react";
import { Submission } from "@/types";
import { useAppStore } from "@/lib/store";
import { X, Printer, FileText, CheckCircle2, ShieldCheck } from "lucide-react";

interface ResearchExperimentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchExperimentReportModal: React.FC<
  ResearchExperimentReportModalProps
> = ({ isOpen, onClose }) => {
  const { submissions, activeGtVersion, dataset } = useAppStore();

  if (!isOpen) return null;

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:static print:block print:bg-white print:p-0">
      <div className="w-full max-w-7xl max-h-[92vh] overflow-y-auto rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 print:max-h-none print:w-full print:max-w-none print:overflow-visible print:border-0 print:p-0 print:shadow-none space-y-6">
        {/* Screen Header (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-5 dark:border-zinc-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Dokumentasi Tabular PDF
              </span>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                Research Experiment Report
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrintPDF}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="space-y-6 print:space-y-4">
          <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-4 dark:border-zinc-200 print:border-zinc-900">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white print:text-black">
                RESEARCH EXPERIMENT LOG &amp; LINEAGE REPORT
              </h1>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 print:text-zinc-700">
                Laporan Resmi Tim Riset Computer Vision Platform &bull; Versi Ground Truth: {activeGtVersion} ({dataset.length} Sampel)
              </p>
            </div>
            <div className="text-right text-xs font-mono text-zinc-500 print:text-black">
              <div>Tanggal Eksport: {new Date().toLocaleDateString("id-ID")}</div>
              <div>Total Eksperimen: {submissions.length}</div>
            </div>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full border-collapse text-left text-[11px] print:text-[10px]">
              <thead>
                <tr className="border-y-2 border-zinc-800 bg-zinc-50 font-bold uppercase tracking-wider text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 print:border-black print:bg-zinc-100 print:text-black">
                  <th className="p-2.5">Rank &amp; ID</th>
                  <th className="p-2.5">Author</th>
                  <th className="p-2.5">Parent</th>
                  <th className="p-2.5">Reason of Revision</th>
                  <th className="p-2.5">Model Arsitektur</th>
                  <th className="p-2.5">Strategi</th>
                  <th className="p-2.5 text-right">Val F1</th>
                  <th className="p-2.5 text-right">GT F1</th>
                  <th className="p-2.5 text-right">Gen. Gap</th>
                  <th className="p-2.5">Tag Otomatis</th>
                  <th className="p-2.5">Waktu Submit</th>
                  <th className="p-2.5 text-center">Status Official</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-zinc-300">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-zinc-500">
                      Belum ada eksperimen tercatat.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => {
                    const parent = sub.parentId
                      ? submissions.find((p) => p.id === sub.parentId)
                      : null;
                    return (
                      <tr
                        key={sub.id}
                        className={`hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 print:hover:bg-transparent ${
                          sub.isOfficial ? "bg-blue-50/50 dark:bg-blue-950/20 print:bg-zinc-100 font-medium" : ""
                        }`}
                      >
                        <td className="p-2.5 font-bold text-zinc-900 dark:text-white print:text-black">
                          #{sub.rank} ({sub.name})
                        </td>
                        <td className="p-2.5 font-semibold text-zinc-800 dark:text-zinc-200 print:text-black">
                          {sub.leaderboardName}
                        </td>
                        <td className="p-2.5 text-zinc-600 dark:text-zinc-400 print:text-black">
                          {parent ? parent.name : "Baseline Root"}
                        </td>
                        <td className="p-2.5 max-w-[160px] text-zinc-600 dark:text-zinc-400 print:text-black italic">
                          {sub.reasonOfRevision || "-"}
                        </td>
                        <td className="p-2.5 font-medium text-zinc-800 dark:text-zinc-200 print:text-black">
                          {sub.modelName}
                        </td>
                        <td className="p-2.5 max-w-[160px] text-zinc-600 dark:text-zinc-400 print:text-black">
                          {sub.strategyDescription}
                        </td>
                        <td className="p-2.5 text-right font-mono print:text-black">
                          {(sub.validationMacroF1 * 100).toFixed(2)}%
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-zinc-900 dark:text-white print:text-black">
                          {(sub.testMacroF1 * 100).toFixed(2)}%
                        </td>
                        <td className="p-2.5 text-right font-mono print:text-black">
                          {(sub.generalizationGap * 100).toFixed(2)}%
                        </td>
                        <td className="p-2.5 print:text-black">
                          {sub.tags?.join(", ") || "-"}
                        </td>
                        <td className="p-2.5 font-mono text-[10px] text-zinc-500 print:text-black">
                          {sub.uploadTimestampWIB}
                        </td>
                        <td className="p-2.5 text-center print:text-black">
                          {sub.isOfficial ? (
                            <span className="inline-flex items-center rounded bg-blue-600 px-2 py-0.5 text-[9px] font-bold text-white print:border print:border-black print:bg-black print:text-white">
                              Official #{sub.officialSlot || 1}
                            </span>
                          ) : (
                            <span className="text-zinc-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 print:border-black flex justify-between text-xs text-zinc-500 print:text-black">
            <div>Ketua Tim Riset: Rijal</div>
            <div>Anggota: Fikri &amp; Riskan</div>
            <div>Dokumentasi Otentik &bull; Computer Vision Platform</div>
          </div>
        </div>
      </div>
    </div>
  );
};
