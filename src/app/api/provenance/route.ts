import { NextResponse } from "next/server";
import { provenance } from "@/web3/provenance";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(provenance);
}
