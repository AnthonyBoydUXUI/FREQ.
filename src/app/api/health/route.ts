import { NextResponse } from "next/server";
import { backendStatus } from "@/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(backendStatus());
}
