"use client";

import React, { useState } from "react";
import { ClassLabel, Submission } from "@/types";
import { useAppStore } from "@/lib/store";
import { mapNumericToClassLabel } from "@/lib/evaluator";
import { SubmissionComparisonModal } from "./SubmissionComparisonModal";
import { X, Upload, GitBranch, AlertCircle, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

interface UploadSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadSubmissionModal: React.FC<UploadSubmissionModalProps> = ({ isOpen, onClose }) => {
  const { addSubmission, currentUser, submissions, dataset } = useAppStore();

  const [experimentType, setExperimentType] = useState<"baseline" | "revision">("baseline");
  const [parentId, setParentId] = useState<string>("");
  const [reasonOfRevision, setReasonOfRevision] = useState<string>("");
  const [name, setName] = useState(`submission_${submissions.length + 1}`);
  const [modelName, setModelName] = useState("");
  const [strategyDescription, setStrategyDescription] = useState("");
  const [validationMacroF1, setValidationMacroF1] = useState("90.0");
  const [predictions, setPredictions] = useState<Record<number, ClassLabel>>({});
  const [csvFileName, setCsvFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadInfo, setUploadInfo] = useState<{ totalIds: number; totalLabels: number } | null>(null);

  const [comparisonNewSub, setComparisonNewSub] = useState<Submission | null>(null);
  const [comparisonPrevBest, setComparisonPrevBest] = useState<Submission | null>(null);
  const [comparisonParentSub, setComparisonParentSub] = useState<Submission | null>(null);

  if (!isOpen && !comparisonNewSub) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage("");
    setUploadInfo(null);
    setCsvFileName(file.name);

    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const parsed: Record<number, ClassLabel> = {};
    const emptyRows: number[] = [];

    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(/[,;\t]/);
      if (parts.length >= 2) {
        const idStr = parts[0].trim().replace(/['"]/g, "");
        const labelStr = parts[1].trim().replace(/['"]/g, "");
        const id = parseInt(idStr, 10);

        if (isNaN(id)) continue;

        // Validasi baris kosong / label kosong
        if (!labelStr || labelStr === "") {
          emptyRows.push(id);
          continue;
        }

        parsed[id] = mapNumericToClassLabel(labelStr);
      }
    }

    if (emptyRows.length > 0) {
      setErrorMessage(
        `Ditemukan ${emptyRows.length} baris tanpa label pada ID: ${emptyRows.slice(0, 10).map((id) => `#${id}`).join(", ")}${emptyRows.length > 10 ? ` ...dan ${emptyRows.length - 10} lainnya` : ""}. Perbaiki file CSV terlebih dahulu.`
      );
      setPredictions({});
      setUploadInfo(null);
      return;
    }

    if (Object.keys(parsed).length === 0) {
      setErrorMessage("Gagal membaca CSV. Pastikan format kolom id,predicted berisi angka 0, 1, atau 2.");
      return;
    }

    const totalIds = Object.keys(parsed).length;
    const totalLabels = Object.values(parsed).filter((v) => v !== undefined && v !== null).length;
    setPredictions(parsed);
    setUploadInfo({ totalIds, totalLabels });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim() || !modelName.trim()) {
      setErrorMessage("Nama Submission dan Arsitektur Model wajib diisi.");
      return;
    }
    if (experimentType === "revision" && !parentId) {
      setErrorMessage("Silakan pilih Parent Experiment yang direvisi.");
      return;
    }
    if (experimentType === "revision" && !reasonOfRevision.trim()) {
      setErrorMessage("Alasan revisi wajib diisi untuk dokumentasi eksperimen.");
      return;
    }
    if (Object.keys(predictions).length === 0) {
      setErrorMessage("Silakan unggah file CSV prediksi terlebih dahulu.");
      return;
    }

    const prevBest = submissions.length > 0 ? submissions[0] : null;
    const parentSub =
      experimentType === "revision" && parentId
        ? submissions.find((s) => s.id === parentId) || null
        : null;

    const valScore = parseFloat(validationMacroF1) / 100;
    const authorName = currentUser ? currentUser.leaderboardName : "Rijal";

    const newSub = addSubmission({
      name: name.trim(),
      leaderboardName: authorName,
      modelName: modelName.trim(),
      strategyDescription: strategyDescription.trim() || "Eksperimen model kustom",
      validationMacroF1: isNaN(valScore) ? 0.9 : valScore,
      predictions,
      parentId: experimentType === "revision" ? parentId : null,
      reasonOfRevision: experimentType === "revision" ? reasonOfRevision.trim() : "Baseline baru",
    });

    try { confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } }); } catch { /* ignore */ }

    setComparisonPrevBest(prevBest);
    setComparisonParentSub(parentSub);
    setComparisonNewSub(newSub);
  };

  if (comparisonNewSub) {
    return (
      <SubmissionComparisonModal
        isOpen={true}
        onClose={() => { setComparisonNewSub(null); onClose(); }}
        newSubmission={comparisonNewSub}
        previousBestSubmission={comparisonPrevBest}
        parentSubmission={comparisonParentSub}
        dataset={dataset}
      />
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", borderRadius: "8px",
    border: "1.5px solid #e2e8f0", background: "#f8fafc",
    padding: "8px 12px", fontSize: "12px",
    fontFamily: "inherit", color: "#0f1b35",
    outline: "none", transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "11px", fontWeight: 700,
    color: "#475569", textTransform: "uppercase",
    letterSpacing: "0.04em", marginBottom: "5px",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(15,27,53,0.55)", backdropFilter: "blur(4px)", padding: "16px",
    }}>
      <div style={{
        width: "100%", maxWidth: "560px", maxHeight: "92vh", overflowY: "auto",
        background: "#fff", borderRadius: "16px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 20px 60px rgba(15,27,53,0.15)",
      }}>
        {/* Modal Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid #f1f5f9",
        }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f1b35" }}>
              Unggah Submission Eksperimen
            </h3>
            <p style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>
              Pengirim: <strong style={{ color: "#1d4ed8" }}>{currentUser?.leaderboardName || "Rijal"}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "32px", height: "32px", borderRadius: "8px",
              border: "1px solid #e2e8f0", background: "#f8fafc",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X style={{ width: "15px", height: "15px", color: "#94a3b8" }} />
          </button>
        </div>

        {/* Error */}
        {errorMessage && (
          <div style={{
            margin: "16px 24px 0",
            display: "flex", alignItems: "flex-start", gap: "8px",
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: "8px", padding: "10px 12px",
          }}>
            <AlertCircle style={{ width: "14px", height: "14px", color: "#dc2626", flexShrink: 0, marginTop: "1px" }} />
            <span style={{ fontSize: "11.5px", color: "#991b1b", lineHeight: 1.5 }}>{errorMessage}</span>
          </div>
        )}

        {/* Upload success info */}
        {uploadInfo && (
          <div style={{
            margin: "12px 24px 0",
            display: "flex", alignItems: "center", gap: "8px",
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: "8px", padding: "10px 12px",
          }}>
            <CheckCircle2 style={{ width: "14px", height: "14px", color: "#16a34a", flexShrink: 0 }} />
            <span style={{ fontSize: "11.5px", color: "#15803d", fontWeight: 600 }}>
              Berhasil terbaca: <strong>{uploadInfo.totalIds} ID gambar</strong> dengan <strong>{uploadInfo.totalLabels} label prediksi</strong>.
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Tipe Eksperimen */}
          <div>
            <label style={labelStyle}>Tipe Eksperimen</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { val: "baseline", label: "Baseline Baru" },
                { val: "revision", label: "Revisi Submission", icon: GitBranch },
              ].map(({ val, label, icon: Icon }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setExperimentType(val as "baseline" | "revision")}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    padding: "10px", borderRadius: "8px",
                    border: experimentType === val ? "2px solid #1d4ed8" : "1.5px solid #e2e8f0",
                    background: experimentType === val ? "#eff6ff" : "#f8fafc",
                    fontSize: "12px", fontWeight: 700, cursor: "pointer",
                    color: experimentType === val ? "#1d4ed8" : "#475569",
                  }}
                >
                  {Icon && <Icon style={{ width: "13px", height: "13px" }} />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Revision fields */}
          {experimentType === "revision" && (
            <div style={{
              background: "#f8fafc", borderRadius: "10px",
              border: "1px solid #e2e8f0", padding: "14px",
              display: "flex", flexDirection: "column", gap: "10px",
            }}>
              <div>
                <label style={labelStyle}>Parent Experiment</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  style={inputStyle}
                  required={experimentType === "revision"}
                >
                  <option value="">-- Pilih Submission Parent --</option>
                  {submissions.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      #{sub.rank} {sub.name} ({sub.modelName}) — F1: {(sub.testMacroF1 * 100).toFixed(2)}%
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Alasan Revisi</label>
                <input
                  type="text"
                  value={reasonOfRevision}
                  onChange={(e) => setReasonOfRevision(e.target.value)}
                  placeholder="Contoh: Menambahkan TTA karena Recall Class 2 masih rendah"
                  style={inputStyle}
                  required={experimentType === "revision"}
                />
              </div>
            </div>
          )}

          {/* Name & Model */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Nama Submission</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="submission_1"
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Arsitektur Model</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="ConvNeXt V2 + CutMix"
                style={inputStyle}
                required
              />
            </div>
          </div>

          {/* Strategy */}
          <div>
            <label style={labelStyle}>Deskripsi Strategi & Augmentasi</label>
            <textarea
              value={strategyDescription}
              onChange={(e) => setStrategyDescription(e.target.value)}
              rows={2}
              placeholder="Jelaskan teknik preprocessing, lr schedule, loss function..."
              style={{ ...inputStyle, resize: "none" }}
            />
          </div>

          {/* Val F1 */}
          <div>
            <label style={labelStyle}>Macro F1 Validasi Internal (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={validationMacroF1}
              onChange={(e) => setValidationMacroF1(e.target.value)}
              placeholder="90.50"
              style={{ ...inputStyle, fontFamily: "monospace" }}
              required
            />
          </div>

          {/* CSV Upload */}
          <div>
            <label style={labelStyle}>File CSV Prediksi (id,predicted — kode 0, 1, 2)</label>
            <label style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              borderRadius: "8px", border: "2px dashed #cbd5e1",
              background: "#f8fafc", padding: "14px",
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "#eff6ff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc"; }}
            >
              <Upload style={{ width: "16px", height: "16px", color: "#1d4ed8" }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                {csvFileName ? csvFileName : "Pilih File CSV (id,predicted)"}
              </span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" style={{ display: "none" }} />
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "4px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 18px", borderRadius: "8px",
                border: "1px solid #e2e8f0", background: "#f8fafc",
                fontSize: "12px", fontWeight: 600, color: "#475569", cursor: "pointer",
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              style={{
                padding: "9px 20px", borderRadius: "8px",
                background: "#1d4ed8", border: "none",
                fontSize: "12px", fontWeight: 700, color: "#fff", cursor: "pointer",
              }}
            >
              Unggah & Evaluasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
