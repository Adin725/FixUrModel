import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (prisma as any).globalState.findMany();
    const state: Record<string, unknown> = {};

    for (const row of rows) {
      try {
        state[row.key] = JSON.parse(row.value);
      } catch {
        state[row.key] = row.value;
      }
    }

    return NextResponse.json({ success: true, state });
  } catch (error) {
    console.error("GET /api/sync error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data dari database cloud" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const keys = [
      "users",
      "submissions",
      "dataset",
      "activeGtVersion",
      "gtHistory",
      "activityLogs",
      "imageMap",
    ];

    for (const key of keys) {
      if (body[key] !== undefined) {
        const valueStr =
          typeof body[key] === "string" ? body[key] : JSON.stringify(body[key]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).globalState.upsert({
          where: { key },
          update: { value: valueStr },
          create: { key, value: valueStr },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/sync error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan data ke database cloud" },
      { status: 500 }
    );
  }
}
