"use client";

import React from "react";
import { Submission } from "@/types";
import { TrendingUp, Activity, Award, AlertTriangle, Sparkles, BarChart2 } from "lucide-react";

interface ValidationVsTestAnalysisProps {
  submissions: Submission[];
}

export const ValidationVsTestAnalysis: React.FC<ValidationVsTestAnalysisProps> = ({ submissions }) => {
  if (submissions.length === 0) {
    return (
      <div className="nk-card" style={{ padding: "28px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f1b35", marginBottom: "6px" }}>
          Validation vs Pseudo Test Analysis
        </h3>
        <p style={{ fontSize: "13px", color: "#64748b" }}>
          Unggah minimal 1 submission untuk melihat analisis otomatis perbandingan skor Validasi Internal dan Pseudo Test.
        </p>
      </div>
    );
  }

  const avgTestF1 = submissions.reduce((acc, s) => acc + s.testMacroF1, 0) / submissions.length;
  const aboveAverageModels = submissions.filter((s) => s.testMacroF1 >= avgTestF1);
  const bestAboveAverageModel =
    aboveAverageModels.length > 0
      ? aboveAverageModels.reduce((best, curr) => (curr.testMacroF1 > best.testMacroF1 ? curr : best))
      : submissions[0];

  const gaps = submissions.map((s) => {
    const val = s.validationMacroF1 > 0 ? s.validationMacroF1 : s.testMacroF1;
    return {
      submission: s,
      valScore: val,
      testScore: s.testMacroF1,
      gapSigned: s.testMacroF1 - val,
      gapAbs: Math.abs(s.testMacroF1 - val),
    };
  });

  const avgGapAbs = gaps.reduce((acc, g) => acc + g.gapAbs, 0) / gaps.length;
  const smallestGapObj = gaps.reduce((min, curr) => (curr.gapAbs < min.gapAbs ? curr : min));
  const largestGapObj = gaps.reduce((max, curr) => (curr.gapAbs > max.gapAbs ? curr : max));

  let r = 0;
  if (gaps.length >= 2) {
    const meanVal = gaps.reduce((acc, g) => acc + g.valScore, 0) / gaps.length;
    const meanTest = gaps.reduce((acc, g) => acc + g.testScore, 0) / gaps.length;
    let num = 0,
      denVal = 0,
      denTest = 0;
    for (const g of gaps) {
      const dVal = g.valScore - meanVal;
      const dTest = g.testScore - meanTest;
      num += dVal * dTest;
      denVal += dVal * dVal;
      denTest += dTest * dTest;
    }
    const denom = Math.sqrt(denVal * denTest);
    if (denom > 0) r = num / denom;
  }

  const generateConclusion = () => {
    const avgGapPct = (avgGapAbs * 100).toFixed(1);
    if (gaps.length === 1) {
      const gPct = (gaps[0].gapSigned * 100).toFixed(1);
      return `Model "${gaps[0].submission.name}" memiliki selisih Generalization Gap sebesar ${gPct}%. Unggah model tambahan untuk mengevaluasi korelasi dan konsistensi generalisasi lintas arsitektur.`;
    }
    if (r > 0.6)
      return `Semakin tinggi skor Validation, semakin tinggi pula skor Pseudo Test (Korelasi kuat r = ${r.toFixed(2)}). Gap rata-rata hanya ${avgGapPct}%, menunjukkan model memiliki generalisasi yang sangat stabil terhadap Ground Truth.`;
    if (r > 0.2)
      return `Terdapat korelasi positif moderat (r = ${r.toFixed(2)}) antara Validation internal dan Pseudo Test. Gap rata-rata berada di angka ${avgGapPct}%, strategi augmentasi tim sudah cukup konsisten.`;
    if (r < -0.2)
      return `Korelasi negatif (r = ${r.toFixed(2)}) terdeteksi antara Validation dan Pseudo Test dengan rata-rata Gap ${avgGapPct}%. Ada indikasi over-optimism pada validasi internal yang perlu diinvestigasi.`;
    return `Korelasi antara Validation dan Pseudo Test netral (r = ${r.toFixed(2)}) dengan rata-rata Gap ${avgGapPct}%. Evaluasi kembali skema split validasi internal.`;
  };

  return (
    <div className="nk-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#2563eb",
                background: "#EFF6FF",
                padding: "4px 10px",
                borderRadius: "9999px",
                textTransform: "uppercase",
              }}
            >
              Realtime Correlation
            </span>
          </div>
          <h2 style={{ fontSize: "19px", fontWeight: 900, color: "#0f1b35" }}>
            Perbandingan Skor Validasi vs Pengujian
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
            Membantu melihat apakah kenaikan skor validasi diikuti oleh kenaikan skor pengujian.
          </p>
        </div>

        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            borderRadius: "14px",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <BarChart2 style={{ width: "20px", height: "20px", color: "#2563eb" }} />
          <div>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#64748b" }}>KORELASI r</div>
            <div style={{ fontSize: "16px", fontWeight: 900, color: "#0f1b35", fontFamily: "monospace" }}>
              {r.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Bento Mini Cards inside Analysis */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
        }}
      >
        <div
          style={{
            background: "#F8FAFC",
            borderRadius: "18px",
            padding: "18px 20px",
            border: "1px solid rgba(226, 232, 240, 0.7)",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            RATA-RATA SELISIH
          </div>
          <div style={{ fontSize: "22px", fontWeight: 900, color: "#0f1b35", fontFamily: "monospace", marginTop: "6px" }}>
            {(avgGapAbs * 100).toFixed(2)}%
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            Selisih skor validasi &amp; pengujian
          </div>
        </div>

        <div
          style={{
            background: "#ECFDF5",
            borderRadius: "18px",
            padding: "18px 20px",
            border: "1px solid #A7F3D0",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>
            PALING STABIL
          </div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#065F46", marginTop: "6px" }}>
            {smallestGapObj.submission.name}
          </div>
          <div style={{ fontSize: "11px", color: "#047857", marginTop: "4px", fontFamily: "monospace", fontWeight: 700 }}>
            Selisih: {(smallestGapObj.gapAbs * 100).toFixed(2)}%
          </div>
        </div>

        <div
          style={{
            background: "#EEF2FF",
            borderRadius: "18px",
            padding: "18px 20px",
            border: "1px solid #C7D2FE",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#4F46E5", textTransform: "uppercase" }}>
            SKOR TERTINGGI
          </div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#312E81", marginTop: "6px" }}>
            {bestAboveAverageModel.name}
          </div>
          <div style={{ fontSize: "11px", color: "#4338CA", marginTop: "4px", fontFamily: "monospace", fontWeight: 700 }}>
            Skor Uji: {(bestAboveAverageModel.testMacroF1 * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Auto Insight Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #111836 0%, #1e295d 100%)",
          borderRadius: "20px",
          padding: "22px 26px",
          color: "#ffffff",
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
          boxShadow: "0 10px 25px -6px rgba(17, 24, 54, 0.3)",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "14px",
            background: "rgba(255, 255, 255, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Sparkles style={{ width: "20px", height: "20px", color: "#60a5fa" }} />
        </div>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#93c5fd", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Kesimpulan Evaluasi
          </div>
          <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "#f8fafc", marginTop: "6px", fontWeight: 500 }}>
            {generateConclusion()}
          </p>
        </div>
      </div>
    </div>
  );
};
