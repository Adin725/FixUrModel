"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { GroundTruthHistory } from "@/types";
import { History, Database, ArrowLeft, User, Activity, CheckCircle2, X } from "lucide-react";

export default function GroundTruthHistoryPage() {
  const { gtHistory, activeGtVersion, switchActiveGtVersion } = useAppStore();
  const [selectedImpactRec, setSelectedImpactRec] = useState<GroundTruthHistory | null>(null);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <Link
            href="/ground-truth"
            style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              fontSize: "11.5px", fontWeight: 700, color: "#1d4ed8",
              textDecoration: "none", marginBottom: "8px",
            }}
          >
            <ArrowLeft style={{ width: "13px", height: "13px" }} />
            Kembali ke Persiapan GT
          </Link>
          <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#0f1b35", letterSpacing: "-0.4px" }}>
            Audit Trail Ground Truth
          </h1>
          <p style={{ fontSize: "12.5px", color: "#94a3b8", marginTop: "4px" }}>
            Riwayat perubahan dan manajemen versi aktif Ground Truth
          </p>
        </div>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "#eff6ff", border: "1px solid #bfdbfe",
          borderRadius: "10px", padding: "10px 14px",
        }}>
          <Database style={{ width: "15px", height: "15px", color: "#1d4ed8" }} />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e40af" }}>
            GT Aktif:{" "}
            <strong style={{ fontFamily: "monospace" }}>{activeGtVersion}</strong>
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="nk-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="nk-table">
            <thead>
              <tr>
                <th>Versi</th>
                <th>Tanggal & Waktu WIB</th>
                <th>Pengubah</th>
                <th>Jumlah Berubah</th>
                <th>Alasan Perubahan</th>
                <th style={{ textAlign: "center" }}>Status Aktif</th>
                <th style={{ textAlign: "right" }}>Aksi Audit</th>
              </tr>
            </thead>
            <tbody>
              {gtHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "12px" }}>
                    Belum ada riwayat perubahan Ground Truth.
                  </td>
                </tr>
              ) : (
                gtHistory.map((rec) => {
                  const isActive = rec.version === activeGtVersion;
                  return (
                    <tr key={`${rec.version}-${rec.dateWIB}`} style={{ background: isActive ? "#f0f9ff" : undefined }}>
                      <td style={{ fontWeight: 800, color: "#1d4ed8", fontFamily: "monospace" }}>
                        {rec.version}
                      </td>
                      <td style={{ fontFamily: "monospace", color: "#64748b", fontSize: "11px" }}>
                        {rec.dateWIB} — {rec.timeWIB}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <User style={{ width: "12px", height: "12px", color: "#1d4ed8" }} />
                          <span style={{ fontWeight: 600, color: "#0f1b35" }}>{rec.changedByLeaderboardName}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f1b35" }}>
                        {rec.changedCount} label
                      </td>
                      <td style={{ color: "#475569", maxWidth: "280px" }}>
                        {rec.reason}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {isActive ? (
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            background: "#f0fdf4", border: "1px solid #bbf7d0",
                            borderRadius: "7px", padding: "4px 10px",
                            fontSize: "10.5px", fontWeight: 700, color: "#16a34a",
                          }}>
                            <CheckCircle2 style={{ width: "12px", height: "12px" }} />
                            GT Aktif
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => switchActiveGtVersion(rec.version)}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: "4px",
                              padding: "4px 10px", borderRadius: "7px",
                              border: "1px solid #bfdbfe", background: "#eff6ff",
                              fontSize: "10.5px", fontWeight: 700, color: "#1d4ed8", cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            Jadikan Aktif
                          </button>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedImpactRec(rec)}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "5px 12px", borderRadius: "8px",
                            border: "1px solid #e2e8f0", background: "#f8fafc",
                            fontSize: "11.5px", fontWeight: 700, color: "#475569", cursor: "pointer",
                          }}
                        >
                          <Activity style={{ width: "12px", height: "12px", color: "#1d4ed8" }} />
                          Lihat Dampak
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Impact Modal */}
      {selectedImpactRec && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(15,27,53,0.55)", backdropFilter: "blur(4px)", padding: "16px",
        }}>
          <div style={{
            width: "100%", maxWidth: "700px", maxHeight: "88vh", overflowY: "auto",
            background: "#fff", borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 60px rgba(15,27,53,0.18)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "20px 24px", borderBottom: "1px solid #f1f5f9",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Activity style={{ width: "18px", height: "18px", color: "#1d4ed8" }} />
                </div>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#1d4ed8", marginBottom: "2px" }}>
                    Impact Analysis
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f1b35" }}>
                    Dampak Evaluasi Ulang — Versi {selectedImpactRec.version}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImpactRec(null)}
                style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <X style={{ width: "15px", height: "15px", color: "#94a3b8" }} />
              </button>
            </div>

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "12px 16px", fontSize: "12px", color: "#475569" }}>
                <strong style={{ color: "#0f1b35" }}>Waktu:</strong> {selectedImpactRec.dateWIB} ({selectedImpactRec.timeWIB}) — Oleh: <strong style={{ color: "#0f1b35" }}>{selectedImpactRec.changedByLeaderboardName}</strong>
                <br />
                <span style={{ fontStyle: "italic", marginTop: "4px", display: "block" }}>
                  "{selectedImpactRec.reason}"
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                  {
                    label: "Rata-Rata Macro F1",
                    val: selectedImpactRec.newAvgMacroF1 !== undefined
                      ? `${(selectedImpactRec.newAvgMacroF1 * 100).toFixed(2)}%`
                      : "Terindeks",
                    prev: selectedImpactRec.previousAvgMacroF1 !== undefined
                      ? `${(selectedImpactRec.previousAvgMacroF1 * 100).toFixed(2)}%`
                      : null,
                    sub: "Seluruh submission dihitung ulang",
                  },
                  {
                    label: "Submission Terpengaruh",
                    val: selectedImpactRec.maxScoreChangeSubmissionName || "Selaras Keseluruhan",
                    sub: selectedImpactRec.maxScoreChangeDelta !== undefined
                      ? `Delta: ${(selectedImpactRec.maxScoreChangeDelta * 100 >= 0 ? "+" : "")}${(selectedImpactRec.maxScoreChangeDelta * 100).toFixed(2)}%`
                      : "Skor terkoreksi",
                  },
                  {
                    label: "Perubahan Ranking",
                    val: selectedImpactRec.rankingChanged
                      ? `${selectedImpactRec.positionChangedCount || 1} Submission Bergeser`
                      : "Stabil",
                    sub: "Konsistensi posisi leaderboard",
                  },
                  {
                    label: "Stabilitas Official Submission",
                    val: selectedImpactRec.officialSubmissionPositionChanged
                      ? `Bergeser (#${selectedImpactRec.officialSubmissionOldRank} -> #${selectedImpactRec.officialSubmissionNewRank})`
                      : "Tetap di Posisi Semula",
                    sub: "Ketahanan model resmi",
                  },
                ].map((card, i) => (
                  <div key={i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8", marginBottom: "8px" }}>
                      {card.label}
                    </div>
                    {card.prev && (
                      <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#94a3b8", textDecoration: "line-through", marginBottom: "2px" }}>
                        {card.prev}
                      </div>
                    )}
                    <div style={{ fontSize: "16px", fontWeight: 900, color: "#0f1b35", lineHeight: 1.2 }}>
                      {card.val}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>{card.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setSelectedImpactRec(null)}
                  style={{ padding: "9px 20px", borderRadius: "8px", background: "#162040", border: "none", fontSize: "12px", fontWeight: 700, color: "#fff", cursor: "pointer" }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
