import { NextResponse } from "next/server";
import type { RegionId } from "@/engine/types";

const counts: Record<RegionId, number> = {
  cowl: 0,
  plates: 0,
  forward: 0,
};

export function GET() {
  return NextResponse.json({
    regions: counts,
    note: "Ephemeral process memory. Supabase is the intended durable home.",
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { regionId?: string } | null;
  const regionId = body?.regionId;
  if (regionId !== "cowl" && regionId !== "plates" && regionId !== "forward") {
    return NextResponse.json({ error: "Unknown region" }, { status: 400 });
  }
  counts[regionId] += 1;
  return NextResponse.json({ regions: counts });
}
