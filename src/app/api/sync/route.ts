import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SYNC_KEY = "app_state_v3";

/**
 * GET /api/sync
 * Mengambil seluruh state aplikasi dari satu row di database.
 * Sangat cepat karena hanya 1 query, 1 row.
 */
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = await (prisma as any).globalState.findUnique({
      where: { key: SYNC_KEY },
    });

    if (!row || !row.value) {
      return NextResponse.json(
        { success: true, state: null, version: 0 },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
            Pragma: "no-cache",
          },
        }
      );
    }

    const parsed = JSON.parse(row.value);
    return NextResponse.json(
      { success: true, state: parsed.state, version: parsed.version || 0 },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/sync error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sync
 * Menyimpan seluruh state aplikasi sebagai satu blob JSON atomik.
 * Menerima: { state: {...}, version: number }
 * Version digunakan untuk conflict resolution: yang lebih baru menang.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { state, version } = body;

    if (!state || typeof version !== "number") {
      return NextResponse.json(
        { success: false, error: "Missing state or version" },
        { status: 400 }
      );
    }

    // Baca versi cloud saat ini
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (prisma as any).globalState.findUnique({
      where: { key: SYNC_KEY },
    });

    let shouldWrite = true;
    if (existing && existing.value) {
      try {
        const parsed = JSON.parse(existing.value);
        // Hanya tulis jika versi baru >= versi cloud
        if (typeof parsed.version === "number" && version < parsed.version) {
          shouldWrite = false;
        }
      } catch {
        // Data lama rusak, timpa saja
      }
    }

    if (shouldWrite) {
      const valueStr = JSON.stringify({ state, version });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).globalState.upsert({
        where: { key: SYNC_KEY },
        update: { value: valueStr },
        create: { key: SYNC_KEY, value: valueStr },
      });
    }

    return NextResponse.json({ success: true, written: shouldWrite });
  } catch (error) {
    console.error("POST /api/sync error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
