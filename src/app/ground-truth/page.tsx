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
      "Ground Truth berhasil diperbarui dan tersinkronisasi instan ke seluruh device."
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
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Manajemen Metadata Tabular
          </span>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            Data Test &amp; Acuan Ground Truth
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Versi Ground Truth Aktif:{" "}
            <strong className="font-mono font-bold text-zinc-900 dark:text-white">
              {activeGtVersion}
            </strong>{" "}
            ({dataset.length} sampel metadata terindeks)
          </p>
        </div>

        <Link
          href="/history"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <History className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Audit Riwayat Ground Truth</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Total Sampel
          </div>
          <div className="mt-1 font-mono text-2xl font-black text-zinc-900 dark:text-white">
            {counts.total}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Terindeks di sistem</div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            0 — Recyclable
          </div>
          <div className="mt-1 font-mono text-2xl font-black text-zinc-900 dark:text-white">
            {counts.class0}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {(counts.total > 0
              ? (counts.class0 / counts.total) * 100
              : 0
            ).toFixed(1)}
            % dari proporsi dataset
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
            1 — Electronic
          </div>
          <div className="mt-1 font-mono text-2xl font-black text-zinc-900 dark:text-white">
            {counts.class1}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {(counts.total > 0
              ? (counts.class1 / counts.total) * 100
              : 0
            ).toFixed(1)}
            % dari proporsi dataset
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-red-600">
            2 — Organic
          </div>
          <div className="mt-1 font-mono text-2xl font-black text-zinc-900 dark:text-white">
            {counts.class2}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {(counts.total > 0
              ? (counts.class2 / counts.total) * 100
              : 0
            ).toFixed(1)}
            % dari proporsi dataset
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
              Unggah File CSV Ground Truth (Tabular Metadata)
            </h2>
            <p className="text-xs text-zinc-500">
              Format CSV yang didukung: <code>ID,GroundTruth</code> dengan angka
              0, 1, 2
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/60 p-8 text-center transition-colors hover:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950/40">
          <Upload className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
          <p className="mt-3 text-xs font-bold text-zinc-800 dark:text-zinc-200">
            Pilih atau seret file CSV Ground Truth ke area ini
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">
            Sistem memproses metadata tabular dan langsung memperbarui evaluasi
            seluruh submission
          </p>

          <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700">
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
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-xs font-medium text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
            <span>{uploadStatus}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-5 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
              Tabel Terindeks Ground Truth ({dataset.length} Sampel)
            </h2>
            <p className="text-xs text-zinc-500">
              Daftar seluruh sampel metadata beserta label referensi
            </p>
          </div>
        </div>

        {dataset.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            Belum ada sampel metadata terindeks. Unggah CSV untuk memulai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                  <th className="p-3.5">ID Sampel</th>
                  <th className="p-3.5">Kode Angka</th>
                  <th className="p-3.5">Label Kelas</th>
                  <th className="p-3.5">Status Agreement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {dataset.slice(0, 100).map((item) => {
                  const num = mapClassLabelToNumeric(item.groundTruthLabel);
                  const badgeColor =
                    num === 0
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : num === 1
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300";

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      <td className="p-3.5 font-mono font-bold text-zinc-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 text-zinc-400" />
                          <span>#{item.id}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-zinc-700 dark:text-zinc-300">
                        {num}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-bold ${badgeColor}`}
                        >
                          {item.groundTruthLabel}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-500 dark:text-zinc-400">
                        Consensus Terverifikasi
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {dataset.length > 100 && (
              <div className="border-t border-zinc-100 p-3 text-center text-xs text-zinc-400 dark:border-zinc-800">
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
