import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SYNC_KEY = "app_state_v3";

export async function GET() {
  try {
    const row = await prisma.globalState.findUnique({
      where: { key: SYNC_KEY },
    });

    if (!row || !row.value) {
      return NextResponse.json(
        { success: true, state: null, version: 0 },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
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
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
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
    const { state } = body;

    if (!state) {
      return NextResponse.json(
        { success: false, error: "Missing state" },
        { status: 400 }
      );
    }

    const serverVersion = Date.now();
    const valueStr = JSON.stringify({ state, version: serverVersion });
    await prisma.globalState.upsert({
      where: { key: SYNC_KEY },
      update: { value: valueStr },
      create: { key: SYNC_KEY, value: valueStr },
    });

    return NextResponse.json(
      { success: true, written: true, version: serverVersion },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
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

