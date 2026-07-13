"use client";

import React, { useState } from "react";
import { DatasetItem } from "@/types";
import { useAppStore } from "@/lib/store";
import { mapNumericToClassLabel, mapClassLabelToNumeric } from "@/lib/evaluator";
import { GtValidationModal } from "@/components/gt/GtValidationModal";
import { ItemThumbnail } from "@/components/ui/ItemThumbnail";
import { Upload, AlertCircle, CheckCircle2, History, FileSpreadsheet, Hash } from "lucide-react";
import Link from "next/link";

export default function GroundTruthPage() {
  const { dataset, activeGtVersion, updateGroundTruthDataset } = useAppStore();

  const [pendingDataset, setPendingDataset] = useState<DatasetItem[] | null>(null);
  const [csvFileName, setCsvFileName] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [csvInfo, setCsvInfo] = useState<{ totalIds: number; totalLabels: number } | null>(null);

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
        if (parts.length >= 3 && (labelRaw.endsWith(".jpg") || labelRaw.endsWith(".png"))) {
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
        `Ditemukan ${emptyRows.length} baris tanpa label pada ID: ${emptyRows.slice(0, 10).map((id) => `#${id}`).join(", ")}${emptyRows.length > 10 ? ` ...dan ${emptyRows.length - 10} lainnya` : ""}. Perbaiki file terlebih dahulu.`
      );
      setUploadStatus("");
      return;
    }

    if (parsed.length === 0) {
      setErrorMessage("Gagal membaca CSV. Format kolom: ID,GroundTruth dengan angka 0 (Recyclable), 1 (Electronic), 2 (Organic).");
      setUploadStatus("");
      return;
    }

    parsed.sort((a, b) => a.id - b.id);
    const totalLabels = parsed.filter((p) => p.groundTruthLabel).length;
    setCsvInfo({ totalIds: parsed.length, totalLabels });
    setPendingDataset(parsed);
    setShowValidationModal(true);
    setUploadStatus(`Ditemukan ${parsed.length} sampel — ${totalLabels} label terbaca. Siap divalidasi.`);
  };

  const handleApplyValidatedGT = (reason: string) => {
    if (!pendingDataset) return;
    updateGroundTruthDataset(pendingDataset, reason);
    setPendingDataset(null);
    setShowValidationModal(false);
    setUploadStatus("Ground Truth & Metadata Dataset berhasil diperbarui dan tersinkronisasi instan ke seluruh device.");
  };

  const counts = {
    total: dataset.length,
    class0: dataset.filter((d) => mapClassLabelToNumeric(d.groundTruthLabel) === 0).length,
    class1: dataset.filter((d) => mapClassLabelToNumeric(d.groundTruthLabel) === 1).length,
    class2: dataset.filter((d) => mapClassLabelToNumeric(d.groundTruthLabel) === 2).length,
  };

  const sectionStyle: React.CSSProperties = {
    background: "#fff", borderRadius: "14px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(15,27,53,0.05)",
    padding: "24px",
    display: "flex", flexDirection: "column", gap: "16px",
  };

  const dropzoneStyle: React.CSSProperties = {
    borderRadius: "10px", border: "2px dashed #cbd5e1",
    background: "#f8fafc", padding: "24px",
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: "8px", cursor: "pointer",
    textAlign: "center", transition: "all 0.15s",
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "#eff6ff", borderRadius: "8px", padding: "4px 10px",
            fontSize: "10.5px", fontWeight: 700, color: "#1d4ed8", marginBottom: "8px",
          }}>
            Data Preparation & Management (Metadata Only)
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#0f1b35", letterSpacing: "-0.4px" }}>
            Data Test & Ground Truth
          </h1>
          <p style={{ fontSize: "12.5px", color: "#94a3b8", marginTop: "4px" }}>
            Unggah CSV Ground Truth (ID Sampel & Kode Angka 0, 1, 2) untuk sinkronisasi evaluasi model
          </p>
        </div>
        <Link
          href="/history"
          style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            padding: "9px 16px", borderRadius: "9px",
            border: "1px solid #e2e8f0", background: "#fff",
            fontSize: "12px", fontWeight: 600, color: "#475569",
            textDecoration: "none",
          }}
        >
          <History style={{ width: "14px", height: "14px", color: "#1d4ed8" }} />
          Riwayat Audit GT
        </Link>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "10px",
          background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: "10px", padding: "12px 16px",
        }}>
          <AlertCircle style={{ width: "15px", height: "15px", color: "#dc2626", flexShrink: 0, marginTop: "1px" }} />
          <span style={{ fontSize: "12px", color: "#991b1b", lineHeight: 1.5 }}>{errorMessage}</span>
        </div>
      )}

      {/* Success info */}
      {uploadStatus && !errorMessage && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          borderRadius: "10px", padding: "12px 16px",
        }}>
          <CheckCircle2 style={{ width: "15px", height: "15px", color: "#16a34a", flexShrink: 0 }} />
          <span style={{ fontSize: "12px", color: "#15803d", fontWeight: 600 }}>{uploadStatus}</span>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xs font-semibold text-zinc-400">Total Sampel Metadata</span>
          <div className="mt-1 font-mono text-2xl font-bold text-zinc-900 dark:text-white">
            {counts.total}
          </div>
        </div>
        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Angka 0 (Recyclable)</span>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-800 dark:text-emerald-300">
            {counts.class0}
          </div>
        </div>
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/40 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Angka 1 (Electronic)</span>
          <div className="mt-1 font-mono text-2xl font-bold text-amber-800 dark:text-amber-300">
            {counts.class1}
          </div>
        </div>
        <div className="rounded-xl border border-red-200/60 bg-red-50/40 p-4 dark:border-red-900/40 dark:bg-red-950/20">
          <span className="text-xs font-semibold text-red-700 dark:text-red-400">Angka 2 (Organic)</span>
          <div className="mt-1 font-mono text-2xl font-bold text-red-800 dark:text-red-300">
            {counts.class2}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>

        {/* CSV Upload */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileSpreadsheet style={{ width: "18px", height: "18px", color: "#1d4ed8" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "14px", fontWeight: 800, color: "#0f1b35" }}>
                Unggah & Inisialisasi Metadata Ground Truth (CSV)
              </h2>
              <p style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "1px" }}>
                Format kolom: ID,GroundTruth (angka 0, 1, atau 2)
              </p>
            </div>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "12px 14px" }}>
            <p style={{ fontSize: "12px", color: "#475569", lineHeight: 1.6 }}>
              Unggah file CSV untuk menginisialisasi atau memperbarui metadata sampel dan acuan Ground Truth.
              Kode angka label:{" "}
              <span style={{ fontWeight: 700, color: "#0f1b35" }}>0</span> = Recyclable,{" "}
              <span style={{ fontWeight: 700, color: "#0f1b35" }}>1</span> = Electronic,{" "}
              <span style={{ fontWeight: 700, color: "#0f1b35" }}>2</span> = Organic.
            </p>
          </div>

          <label
            style={dropzoneStyle}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1d4ed8"; e.currentTarget.style.background = "#eff6ff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc"; }}
          >
            <Upload style={{ width: "28px", height: "28px", color: "#1d4ed8" }} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1b35" }}>
              Pilih File CSV Ground Truth (.csv)
            </span>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              Contoh isi baris: 1,0 / 2,1 / 3,2 ...
            </span>
            <input type="file" accept=".csv" onChange={handleCsvUpload} style={{ display: "none" }} />
          </label>

          {csvInfo && (
            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: "8px", padding: "10px 14px",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <CheckCircle2 style={{ width: "14px", height: "14px", color: "#16a34a" }} />
              <div style={{ fontSize: "12px", color: "#15803d" }}>
                <strong>{csvInfo.totalIds} ID gambar</strong> terbaca &bull;{" "}
                <strong>{csvInfo.totalLabels} label</strong> valid siap disinkronkan
              </div>
            </div>
          )}

          <div style={{ background: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9", padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#475569" }}>Acuan GT Aktif:</span>
              <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#1d4ed8", fontFamily: "monospace" }}>
                Versi {activeGtVersion} ({dataset.length} sampel)
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "#94a3b8", lineHeight: 1.5 }}>
              Setelah dikonfirmasi, metadata sampel dan Ground Truth akan tersinkronisasi instan ke seluruh device tanpa pemuatan gambar.
            </p>
          </div>
        </div>

        {/* Sample Metadata Grid */}
        <div style={sectionStyle}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Daftar Sampel Dataset Terindeks ({dataset.length} sampel)
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Versi Aktif: {activeGtVersion}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-96 overflow-y-auto p-1">
            {dataset.map((item) => (
              <ItemThumbnail
                key={item.id}
                id={item.id}
                imageNumber={item.imageNumber}
                label={item.groundTruthLabel}
                size="md"
              />
            ))}
          </div>
          {dataset.length === 0 && (
            <div className="py-10 text-center text-xs text-zinc-400">
              Belum ada sampel terindeks. Silakan unggah file CSV Ground Truth di atas.
            </div>
          )}
        </div>
      </div>

      <GtValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        onConfirm={handleApplyValidatedGT}
        dataset={pendingDataset || []}
        filename={csvFileName}
      />
    </div>
  );
}
