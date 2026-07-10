import { Submission } from "@/types";

export async function downloadLeaderboardPDF(
  submissions: Submission[],
  activeGtVersion: string,
  datasetLength: number
): Promise<void> {
  const jsPDFModule = await import("jspdf");
  const jsPDF = jsPDFModule.default;
  const autoTableModule = await import("jspdf-autotable");
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 27, 53);
  doc.text("RESEARCH EXPERIMENT LOG — VisionAI Studio", pageW / 2, 16, {
    align: "center",
  });

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `GT Versi: ${activeGtVersion}  |  Sampel: ${datasetLength}  |  Eksperimen: ${submissions.length}  |  Export: ${new Date().toLocaleDateString("id-ID")}`,
    pageW / 2,
    22,
    { align: "center" }
  );

  const head = [
    [
      "Rank",
      "Nama Submission",
      "Author",
      "Arsitektur Model",
      "Val F1 (%)",
      "Test Macro F1 (%)",
      "Gen. Gap (%)",
      "Status Official",
      "Waktu Upload",
    ],
  ];

  const body = submissions.map((sub) => {
    const officialLabel = sub.isOfficial ? `Official #${sub.officialSlot ?? 1}` : "-";
    return [
      `#${sub.rank}`,
      sub.name,
      sub.leaderboardName,
      sub.modelName,
      (sub.validationMacroF1 * 100).toFixed(2),
      (sub.testMacroF1 * 100).toFixed(2),
      `${sub.generalizationGap >= 0 ? "+" : ""}${(sub.generalizationGap * 100).toFixed(2)}`,
      officialLabel,
      sub.uploadTimestampWIB,
    ];
  });

  autoTable(doc, {
    head,
    body,
    startY: 28,
    theme: "grid",
    styles: {
      fontSize: 7.5,
      cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
      textColor: [15, 27, 53],
      lineColor: [226, 232, 240],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [22, 32, 64],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      4: { halign: "right" },
      5: { halign: "right", fontStyle: "bold" },
      6: { halign: "right" },
      7: { halign: "center" },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell(data: any) {
      if (data.section === "body" && data.column.index === 7 && data.cell.raw !== "-") {
        data.cell.styles.textColor = [29, 78, 216];
        data.cell.styles.fontStyle = "bold";
      }
      if (data.section === "body" && data.column.index === 6) {
        const val = parseFloat(String(data.cell.raw));
        if (val >= 0) {
          data.cell.styles.textColor = [5, 150, 105];
        } else if (val >= -3) {
          data.cell.styles.textColor = [217, 119, 6];
        } else {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
  });

  // Footer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY: number = (doc as any).lastAutoTable?.finalY ?? 28;
  if (finalY + 16 < doc.internal.pageSize.getHeight()) {
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "Ketua: Rijal  |  Anggota: Fikri & Riskan  |  Dokumentasi Resmi Computer Vision Platform",
      pageW / 2,
      finalY + 10,
      { align: "center" }
    );
  }

  doc.save(
    `VisionAI_ExperimentLog_${activeGtVersion}_${new Date().toISOString().slice(0, 10)}.pdf`
  );
}
