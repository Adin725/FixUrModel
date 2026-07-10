"use client";

import React, { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from "recharts";
import { TrendingUp, User } from "lucide-react";

export default function ProgressionPage() {
  const { submissions, users } = useAppStore();
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");

  const filteredSubmissions = useMemo(() => {
    let list = [...submissions];
    if (selectedAuthor !== "all") list = list.filter((s) => s.leaderboardName === selectedAuthor);
    list.sort((a, b) => {
      const idxA = parseInt(a.name.replace(/\D/g, "") || "1", 10);
      const idxB = parseInt(b.name.replace(/\D/g, "") || "1", 10);
      return idxA - idxB;
    });
    return list;
  }, [submissions, selectedAuthor]);

  const chartData = useMemo(() => filteredSubmissions.map((sub) => ({
    name: sub.name,
    "F1 Validasi (%)": Number((sub.validationMacroF1 * 100).toFixed(2)),
    "F1 Test (%)": Number((sub.testMacroF1 * 100).toFixed(2)),
    "Gen. Gap (%)": Number((sub.generalizationGap * 100).toFixed(2)),
  })), [filteredSubmissions]);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: "8px", padding: "4px 10px",
            fontSize: "10.5px", fontWeight: 700, color: "#16a34a", marginBottom: "8px",
          }}>
            <TrendingUp style={{ width: "12px", height: "12px" }} />
            Chronological Performance Analysis
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#0f1b35", letterSpacing: "-0.4px" }}>
            Perkembangan Performa Eksperimen
          </h1>
          <p style={{ fontSize: "12.5px", color: "#94a3b8", marginTop: "4px" }}>
            Grafik trajektori Macro F1 Validasi vs Test dan Generalization Gap
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <User style={{ width: "14px", height: "14px", color: "#94a3b8" }} />
          <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#475569" }}>Filter:</span>
          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            style={{
              border: "1.5px solid #e2e8f0", borderRadius: "8px",
              background: "#fff", padding: "7px 12px",
              fontSize: "12px", color: "#0f1b35", outline: "none", cursor: "pointer",
            }}
          >
            <option value="all">Semua Anggota</option>
            {users.map((u) => (
              <option key={u.id} value={u.leaderboardName}>
                {u.leaderboardName} ({u.fullName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart Card */}
      <div className="nk-card" style={{ padding: "24px" }}>
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 800, color: "#0f1b35" }}>
            Grafik Perkembangan Model ({filteredSubmissions.length} Eksperimen)
          </h2>
          <p style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "3px" }}>
            Perbandingan F1 Validasi vs Test dan fluktuasi Generalization Gap antar submission
          </p>
        </div>

        {chartData.length === 0 ? (
          <div style={{ height: "280px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "13px" }}>
            Belum ada data submission untuk ditampilkan.
          </div>
        ) : (
          <div style={{ height: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px", background: "#fff" }}
                />
                <Legend wrapperStyle={{ fontSize: "11.5px", paddingTop: "12px" }} />
                <Line type="monotone" dataKey="F1 Validasi (%)" stroke="#1d4ed8" strokeWidth={2.5} dot={{ r: 4, fill: "#1d4ed8" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="F1 Test (%)" stroke="#059669" strokeWidth={2.5} dot={{ r: 4, fill: "#059669" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Gen. Gap (%)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="nk-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#0f1b35" }}>Rincian Perkembangan Eksperimen</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="nk-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Submission</th>
                <th>Author</th>
                <th>Arsitektur Model</th>
                <th style={{ textAlign: "right" }}>F1 Validasi</th>
                <th style={{ textAlign: "right" }}>F1 Test</th>
                <th style={{ textAlign: "right" }}>Gen. Gap</th>
                <th>Waktu Upload</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                    Belum ada submission.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub, idx) => {
                  const gap = sub.generalizationGap;
                  const gapColor = gap >= 0 ? "#059669" : gap >= -0.03 ? "#d97706" : "#dc2626";
                  return (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 700, color: "#94a3b8" }}>#{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: "#1d4ed8" }}>{sub.name}</td>
                      <td style={{ color: "#475569" }}>{sub.leaderboardName}</td>
                      <td style={{ color: "#64748b", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub.modelName}</td>
                      <td style={{ textAlign: "right", fontFamily: "monospace", color: "#64748b" }}>
                        {(sub.validationMacroF1 * 100).toFixed(2)}%
                      </td>
                      <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 800, color: "#059669" }}>
                        {(sub.testMacroF1 * 100).toFixed(2)}%
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span style={{
                          display: "inline-block", padding: "2px 8px",
                          borderRadius: "6px", fontSize: "11px", fontWeight: 700,
                          fontFamily: "monospace",
                          background: gapColor + "15", color: gapColor,
                        }}>
                          {gap > 0 ? "+" : ""}{(gap * 100).toFixed(2)}%
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: "10.5px", color: "#94a3b8" }}>
                        {sub.uploadTimestampWIB}
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
  );
}
