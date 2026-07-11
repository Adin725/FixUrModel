import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. Pre-warm ping handshake
    if (searchParams.get("ping") === "1") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).globalState.findFirst({ select: { key: true } });
      return NextResponse.json({ success: true, pong: true });
    }

    // 2. Cek daftar ID yang sudah masuk di server (reconciliation check super cepat)
    if (searchParams.get("checkIds") === "1") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = await (prisma as any).globalState.findMany({
        where: {
          OR: [
            { key: { startsWith: "img_" } },
            { key: "imageMap" },
          ],
        },
        select: { key: true, value: true },
      });

      const idSet = new Set<number>();
      for (const r of rows) {
        if (r.key.startsWith("img_")) {
          const num = Number(r.key.replace("img_", ""));
          if (!isNaN(num)) idSet.add(num);
        } else if (r.key === "imageMap") {
          try {
            const parsed = JSON.parse(r.value);
            Object.keys(parsed).forEach((k) => {
              const num = Number(k);
              if (!isNaN(num)) idSet.add(num);
            });
          } catch {
            // ignore
          }
        }
      }

      const ids = Array.from(idSet).sort((a, b) => a - b);
      return NextResponse.json(
        { success: true, ids },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            Pragma: "no-cache",
          },
        }
      );
    }

    // 3. Pengambilan spesifik atau seluruh gambar
    const idsParam = searchParams.get("ids");
    let whereClause: Record<string, unknown>;
    if (idsParam) {
      const keys = idsParam
        .split(",")
        .map((id) => `img_${id.trim()}`)
        .filter(Boolean);
      whereClause = { key: { in: keys } };
    } else {
      whereClause = {
        OR: [
          { key: { startsWith: "img_" } },
          { key: "imageMap" },
        ],
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (prisma as any).globalState.findMany({
      where: whereClause,
    });

    const imageMap: Record<number, string> = {};

    for (const row of rows) {
      if (row.key === "imageMap") {
        try {
          const parsed = JSON.parse(row.value);
          for (const [k, v] of Object.entries(parsed)) {
            const numKey = Number(k);
            if (!isNaN(numKey) && typeof v === "string") {
              imageMap[numKey] = v;
            }
          }
        } catch {
          // abaikan jika format lama tidak valid
        }
      } else if (row.key.startsWith("img_")) {
        const numKey = Number(row.key.replace("img_", ""));
        if (!isNaN(numKey) && typeof row.value === "string") {
          imageMap[numKey] = row.value;
        }
      }
    }

    return NextResponse.json(
      { success: true, imageMap },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/images error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data gambar dari cloud" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.reset === true) {
      // Hapus semua gambar dari cloud database saat reset
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).globalState.deleteMany({
        where: {
          OR: [
            { key: { startsWith: "img_" } },
            { key: "imageMap" },
          ],
        },
      });
      return NextResponse.json({ success: true, reset: true });
    }

    const images = body.images as Record<string | number, string> | undefined;
    let count = 0;

    if (images && typeof images === "object") {
      // Eksekusi upsert secara paralel agar pengunggahan batch 10-15 gambar selesai dalam sekejap
      const entries = Object.entries(images);
      await Promise.all(
        entries.map(async ([idStr, base64]) => {
          const numId = Number(idStr);
          if (!isNaN(numId) && typeof base64 === "string" && base64.length > 0) {
            const key = `img_${numId}`;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (prisma as any).globalState.upsert({
              where: { key },
              update: { value: base64 },
              create: { key, value: base64 },
            });
          }
        })
      );
      count = entries.length;
    }

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("POST /api/images error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan batch gambar ke cloud" },
      { status: 500 }
    );
  }
}
