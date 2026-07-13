"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  RotateCcw,
  ShieldAlert,
  Download,
  Database,
  FlaskConical,
  Search,
} from "lucide-react";
import { downloadLeaderboardPDF } from "@/lib/pdfExport";

export const TopHeader: React.FC = () => {
  const { activeGtVersion, dataset, submissions, resetAllProcessToZero } =
    useAppStore();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleConfirmReset = () => {
    resetAllProcessToZero();
    setIsResetModalOpen(false);
  };

  return (
    <>
      <header
        style={{
          height: "80px",
          background: "rgba(244, 246, 252, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          position: "sticky",
          top: 0,
          zIndex: 30,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flex: 1,
            maxWidth: "480px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#ffffff",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              borderRadius: "9999px",
              padding: "8px 18px",
              width: "100%",
              boxShadow: "0 4px 14px rgba(18, 26, 68, 0.03)",
            }}
          >
            <Search
              style={{ width: "16px", height: "16px", color: "#64748b" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama eksperimen, model, atau anggota tim..."
              style={{
                border: "none",
                outline: "none",
                fontSize: "13px",
                fontWeight: 500,
                color: "#0f1b35",
                background: "transparent",
                width: "100%",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#ffffff",
              borderRadius: "9999px",
              padding: "7px 14px",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              boxShadow: "0 2px 8px rgba(18, 26, 68, 0.03)",
            }}
          >
            <Database
              style={{ width: "14px", height: "14px", color: "#2563eb" }}
            />
            <span
              style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}
            >
              GT:{" "}
              <strong style={{ color: "#2563eb", fontFamily: "monospace" }}>
                {activeGtVersion}
              </strong>
            </span>
            <span
              style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}
            >
              ({dataset.length} sampel)
            </span>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              background: "#ffffff",
              borderRadius: "9999px",
              padding: "7px 14px",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              boxShadow: "0 2px 8px rgba(18, 26, 68, 0.03)",
            }}
          >
            <FlaskConical
              style={{ width: "14px", height: "14px", color: "#10b981" }}
            />
            <span
              style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}
            >
              Run:{" "}
              <strong
                style={{ fontFamily: "monospace", color: "#0f1b35" }}
              >
                {submissions.length}
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              downloadLeaderboardPDF(
                submissions,
                activeGtVersion,
                dataset.length
              )
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#111836",
              color: "#ffffff",
              borderRadius: "9999px",
              padding: "9px 18px",
              fontSize: "12.5px",
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              boxShadow: "0 6px 16px rgba(17, 24, 54, 0.18)",
              transition: "all 0.2s ease",
            }}
            className="hover:bg-[#1e295d]"
          >
            <Download style={{ width: "14px", height: "14px" }} />
            <span>Export Laporan</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              background: "#ffffff",
              color: "#ef4444",
              borderRadius: "9999px",
              padding: "9px 16px",
              fontSize: "12.5px",
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid #fecaca",
              transition: "all 0.2s ease",
            }}
            className="hover:bg-[#fef2f2]"
          >
            <RotateCcw style={{ width: "14px", height: "14px" }} />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {isResetModalOpen && (
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
              maxWidth: "440px",
              background: "#fff",
              borderRadius: "24px",
              border: "1px solid #fecaca",
              boxShadow: "0 25px 60px rgba(15,27,53,0.18)",
              padding: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "16px",
                  background: "#fef2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldAlert
                  style={{ width: "24px", height: "24px", color: "#dc2626" }}
                />
              </div>
              <div>
                <h3
                  style={{ fontSize: "18px", fontWeight: 800, color: "#0f1b35" }}
                >
                  Konfirmasi Reset Platform
                </h3>
                <p style={{ fontSize: "12.5px", color: "#64748b" }}>
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <p
              style={{
                fontSize: "13px",
                color: "#475569",
                lineHeight: 1.6,
                marginBottom: "24px",
              }}
            >
              Anda akan mereset seluruh data submission eksperimen dan
              mengembalikan versi Ground Truth ke kondisi awal (0 sampel
              terindeks). Platform akan kembali bersih untuk putaran eksperimen
              baru.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
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
                onClick={handleConfirmReset}
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "10px 18px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Ya, Reset Seluruh Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
