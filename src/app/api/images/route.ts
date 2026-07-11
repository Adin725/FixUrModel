import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (prisma as any).globalState.findMany({
      where: {
        OR: [
          { key: { startsWith: "img_" } },
          { key: "imageMap" },
        ],
      },
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

    return NextResponse.json({ success: true, imageMap });
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
      for (const [idStr, base64] of Object.entries(images)) {
        const numId = Number(idStr);
        if (!isNaN(numId) && typeof base64 === "string" && base64.length > 0) {
          const key = `img_${numId}`;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (prisma as any).globalState.upsert({
            where: { key },
            update: { value: base64 },
            create: { key, value: base64 },
          });
          count += 1;
        }
      }
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
