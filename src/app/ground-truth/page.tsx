"use client";

import React, { useState } from "react";
import { ClassLabel, DatasetItem } from "@/types";
import { useAppStore } from "@/lib/store";
import { mapNumericToClassLabel } from "@/lib/evaluator";
import { GtConfirmModal } from "@/components/gt/GtConfirmModal";
import { GtValidationModal } from "@/components/gt/GtValidationModal";
import { ItemThumbnail } from "@/components/ui/ItemThumbnail";
import { Database, Upload, FileArchive, AlertCircle, CheckCircle2, History, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

export default function GroundTruthPage() {
  const { dataset, activeGtVersion, updateGroundTruthDataset, uploadTestZip } = useAppStore();

  const [pendingDataset, setPendingDataset] = useState<DatasetItem[] | null>(null);
  const [csvFileName, setCsvFileName] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [zipUploadStatus, setZipUploadStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [zipErrorMessage, setZipErrorMessage] = useState("");
  const [isUnzipping, setIsUnzipping] = useState(false);
  const [zipInfo, setZipInfo] = useState<{ totalImages: number } | null>(null);
  const [csvInfo, setCsvInfo] = useState<{ totalIds: number; totalLabels: number } | null>(null);

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUnzipping(true);
    setZipUploadStatus("Sedang membaca dan mengekstrak file ZIP...");
    setZipErrorMessage("");
    setZipInfo(null);
    try {
      const count = await uploadTestZip(file);
      setIsUnzipping(false);
      setZipInfo({ totalImages: count });
      setZipUploadStatus(`Berhasil membaca ${count} gambar test dari "${file.name}".`);
    } catch {
      setIsUnzipping(false);
      setZipErrorMessage("Gagal mengekstrak file ZIP. Pastikan format ZIP berisi gambar berpenamaan angka (1.jpg, 2.jpg, ...).");
    }
  };

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

        // Validasi baris kosong
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
    setUploadStatus("Ground Truth berhasil diperbarui dan seluruh submission dievaluasi ulang.");
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
            Data Preparation & Management
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#0f1b35", letterSpacing: "-0.4px" }}>
            Data Test & Ground Truth
          </h1>
          <p style={{ fontSize: "12.5px", color: "#94a3b8", marginTop: "4px" }}>
            Unggah ZIP gambar dan CSV acuan Ground Truth (kode angka 0, 1, 2)
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

      {/* Error messages */}
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
      {zipErrorMessage && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "10px",
          background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: "10px", padding: "12px 16px",
        }}>
          <AlertCircle style={{ width: "15px", height: "15px", color: "#dc2626", flexShrink: 0, marginTop: "1px" }} />
          <span style={{ fontSize: "12px", color: "#991b1b", lineHeight: 1.5 }}>{zipErrorMessage}</span>
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
      {zipUploadStatus && !zipErrorMessage && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          borderRadius: "10px", padding: "12px 16px",
        }}>
          <CheckCircle2 style={{ width: "15px", height: "15px", color: "#16a34a", flexShrink: 0 }} />
          <span style={{ fontSize: "12px", color: "#15803d", fontWeight: 600 }}>{zipUploadStatus}</span>
          {zipInfo && (
            <span style={{ marginLeft: "8px", fontSize: "11.5px", color: "#15803d" }}>
              Total gambar terbaca: <strong>{zipInfo.totalImages}</strong>
            </span>
          )}
        </div>
      )}

      {/* Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* ZIP Upload */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileArchive style={{ width: "18px", height: "18px", color: "#7c3aed" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "13.5px", fontWeight: 800, color: "#0f1b35" }}>
                1. Unggah Gambar Data Test (ZIP)
              </h2>
              <p style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "1px" }}>
                Arsip berisi gambar asli (1.jpg, 2.jpg, ...)
              </p>
            </div>
          </div>

          <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.6 }}>
            Sistem akan mengekstrak dan mengindeks gambar secara langsung di browser. Setiap gambar dikaitkan berdasarkan nomor ID.
          </p>

          <label
            style={dropzoneStyle}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.background = "#faf5ff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc"; }}
          >
            <FileArchive style={{ width: "28px", height: "28px", color: "#7c3aed" }} />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f1b35" }}>
              {isUnzipping ? "Mengekstrak file ZIP..." : "Pilih File Arsip (.zip)"}
            </span>
            <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>
              Format: dataset_test.zip berisi file berpenamaan angka ID
            </span>
            <input type="file" accept=".zip" onChange={handleZipUpload} disabled={isUnzipping} style={{ display: "none" }} />
          </label>

          {/* Preview thumbnails */}
          <div style={{ background: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9", padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#475569" }}>Pratinjau Gambar Terindeks:</span>
              <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#7c3aed", fontFamily: "monospace" }}>
                {dataset.length} Gambar
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px", maxHeight: "120px", overflowY: "auto" }}>
              {dataset.slice(0, 12).map((item) => (
                <ItemThumbnail key={item.id} id={item.id} imageNumber={item.imageNumber} label={item.groundTruthLabel} size="sm" />
              ))}
            </div>
            {dataset.length === 0 && (
              <p style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", padding: "10px 0" }}>
                Belum ada gambar terindeks. Unggah file ZIP.
              </p>
            )}
          </div>
        </div>

        {/* CSV Upload */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileSpreadsheet style={{ width: "18px", height: "18px", color: "#1d4ed8" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "13.5px", fontWeight: 800, color: "#0f1b35" }}>
                2. Unggah Ground Truth (CSV)
              </h2>
              <p style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "1px" }}>
                Format kolom: ID,GroundTruth (angka 0, 1, atau 2)
              </p>
            </div>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "10px 12px" }}>
            <p style={{ fontSize: "11.5px", color: "#475569", lineHeight: 1.6 }}>
              Kode label:{" "}
              <span style={{ fontWeight: 700, color: "#0f1b35" }}>0</span> = Recyclable,{" "}
              <span style={{ fontWeight: 700, color: "#0f1b35" }}>1</span> = Electronic,{" "}
              <span style={{ fontWeight: 700, color: "#0f1b35" }}>2</span> = Organic.
              Baris tanpa label akan <strong style={{ color: "#dc2626" }}>ditolak</strong>.
            </p>
          </div>

          <label
            style={dropzoneStyle}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1d4ed8"; e.currentTarget.style.background = "#eff6ff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc"; }}
          >
            <Upload style={{ width: "28px", height: "28px", color: "#1d4ed8" }} />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f1b35" }}>
              Pilih File CSV Ground Truth
            </span>
            <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>
              Contoh isi: 1,0 / 2,1 / 3,2
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
              <div style={{ fontSize: "11.5px", color: "#15803d" }}>
                <strong>{csvInfo.totalIds} ID gambar</strong> terbaca &bull;{" "}
                <strong>{csvInfo.totalLabels} label</strong> valid ditemukan
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
              Setelah mengunggah, seluruh submission akan dievaluasi ulang secara otomatis terhadap Ground Truth baru.
            </p>
          </div>
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
