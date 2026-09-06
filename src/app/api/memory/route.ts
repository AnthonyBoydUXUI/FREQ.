import { NextResponse } from "next/server";
import { parseRegionId } from "@/server/contract";
import { allowRequest, clientKey } from "@/server/rateLimit";
import { readCounts, touchRegion } from "@/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const regions = await readCounts();
  return NextResponse.json({ regions });
}

export async function POST(request: Request) {
  if (!allowRequest(clientKey(request))) {
    return NextResponse.json({ error: "Slow down" }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { regionId?: unknown } | null;
  const regionId = parseRegionId(body?.regionId);
  if (!regionId) {
    return NextResponse.json({ error: "Unknown region" }, { status: 400 });
  }

  const regions = await touchRegion(regionId);
  return NextResponse.json({ regions });
}
