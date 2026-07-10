"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ClassLabel } from "@/types";
import { useAppStore } from "@/lib/store";
import { computeItemAgreement } from "@/lib/evaluator";
import { ItemThumbnail } from "@/components/ui/ItemThumbnail";
import { BarChart2, Save, CheckCircle2, ArrowRight, Search, RotateCcw, AlertCircle, Database } from "lucide-react";

export default function GroundTruthAnalysisPage() {
  const { dataset, submissions, updateGroundTruthBatch, activeGtVersion } = useAppStore();

  const [pageSize, setPageSize] = useState<number | "all">(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchId, setSearchId] = useState("");
  const [filterAgreement, setFilterAgreement] = useState<"all" | "disagree" | "perfect">("all");
  const [editingLabels, setEditingLabels] = useState<Record<number, ClassLabel>>({});
  const [revisionReason, setRevisionReason] = useState("");
  const [batchResult, setBatchResult] = useState<{ changedCount: number; submissionCount: number; version: string } | null>(null);

  const predictionsList = useMemo(() => submissions.map((s) => s.predictions), [submissions]);

  const enrichedItems = useMemo(() => {
    return dataset
      .map((item) => ({
        ...item,
        agreement: computeItemAgreement(item.id, item.groundTruthLabel, predictionsList),
      }))
      .filter((item) => {
        if (searchId && !String(item.id).includes(searchId)) return false;
        if (filterAgreement === "disagree" && item.agreement === 100) return false;
        if (filterAgreement === "perfect" && item.agreement < 100) return false;
        return true;
      })
      .sort((a, b) => a.agreement - b.agreement || a.id - b.id);
  }, [dataset, predictionsList, searchId, filterAgreement]);

  const displayedCount = pageSize === "all" ? enrichedItems.length : pageSize;
  const totalPages = pageSize === "all" ? 1 : Math.max(1, Math.ceil(enrichedItems.length / (pageSize as number)));
  const paginatedItems =
    pageSize === "all"
      ? enrichedItems
      : enrichedItems.slice((currentPage - 1) * (pageSize as number), currentPage * (pageSize as number));

  const pendingCount = Object.keys(editingLabels).length;

  const handleStageLabelChange = (itemId: number, newLabel: ClassLabel) => {
    const original = dataset.find((d) => d.id === itemId);
    if (original && original.groundTruthLabel === newLabel) {
      const next = { ...editingLabels };
      delete next[itemId];
      setEditingLabels(next);
    } else {
      setEditingLabels({ ...editingLabels, [itemId]: newLabel });
    }
  };

  const handleSubmitBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingCount === 0) return;
    const reason = revisionReason.trim() || `Revisi manual GT sebanyak ${pendingCount} sampel`;
    const changedCount = updateGroundTruthBatch(editingLabels, reason);
    setBatchResult({ changedCount, submissionCount: submissions.length, version: activeGtVersion });
    setEditingLabels({});
    setRevisionReason("");
  };

  const getAgreementBg = (agr: number) =>
    agr === 100 ? { bg: "#f0fdf4", color: "#16a34a" } :
    agr >= 70   ? { bg: "#fffbeb", color: "#d97706" } :
                  { bg: "#fef2f2", color: "#dc2626" };

  const filterBtns = [
    { key: "all", label: "Semua Data", activeColor: "#162040" },
    { key: "disagree", label: "Ambigu (< 100%)", activeColor: "#d97706" },
    { key: "perfect", label: "Konsisten (100%)", activeColor: "#16a34a" },
  ] as const;

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#0f1b35", letterSpacing: "-0.4px" }}>
            Analisis & Kalibrasi Ground Truth
          </h1>
          <p style={{ fontSize: "12.5px", color: "#94a3b8", marginTop: "4px" }}>
            Periksa konsistensi prediksi model terhadap GT dan ajukan koreksi label secara batch
          </p>
        </div>
        <Link
          href="/analysis/deep"
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "9px 16px", borderRadius: "9px",
            background: "#162040", color: "#fff",
            fontSize: "12px", fontWeight: 700, textDecoration: "none",
          }}
        >
          Analisis Mendalam
          <ArrowRight style={{ width: "14px", height: "14px" }} />
        </Link>
      </div>

      {/* Success batch result */}
      {batchResult && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "10px",
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          borderRadius: "10px", padding: "14px 16px",
        }}>
          <CheckCircle2 style={{ width: "16px", height: "16px", color: "#16a34a", flexShrink: 0, marginTop: "1px" }} />
          <div>
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#15803d" }}>
              Ground Truth Berhasil Diperbarui
            </div>
            <div style={{ fontSize: "11.5px", color: "#16a34a", marginTop: "3px" }}>
              <strong>{batchResult.changedCount}</strong> sampel diubah. Seluruh <strong>{batchResult.submissionCount}</strong> submission dievaluasi ulang secara otomatis.
            </div>
          </div>
        </div>
      )}

      {/* Filter toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "13px", height: "13px", color: "#94a3b8" }} />
            <input
              type="text"
              value={searchId}
              onChange={(e) => { setSearchId(e.target.value); setCurrentPage(1); }}
              placeholder="Cari ID Gambar..."
              style={{ border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "7px 12px 7px 30px", fontSize: "12px", color: "#0f1b35", outline: "none", width: "180px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", padding: "3px", borderRadius: "8px" }}>
            {filterBtns.map(({ key, label, activeColor }) => (
              <button
                key={key}
                type="button"
                onClick={() => { setFilterAgreement(key); setCurrentPage(1); }}
                style={{
                  padding: "5px 10px", borderRadius: "6px",
                  fontSize: "11.5px", fontWeight: 700, cursor: "pointer", border: "none",
                  background: filterAgreement === key ? activeColor : "transparent",
                  color: filterAgreement === key ? "#fff" : "#64748b",
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Baris per halaman:</span>
          {[10, 50, 100, "all"].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => { setPageSize(size as number | "all"); setCurrentPage(1); }}
              style={{
                padding: "4px 9px", borderRadius: "6px",
                border: pageSize === size ? "none" : "1px solid #e2e8f0",
                background: pageSize === size ? "#162040" : "#f8fafc",
                color: pageSize === size ? "#fff" : "#64748b",
                fontSize: "11.5px", fontWeight: 700, cursor: "pointer",
              }}
            >
              {size === "all" ? "Semua" : size}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="nk-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="nk-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>ID</th>
                <th>Ground Truth (Pilih Baru)</th>
                {submissions.map((sub) => (
                  <th key={sub.id} style={{ color: "#1d4ed8" }}>{sub.name}</th>
                ))}
                <th style={{ textAlign: "right" }}>Agreement</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={4 + submissions.length} style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "12px" }}>
                    {dataset.length === 0 ? "Belum ada dataset. Unggah Ground Truth terlebih dahulu." : "Tidak ada item sesuai filter."}
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const currentLabel = editingLabels[item.id] || item.groundTruthLabel;
                  const isModified = currentLabel !== item.groundTruthLabel;
                  const agr = getAgreementBg(item.agreement);
                  return (
                    <tr key={item.id} style={{ background: isModified ? "#fffbeb" : undefined }}>
                      <td>
                        <ItemThumbnail id={item.id} imageNumber={item.imageNumber} label={item.groundTruthLabel} size="sm" />
                      </td>
                      <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#0f1b35" }}>#{item.id}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <select
                            value={currentLabel}
                            onChange={(e) => handleStageLabelChange(item.id, e.target.value as ClassLabel)}
                            style={{
                              padding: "5px 8px", borderRadius: "7px",
                              border: isModified ? "1.5px solid #d97706" : "1.5px solid #e2e8f0",
                              background: isModified ? "#fffbeb" : "#f8fafc",
                              fontSize: "11.5px", fontWeight: 600, color: "#0f1b35",
                              cursor: "pointer", outline: "none",
                            }}
                          >
                            <option value="Recyclable">Recyclable (0)</option>
                            <option value="Electronic">Electronic (1)</option>
                            <option value="Organic">Organic (2)</option>
                          </select>
                          {isModified && (
                            <span style={{
                              fontSize: "10px", fontWeight: 700, color: "#d97706",
                              background: "#fffbeb", border: "1px solid #fde68a",
                              borderRadius: "5px", padding: "2px 7px",
                            }}>
                              Direvisi
                            </span>
                          )}
                        </div>
                      </td>
                      {submissions.map((sub) => {
                        const pred = sub.predictions[item.id] || "Recyclable";
                        const matches = pred === item.groundTruthLabel;
                        return (
                          <td key={sub.id} style={{
                            fontWeight: matches ? 500 : 700,
                            color: matches ? "#475569" : "#dc2626",
                            background: matches ? undefined : "#fef2f2",
                          }}>
                            {pred}
                          </td>
                        );
                      })}
                      <td style={{ textAlign: "right" }}>
                        <span style={{
                          display: "inline-block", padding: "3px 9px",
                          borderRadius: "7px", fontSize: "11.5px", fontWeight: 800,
                          fontFamily: "monospace",
                          background: agr.bg, color: agr.color,
                        }}>
                          {item.agreement}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pageSize !== "all" && totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
          <span style={{ color: "#64748b" }}>
            Halaman <strong style={{ color: "#0f1b35" }}>{currentPage}</strong> dari {totalPages}
          </span>
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{ padding: "6px 12px", borderRadius: "7px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "12px", fontWeight: 600, cursor: currentPage <= 1 ? "not-allowed" : "pointer", opacity: currentPage <= 1 ? 0.4 : 1, color: "#475569" }}
            >
              Sebelumnya
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{ padding: "6px 12px", borderRadius: "7px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "12px", fontWeight: 600, cursor: currentPage >= totalPages ? "not-allowed" : "pointer", opacity: currentPage >= totalPages ? 0.4 : 1, color: "#475569" }}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {/* Batch Commit Panel */}
      <div className="nk-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "14px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Database style={{ width: "17px", height: "17px", color: "#1d4ed8" }} />
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f1b35" }}>Submit Perubahan Ground Truth</div>
              <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>
                Perubahan diakumulasikan dan menghitung ulang performa seluruh submission
              </div>
            </div>
          </div>
          <span style={{
            padding: "4px 12px", borderRadius: "20px", fontSize: "11.5px", fontWeight: 700,
            background: pendingCount > 0 ? "#fffbeb" : "#f1f5f9",
            color: pendingCount > 0 ? "#d97706" : "#94a3b8",
            border: pendingCount > 0 ? "1px solid #fde68a" : "1px solid #e2e8f0",
          }}>
            {pendingCount} Sampel Diubah
          </span>
        </div>

        <form onSubmit={handleSubmitBatch} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "5px" }}>
              Deskripsi / Alasan Revisi
            </label>
            <input
              type="text"
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="Contoh: Koreksi label pada ID #12 dan #45 berdasarkan pengecekan ulang gambar..."
              disabled={pendingCount === 0}
              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", padding: "8px 12px", fontSize: "12px", color: "#0f1b35", outline: "none", opacity: pendingCount === 0 ? 0.5 : 1 }}
            />
          </div>

          {pendingCount > 0 && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "10px 14px", fontSize: "11.5px", color: "#92400e" }}>
              <strong>ID yang akan diubah:</strong>{" "}
              {Object.entries(editingLabels).map(([id, label]) => `#${id} → ${label}`).join(", ")}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setEditingLabels({})}
              disabled={pendingCount === 0}
              style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "8px 16px", borderRadius: "8px",
                border: "1px solid #e2e8f0", background: "#f8fafc",
                fontSize: "12px", fontWeight: 600, color: "#475569",
                cursor: pendingCount === 0 ? "not-allowed" : "pointer",
                opacity: pendingCount === 0 ? 0.5 : 1,
              }}
            >
              <RotateCcw style={{ width: "13px", height: "13px" }} />
              Batal
            </button>
            <button
              type="submit"
              disabled={pendingCount === 0}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "8px 20px", borderRadius: "8px",
                background: pendingCount === 0 ? "#94a3b8" : "#1d4ed8", border: "none",
                fontSize: "12px", fontWeight: 700, color: "#fff",
                cursor: pendingCount === 0 ? "not-allowed" : "pointer",
              }}
            >
              <Save style={{ width: "14px", height: "14px" }} />
              Submit ({pendingCount} Sampel) & Evaluasi Ulang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
