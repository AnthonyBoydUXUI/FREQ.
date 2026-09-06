import { NextResponse } from "next/server";

const allowed = new Set([
  "webgl_fail",
  "fps",
  "audio_init",
  "first_visual",
  "enter_world",
  "return",
]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    event?: string;
    value?: number;
  } | null;
  if (!body?.event || !allowed.has(body.event)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
