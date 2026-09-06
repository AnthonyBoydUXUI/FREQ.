import { NextResponse } from "next/server";
import { curatorAuthorized } from "@/server/contract";
import {
  ensureTodayEcho,
  listEchoes,
  readCounts,
  readEvents,
  setEchoStatus,
  studioSnapshot,
} from "@/server/store";
import { provenance } from "@/web3/provenance";
import { featureFlags } from "@/engine/featureFlags";
import { worldGraph } from "@/content/worldGraph";
import { dailyState } from "@/engine/daily";
import { ARTWORK_IDS } from "@/engine/types";
import { allowRequest, clientKey } from "@/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!curatorAuthorized(request)) {
    return NextResponse.json({ error: "Curator key required" }, { status: 401 });
  }

  const regions = await readCounts();
  for (const id of ARTWORK_IDS) {
    ensureTodayEcho(id);
  }

  return NextResponse.json({
    ...studioSnapshot(),
    regions,
    events: readEvents(),
    echoes: listEchoes(),
    provenance,
    flags: featureFlags,
    graph: worldGraph,
    daily: ARTWORK_IDS.map((id) => dailyState(id)),
  });
}

export async function POST(request: Request) {
  if (!curatorAuthorized(request)) {
    return NextResponse.json({ error: "Curator key required" }, { status: 401 });
  }
  if (!allowRequest(clientKey(request))) {
    return NextResponse.json({ error: "Slow down" }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as {
    action?: unknown;
    echoId?: unknown;
  } | null;

  if (body?.action !== "approve" && body?.action !== "hold") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  if (typeof body.echoId !== "string") {
    return NextResponse.json({ error: "Missing echo" }, { status: 400 });
  }

  const echo = setEchoStatus(body.echoId, body.action === "approve" ? "approved" : "held");
  if (!echo) {
    return NextResponse.json({ error: "Unknown echo" }, { status: 404 });
  }

  return NextResponse.json({ echo, generativePublish: featureFlags.generativePublish });
}
