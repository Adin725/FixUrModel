"use client";

import React from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { ValidationVsTestAnalysis } from "@/components/dashboard/ValidationVsTestAnalysis";
import {
  Trophy,
  Users,
  Database,
  Award,
  ArrowRight,
  TrendingUp,
  Activity,
  FileArchive,
  GitBranch,
  Sparkles,
  Layers,
  ArrowUpRight,
} from "lucide-react";

const BentoStatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  badgeGradient,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  icon: React.ElementType;
  badgeGradient: string;
}) => (
  <div
    className="nk-card nk-card-hover"
    style={{
      padding: "26px",
      display: "flex",
      alignItems: "center",
      gap: "20px",
    }}
  >
    <div
      style={{
        width: "64px",
        height: "64px",
        borderRadius: "20px",
        background: badgeGradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 10px 24px -6px rgba(15, 27, 53, 0.25)",
      }}
    >
      <Icon style={{ width: "26px", height: "26px", color: "#ffffff" }} />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#64748b",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "30px",
          fontWeight: 900,
          color: "#0f1b35",
          lineHeight: 1.1,
          fontFamily: "monospace",
          letterSpacing: "-0.8px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "#94a3b8",
          marginTop: "4px",
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {sub}
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { submissions, users, activeGtVersion, dataset, activityLogs } = useAppStore();

  const bestModel =
    submissions.length > 0
      ? submissions.reduce((best, curr) => (curr.testMacroF1 > best.testMacroF1 ? curr : best))
      : null;

  const topThree = [...submissions]
    .sort((a, b) => b.testMacroF1 - a.testMacroF1)
    .slice(0, 3);

  const topFive = [...submissions]
    .sort((a, b) => b.testMacroF1 - a.testMacroF1)
    .slice(0, 5);

  const badgeColors = [
    { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8", tag: "Blue Badge" },
    { bg: "#FDF2F8", border: "#FBCFE8", text: "#BE185D", tag: "Pink Badge" },
    { bg: "#FFF7ED", border: "#FED7AA", text: "#C2410C", tag: "Orange Badge" },
  ];

  return (
    <div
      style={{
        maxWidth: "1360px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
      }}
    >
      {/* Bento Storytelling Section 1: Welcome Banner & Primary Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
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
            AI RESEARCH EXPERIMENT PLATFORM
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#0f1b35", letterSpacing: "-0.6px" }}>
            Ekosistem Evaluasi &amp; Observasi Model CV
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            Pantau trajektori eksperimen, korelasi pseudo-test, dan stabilitas arsitektur secara mendalam.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link
            href="/lineage"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "11px 18px",
              borderRadius: "9999px",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              background: "#ffffff",
              fontSize: "13px",
              fontWeight: 700,
              color: "#1e293b",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(18, 26, 68, 0.03)",
            }}
            className="hover:border-blue-300"
          >
            <GitBranch style={{ width: "16px", height: "16px", color: "#2563eb" }} />
            <span>Lineage Tree</span>
          </Link>

          <Link
            href="/ground-truth"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "11px 22px",
              borderRadius: "9999px",
              background: "#111836",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 8px 20px rgba(17, 24, 54, 0.25)",
            }}
          >
            <FileArchive style={{ width: "16px", height: "16px" }} />
            <span>Unggah Dataset &amp; GT</span>
          </Link>
        </div>
      </div>

      {/* Bento Row 1: Four Stat Cards (Inspired exactly by Reference Screenshot 1) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "24px",
        }}
      >
        <BentoStatCard
          label="Total Submission"
          value={submissions.length}
          sub="Eksperimen model tersimpan"
          icon={Trophy}
          badgeGradient="linear-gradient(135deg, #111836 0%, #1e295d 100%)"
        />
        <BentoStatCard
          label="Anggota Tim"
          value={users.length}
          sub="Peneliti aktif AI Studio"
          icon={Users}
          badgeGradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
        />
        <BentoStatCard
          label="Ground Truth Versi"
          value={activeGtVersion}
          sub={`${dataset.length} sampel terindeks`}
          icon={Database}
          badgeGradient="linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)"
        />
        <BentoStatCard
          label="Model Terbaik"
          value={bestModel ? `${(bestModel.testMacroF1 * 100).toFixed(1)}%` : "—"}
          sub={bestModel ? bestModel.name : "Belum ada eksperimen"}
          icon={Award}
          badgeGradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
        />
      </div>

      {/* Bento Row 2: Analytical Core + Top Performers Showcase (Inspired by XFIT KIDS Top Performer) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "24px" }}>
        {/* Left Core Analysis (8 Cols on Desktop) */}
        <div style={{ gridColumn: "span 12 / span 12" }} className="xl:col-span-8">
          <ValidationVsTestAnalysis submissions={submissions} />
        </div>

        {/* Right Top Performers Bento Showcase (4 Cols on Desktop) */}
        <div
          style={{
            gridColumn: "span 12 / span 12",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
          className="xl:col-span-4"
        >
          <div
            className="nk-card"
            style={{
              padding: "26px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              height: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f1b35" }}>
                  Model Terbaik Teratas
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                  3 model dengan nilai evaluasi tertinggi
                </p>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#64748b",
                  background: "#f1f5f9",
                  padding: "5px 12px",
                  borderRadius: "9999px",
                }}
              >
                Teratas
              </span>
            </div>

            {topThree.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontSize: "13px",
                  padding: "40px 0",
                }}
              >
                Belum ada submission. Unggah model pertama Anda.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {topThree.map((sub, idx) => {
                  const badge = badgeColors[idx % badgeColors.length];
                  return (
                    <div
                      key={sub.id}
                      style={{
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        borderRadius: "18px",
                        padding: "16px 18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "14px",
                            background: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: 900,
                            color: badge.text,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
                          }}
                        >
                          #{idx + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f1b35" }}>
                            {sub.name}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                            {sub.modelName} &bull; oleh <strong>{sub.leaderboardName}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: 900,
                            fontFamily: "monospace",
                            color: badge.text,
                          }}
                        >
                          {(sub.testMacroF1 * 100).toFixed(2)}%
                        </div>
                        <span
                          style={{
                            display: "inline-block",
                            background: "#ffffff",
                            color: badge.text,
                            padding: "2px 8px",
                            borderRadius: "9999px",
                            fontSize: "9.5px",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            marginTop: "4px",
                          }}
                        >
                          {badge.tag}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bento Row 3: Leaderboard Preview + Quick Activity Feed */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "24px" }}>
        {/* Leaderboard Table Card */}
        <div style={{ gridColumn: "span 12 / span 12" }} className="xl:col-span-8">
          <div className="nk-card" style={{ overflow: "hidden" }}>
            <div
              style={{
                padding: "24px 28px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0f1b35" }}>
                  Daftar Peringkat Model
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                  Diurutkan berdasarkan skor pengujian tertinggi
                </p>
              </div>
              <Link
                href="/leaderboard"
                style={{
                  fontSize: "12.5px",
                  fontWeight: 700,
                  color: "#2563eb",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>Lihat Leaderboard Lengkap</span>
                <ArrowUpRight style={{ width: "15px", height: "15px" }} />
              </Link>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="nk-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Nama Submission</th>
                    <th>Peneliti</th>
                    <th>Arsitektur Model</th>
                    <th style={{ textAlign: "right" }}>Val F1</th>
                    <th style={{ textAlign: "right" }}>Test F1</th>
                    <th style={{ textAlign: "right" }}>Gen. Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {topFive.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                        Belum ada submission tersimpan. Silakan unggah model baru.
                      </td>
                    </tr>
                  ) : (
                    topFive.map((sub, idx) => {
                      const gapColor =
                        sub.generalizationGap >= 0
                          ? "#059669"
                          : sub.generalizationGap >= -0.03
                          ? "#d97706"
                          : "#ef4444";
                      return (
                        <tr key={sub.id}>
                          <td style={{ fontWeight: 800, color: "#64748b" }}>#{idx + 1}</td>
                          <td>
                            <div style={{ fontWeight: 800, color: "#1e293b" }}>{sub.name}</div>
                            {sub.isOfficial && (
                              <span
                                style={{
                                  display: "inline-block",
                                  marginTop: "3px",
                                  fontSize: "9.5px",
                                  fontWeight: 800,
                                  background: "#EFF6FF",
                                  color: "#2563eb",
                                  padding: "2px 8px",
                                  borderRadius: "9999px",
                                }}
                              >
                                OFFICIAL SLOT #{sub.officialSlot || 1}
                              </span>
                            )}
                          </td>
                          <td style={{ fontWeight: 600, color: "#475569" }}>
                            {sub.leaderboardName}
                          </td>
                          <td style={{ color: "#64748b" }}>{sub.modelName}</td>
                          <td style={{ textAlign: "right", fontFamily: "monospace", color: "#64748b" }}>
                            {(sub.validationMacroF1 * 100).toFixed(2)}%
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              fontFamily: "monospace",
                              fontWeight: 900,
                              color: "#059669",
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
                                fontSize: "11px",
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
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activity & Quick Launch Feed */}
        <div style={{ gridColumn: "span 12 / span 12" }} className="xl:col-span-4">
          <div
            className="nk-card"
            style={{
              padding: "26px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              height: "100%",
            }}
          >
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f1b35" }}>
                Aktivitas &amp; Log Terakhir
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                Riwayat pembaruan sistem dan dataset
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {activityLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  style={{
                    background: "#f8fafc",
                    borderRadius: "16px",
                    padding: "14px 16px",
                    border: "1px solid rgba(226, 232, 240, 0.7)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#0f1b35" }}>
                      {log.title}
                    </span>
                    <span style={{ fontSize: "10.5px", color: "#94a3b8", fontFamily: "monospace" }}>
                      {log.timestampWIB}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>
                    {log.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
