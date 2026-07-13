import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  try {
    const totalRows = await prisma.globalState.count();

    const imageRows = await prisma.globalState.findMany({
      where: {
        OR: [
          { key: { startsWith: "img_" } },
          { key: "imageMap" },
        ],
      },
      select: { key: true },
    });

    const imageKeys = imageRows.map((r) => r.key);
    const individualImageCount = imageKeys.filter((k) => k.startsWith("img_")).length;
    const hasLegacyImageMap = imageKeys.includes("imageMap");

    const syncRow = await prisma.globalState.findUnique({
      where: { key: "app_state_v3" },
      select: { value: true },
    });

    let syncVersion = 0;
    let syncStateSummary: Record<string, unknown> = {};
    if (syncRow?.value) {
      try {
        const parsed = JSON.parse(syncRow.value);
        syncVersion = parsed.version || 0;
        const s = parsed.state || {};
        syncStateSummary = {
          usersCount: Array.isArray(s.users) ? s.users.length : 0,
          submissionsCount: Array.isArray(s.submissions) ? s.submissions.length : 0,
          datasetCount: Array.isArray(s.dataset) ? s.dataset.length : 0,
          activeGtVersion: s.activeGtVersion || "-",
          gtHistoryCount: Array.isArray(s.gtHistory) ? s.gtHistory.length : 0,
          activityLogsCount: Array.isArray(s.activityLogs) ? s.activityLogs.length : 0,
        };
      } catch {
        syncStateSummary = { error: "Failed to parse app_state_v3 JSON" };
      }
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      databaseStatus: "ONLINE",
      queryDurationMs: durationMs,
      totalRowsInGlobalState: totalRows,
      individualImageCount,
      hasLegacyImageMap,
      imageKeysSample: imageKeys.slice(0, 50),
      syncVersion,
      syncStateSummary,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        databaseStatus: "ERROR",
        queryDurationMs: Date.now() - startTime,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
