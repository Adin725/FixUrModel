"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Submission } from "@/types";
import { UploadSubmissionModal } from "@/components/submission/UploadSubmissionModal";
import { Trophy, Upload, Search, Filter, Target, Trash2, Award, Sparkles } from "lucide-react";

export default function LeaderboardPage() {
  const { submissions, setOfficialSubmission, deleteSubmission, activeGtVersion } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string>("ALL");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [confirmOfficialModalSub, setConfirmOfficialModalSub] = useState<Submission | null>(null);
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
      const matchTag = filterTag === "ALL" || (s.tags && s.tags.includes(filterTag));
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
    <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#EEF2FF",
              color: "#4F46E5",
              padding: "5px 12px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.05em",
              marginBottom: "10px",
            }}
          >
            <Sparkles style={{ width: "13px", height: "13px" }} />
            Peringkat &amp; Evaluasi Model
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#0f1b35", letterSpacing: "-0.6px" }}>
            Daftar Peringkat Eksperimen Model
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            Daftar seluruh model yang dievaluasi pada Ground Truth aktif <strong style={{ fontFamily: "monospace", color: "#2563eb" }}>{activeGtVersion}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#111836",
            color: "#ffffff",
            borderRadius: "9999px",
            padding: "12px 22px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            border: "none",
            boxShadow: "0 8px 20px rgba(17, 24, 54, 0.25)",
          }}
        >
          <Upload style={{ width: "16px", height: "16px" }} />
          <span>Unggah Submission Baru</span>
        </button>
      </div>

      {/* Filter Capsule Bar */}
      <div
        className="nk-card"
        style={{
          padding: "16px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "240px", maxWidth: "380px" }}>
          <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari submission, model arsitektur, atau peneliti..."
            className="nk-input"
            style={{ paddingLeft: "40px", borderRadius: "9999px" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginRight: "4px" }}>
            Filter Tag:
          </span>
          {["ALL", ...allTags].map((tag) => {
            const active = filterTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setFilterTag(tag)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: active ? 800 : 600,
                  border: active ? "1px solid #3b82f6" : "1px solid rgba(226, 232, 240, 0.8)",
                  background: active ? "#EFF6FF" : "#ffffff",
                  color: active ? "#1d4ed8" : "#64748b",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {tag === "ALL" ? "Semua Tag" : tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="nk-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="nk-table">
            <thead>
              <tr>
                <th style={{ width: "70px", textAlign: "center" }}>Peringkat</th>
                <th>Nama Eksperimen &amp; Model</th>
                <th>Pengunggah</th>
                <th style={{ textAlign: "right" }}>Skor Validasi</th>
                <th style={{ textAlign: "right" }}>Skor Pengujian</th>
                <th style={{ textAlign: "right" }}>Selisih Skor</th>
                <th style={{ textAlign: "center" }}>Status Resmi</th>
                <th style={{ width: "130px", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "64px", color: "#94a3b8" }}>
                    Belum ada submission yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub, idx) => {
                  const gapColor =
                    sub.generalizationGap >= 0
                      ? "#059669"
                      : sub.generalizationGap >= -0.03
                      ? "#d97706"
                      : "#ef4444";
                  return (
                    <tr key={sub.id}>
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "32px",
                            height: "32px",
                            borderRadius: "10px",
                            background: idx < 3 ? "#EEF2FF" : "#F8FAFC",
                            color: idx < 3 ? "#1d4ed8" : "#64748b",
                            fontWeight: 900,
                            fontSize: "13px",
                          }}
                        >
                          #{idx + 1}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: "#0f1b35", fontSize: "14px" }}>
                          {sub.name}
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                          Model: <strong>{sub.modelName}</strong>
                          {sub.tags && sub.tags.length > 0 && (
                            <span style={{ marginLeft: "8px" }}>
                              {sub.tags.map((t) => (
                                <span
                                  key={t}
                                  style={{
                                    display: "inline-block",
                                    padding: "2px 8px",
                                    borderRadius: "9999px",
                                    background: "#f1f5f9",
                                    color: "#475569",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    marginRight: "4px",
                                  }}
                                >
                                  {t}
                                </span>
                              ))}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: "#334155" }}>{sub.leaderboardName}</td>
                      <td style={{ textAlign: "right", fontFamily: "monospace", color: "#64748b" }}>
                        {(sub.validationMacroF1 * 100).toFixed(2)}%
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontFamily: "monospace",
                          fontWeight: 900,
                          color: "#059669",
                          fontSize: "15px",
                        }}
                      >
                        {(sub.testMacroF1 * 100).toFixed(2)}%
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "9999px",
                            fontSize: "11.5px",
                            fontWeight: 800,
                            fontFamily: "monospace",
                            background: gapColor + "15",
                            color: gapColor,
                          }}
                        >
                          {sub.generalizationGap > 0 ? "+" : ""}
                          {(sub.generalizationGap * 100).toFixed(2)}%
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {sub.isOfficial ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              background: "#EFF6FF",
                              color: "#2563eb",
                              padding: "4px 10px",
                              borderRadius: "9999px",
                              fontSize: "11px",
                              fontWeight: 800,
                            }}
                          >
                            <Target style={{ width: "12px", height: "12px" }} />
                            SLOT #{sub.officialSlot || 1}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "11px" }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={() => setConfirmOfficialModalSub(sub)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              background: "#EEF2FF",
                              color: "#2563eb",
                              border: "none",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                            title="Jadikan Official Submission"
                          >
                            Official
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSubmission(sub.id)}
                            style={{
                              padding: "6px",
                              borderRadius: "8px",
                              background: "#FEF2F2",
                              color: "#EF4444",
                              border: "none",
                              cursor: "pointer",
                            }}
                            title="Hapus Submission"
                          >
                            <Trash2 style={{ width: "14px", height: "14px" }} />
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

      <UploadSubmissionModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

      {/* Modal Slot Calibration */}
      {confirmOfficialModalSub && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15,27,53,0.55)",
            backdropFilter: "blur(6px)",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#fff",
              borderRadius: "24px",
              padding: "28px",
              boxShadow: "0 25px 60px rgba(15,27,53,0.18)",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#0f1b35" }}>
              Pilih Slot Calibration Official
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px", marginBottom: "18px" }}>
              Tentukan slot resmi untuk model &quot;{confirmOfficialModalSub.name}&quot;.
            </p>

            <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
              {[1, 2, 3].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot as 1 | 2 | 3)}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "14px",
                    border: selectedSlot === slot ? "2px solid #2563eb" : "1px solid #e2e8f0",
                    background: selectedSlot === slot ? "#EFF6FF" : "#ffffff",
                    fontWeight: 800,
                    color: selectedSlot === slot ? "#2563eb" : "#475569",
                    cursor: "pointer",
                  }}
                >
                  Slot #{slot}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setConfirmOfficialModalSub(null)}
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  borderRadius: "12px",
                  padding: "10px 18px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmOfficial}
                style={{
                  background: "#111836",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "10px 18px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
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
