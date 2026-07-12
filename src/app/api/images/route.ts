import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    if (searchParams.get("ping") === "1") {
      await prisma.globalState.findFirst({ select: { key: true } });
      return NextResponse.json({ success: true, pong: true });
    }

    if (searchParams.get("checkIds") === "1") {
      const rows = await prisma.globalState.findMany({
        where: {
          OR: [
            { key: { startsWith: "img_" } },
            { key: "imageMap" },
          ],
        },
        select: { key: true },
      });

      const idSet = new Set<number>();
      for (const r of rows) {
        if (r.key.startsWith("img_")) {
          const num = Number(r.key.replace("img_", ""));
          if (!isNaN(num)) idSet.add(num);
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
        key: { startsWith: "img_" },
      };
    }

    const rows = await prisma.globalState.findMany({
      where: whereClause,
      select: { key: true, value: true },
    });

    const imageMap: Record<number, string> = {};

    for (const row of rows) {
      if (row.key.startsWith("img_")) {
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
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.reset === true) {
      await prisma.globalState.deleteMany({
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
      const entries = Object.entries(images);
      for (let i = 0; i < entries.length; i += 5) {
        const batch = entries.slice(i, i + 5);
        await Promise.all(
          batch.map(async ([idStr, base64]) => {
            const numId = Number(idStr);
            if (!isNaN(numId) && typeof base64 === "string" && base64.length > 0) {
              const key = `img_${numId}`;
              await prisma.globalState.upsert({
                where: { key },
                update: { value: base64 },
                create: { key, value: base64 },
              });
            }
          })
        );
      }
      count = entries.length;
    }

    return NextResponse.json({ success: true, count });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
