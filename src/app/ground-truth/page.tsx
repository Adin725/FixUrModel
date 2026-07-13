"use client";

import React, { useState } from "react";
import { DatasetItem } from "@/types";
import { useAppStore } from "@/lib/store";
import {
  mapNumericToClassLabel,
  mapClassLabelToNumeric,
} from "@/lib/evaluator";
import { GtValidationModal } from "@/components/gt/GtValidationModal";
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  History,
  FileSpreadsheet,
  Hash,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function GroundTruthPage() {
  const { dataset, activeGtVersion, updateGroundTruthDataset } = useAppStore();

  const [pendingDataset, setPendingDataset] = useState<DatasetItem[] | null>(
    null
  );
  const [csvFileName, setCsvFileName] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [csvInfo, setCsvInfo] = useState<{
    totalIds: number;
    totalLabels: number;
  } | null>(null);

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage("");
    setUploadStatus("Membaca dan memvalidasi file CSV Ground Truth...");
    setCsvFileName(file.name);
    setCsvInfo(null);

    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const parsed: DatasetItem[] = [];
    const emptyRows: number[] = [];

    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(/[,;\t]/).map((p) => p.trim());
      if (parts.length >= 2) {
        const firstCol = parts[0].replace(/['"]/g, "");
        const id = parseInt(firstCol, 10);
        if (isNaN(id)) continue;

        let labelRaw = parts[1].replace(/['"]/g, "");
        if (
          parts.length >= 3 &&
          (labelRaw.endsWith(".jpg") || labelRaw.endsWith(".png"))
        ) {
          labelRaw = parts[2].replace(/['"]/g, "");
        }

        if (!labelRaw || labelRaw === "") {
          emptyRows.push(id);
          continue;
        }

        const label = mapNumericToClassLabel(labelRaw);
        parsed.push({ id, imageNumber: id, groundTruthLabel: label });
      }
    }

    if (emptyRows.length > 0) {
      setErrorMessage(
        `Ditemukan ${emptyRows.length} baris tanpa label pada ID: ${emptyRows
          .slice(0, 10)
          .map((id) => `#${id}`)
          .join(", ")}${
          emptyRows.length > 10 ? ` ...dan ${emptyRows.length - 10} lainnya` : ""
        }. Perbaiki file terlebih dahulu.`
      );
      setUploadStatus("");
      return;
    }

    if (parsed.length === 0) {
      setErrorMessage(
        "Gagal membaca CSV. Format kolom: ID,GroundTruth dengan angka 0 (Recyclable), 1 (Electronic), 2 (Organic)."
      );
      setUploadStatus("");
      return;
    }

    parsed.sort((a, b) => a.id - b.id);
    const totalLabels = parsed.filter((p) => p.groundTruthLabel).length;
    setCsvInfo({ totalIds: parsed.length, totalLabels });
    setPendingDataset(parsed);
    setShowValidationModal(true);
    setUploadStatus(
      `Ditemukan ${parsed.length} sampel — ${totalLabels} label terbaca. Siap divalidasi.`
    );
  };

  const handleApplyValidatedGT = (reason: string) => {
    if (!pendingDataset) return;
    updateGroundTruthDataset(pendingDataset, reason);
    setPendingDataset(null);
    setShowValidationModal(false);
    setUploadStatus(
      "Ground Truth berhasil diperbarui dan tersinkronisasi ke seluruh perangkat."
    );
  };

  const counts = {
    total: dataset.length,
    class0: dataset.filter(
      (d) => mapClassLabelToNumeric(d.groundTruthLabel) === 0
    ).length,
    class1: dataset.filter(
      (d) => mapClassLabelToNumeric(d.groundTruthLabel) === 1
    ).length,
    class2: dataset.filter(
      (d) => mapClassLabelToNumeric(d.groundTruthLabel) === 2
    ).length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-14">
      {/* Hero Bento Header */}
      <div className="pin-card pin-card-lavender flex flex-wrap items-center justify-between gap-6 p-7">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
            <Sparkles className="h-3 w-3" />
            <span>Manajemen Ground Truth</span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Data Tes &amp; Acuan Ground Truth
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
            Versi Ground Truth Aktif:{" "}
            <strong className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {activeGtVersion}
            </strong>{" "}
            ({dataset.length} sampel metadata terindeks)
          </p>
        </div>

        <Link
          href="/history"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#4d3fa3] px-5 py-3 text-xs font-black text-white shadow-lg transition-transform active:scale-95 hover:bg-[#3d3185]"
        >
          <History className="h-4 w-4" />
          <span>Audit Riwayat Ground Truth</span>
        </Link>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="pin-card pin-card-sky p-5">
          <div className="text-[11px] font-black uppercase tracking-wider text-indigo-950/70 dark:text-indigo-200">
            Total Sampel
          </div>
          <div className="mt-2 font-mono text-3xl font-black text-indigo-950 dark:text-white">
            {counts.total}
          </div>
          <div className="mt-1 text-xs font-semibold text-indigo-900/70 dark:text-indigo-300">
            Terindeks di sistem
          </div>
        </div>

        <div className="pin-card pin-card-mint p-5">
          <div className="text-[11px] font-black uppercase tracking-wider text-emerald-950/70 dark:text-emerald-200">
            0 — Recyclable
          </div>
          <div className="mt-2 font-mono text-3xl font-black text-emerald-950 dark:text-white">
            {counts.class0}
          </div>
          <div className="mt-1 text-xs font-semibold text-emerald-900/70 dark:text-emerald-300">
            {(counts.total > 0
              ? (counts.class0 / counts.total) * 100
              : 0
            ).toFixed(1)}
            % proporsi
          </div>
        </div>

        <div className="pin-card pin-card-lavender p-5">
          <div className="text-[11px] font-black uppercase tracking-wider text-violet-950/70 dark:text-violet-200">
            1 — Electronic
          </div>
          <div className="mt-2 font-mono text-3xl font-black text-violet-950 dark:text-white">
            {counts.class1}
          </div>
          <div className="mt-1 text-xs font-semibold text-violet-900/70 dark:text-violet-300">
            {(counts.total > 0
              ? (counts.class1 / counts.total) * 100
              : 0
            ).toFixed(1)}
            % proporsi
          </div>
        </div>

        <div className="pin-card pin-card-rose p-5">
          <div className="text-[11px] font-black uppercase tracking-wider text-rose-950/70 dark:text-rose-200">
            2 — Organic
          </div>
          <div className="mt-2 font-mono text-3xl font-black text-rose-950 dark:text-white">
            {counts.class2}
          </div>
          <div className="mt-1 text-xs font-semibold text-rose-900/70 dark:text-rose-300">
            {(counts.total > 0
              ? (counts.class2 / counts.total) * 100
              : 0
            ).toFixed(1)}
            % proporsi
          </div>
        </div>
      </div>

      {/* Upload CSV Bento Card */}
      <div className="pin-card p-6">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-zinc-900 dark:text-white">
              Unggah File CSV Ground Truth (Metadata Tabular)
            </h2>
            <p className="text-xs text-zinc-500">
              Format CSV: <code>ID,GroundTruth</code> dengan angka 0, 1, 2
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/60 p-8 text-center transition-colors hover:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950/40">
          <Upload className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
          <p className="mt-3 text-xs font-bold text-zinc-800 dark:text-zinc-200">
            Pilih file CSV Ground Truth untuk memperbarui referensi
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">
            Sistem memproses metadata tabular dan memperbarui evaluasi seluruh
            submission
          </p>

          <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#4d3fa3] px-6 py-3 text-xs font-black text-white shadow-sm hover:bg-[#3d3185]">
            <span>Pilih File CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
            />
          </label>
        </div>

        {uploadStatus && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-indigo-200 bg-indigo-50 p-3.5 text-xs font-bold text-indigo-800 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600" />
            <span>{uploadStatus}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Table Metadata Bento Card */}
      <div className="pin-card overflow-hidden">
        <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
          <h2 className="text-base font-black text-zinc-900 dark:text-white">
            Daftar Metadata Ground Truth ({dataset.length} Sampel)
          </h2>
          <p className="text-xs text-zinc-500">
            Daftar sampel dan label referensi terindeks
          </p>
        </div>

        {dataset.length === 0 ? (
          <div className="py-14 text-center text-xs font-semibold text-zinc-400">
            Belum ada sampel metadata terindeks. Unggah CSV untuk memulai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="pin-table min-w-[600px]">
              <thead>
                <tr>
                  <th className="w-32">ID Sampel</th>
                  <th className="w-32">Kode Angka</th>
                  <th>Label Kelas</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dataset.slice(0, 100).map((item) => {
                  const num = mapClassLabelToNumeric(item.groundTruthLabel);
                  const badgeClass =
                    num === 0
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                      : num === 1
                      ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300"
                      : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300";

                  return (
                    <tr key={item.id}>
                      <td className="font-mono font-black text-zinc-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 text-zinc-400" />
                          <span>#{item.id}</span>
                        </div>
                      </td>
                      <td className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
                        {num}
                      </td>
                      <td>
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${badgeClass}`}
                        >
                          {item.groundTruthLabel}
                        </span>
                      </td>
                      <td className="text-xs text-zinc-500 dark:text-zinc-400">
                        Consensus Terverifikasi
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {dataset.length > 100 && (
              <div className="border-t border-zinc-100 p-4 text-center text-xs text-zinc-400 dark:border-zinc-800">
                Menampilkan 100 pertama dari {dataset.length} sampel metadata.
              </div>
            )}
          </div>
        )}
      </div>

      <GtValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        pendingDataset={pendingDataset}
        csvFileName={csvFileName}
        csvInfo={csvInfo}
        onApply={handleApplyValidatedGT}
      />
    </div>
  );
}
