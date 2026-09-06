import { NextResponse } from "next/server";
import { parseArtworkId } from "@/server/contract";
import { approvedEcho, ensureTodayEcho } from "@/server/store";
import { featureFlags } from "@/engine/featureFlags";
import { HERO_ARTWORK_ID } from "@/engine/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const url = new URL(request.url);
  const artworkId = parseArtworkId(url.searchParams.get("artworkId")) ?? HERO_ARTWORK_ID;
  const draft = ensureTodayEcho(artworkId);
  const approved = approvedEcho(artworkId);
  return NextResponse.json({
    artworkId,
    day: draft.day,
    approved: Boolean(approved),
    status: approved?.status ?? draft.status,
    strokes: approved ? approved.strokes : [],
    publish: featureFlags.generativePublish,
  });
}
