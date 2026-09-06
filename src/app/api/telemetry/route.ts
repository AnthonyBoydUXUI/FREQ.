import { NextResponse } from "next/server";
import { parseTelemetryEvent, parseTelemetryValue } from "@/server/contract";
import { allowRequest, clientKey } from "@/server/rateLimit";
import { recordEvent } from "@/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!allowRequest(clientKey(request))) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as {
    event?: unknown;
    value?: unknown;
  } | null;

  const event = parseTelemetryEvent(body?.event);
  if (!event) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await recordEvent(event, parseTelemetryValue(body?.value));
  return NextResponse.json({ ok: true });
}
