import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    name: "FREQ.",
    slice: "armor-cowl-nave",
  });
}
