import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Deprecated / Clean-up endpoint for legacy base64 images.
 * Images are now served on-demand as static assets from public/dataset/.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    if (searchParams.get("ping") === "1") {
      return NextResponse.json({ success: true, pong: true });
    }

    if (searchParams.get("checkIds") === "1") {
      return NextResponse.json({ success: true, ids: [] });
    }

    return NextResponse.json({ success: true, imageMap: {} });
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

    // Allows cleaning up legacy base64 image rows from PostgreSQL
    if (body.reset === true || body.cleanLegacy === true) {
      await prisma.globalState.deleteMany({
        where: {
          OR: [
            { key: { startsWith: "img_" } },
            { key: "imageMap" },
          ],
        },
      });
      return NextResponse.json({ success: true, cleaned: true });
    }

    return NextResponse.json({ success: true, count: 0 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
