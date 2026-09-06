import type { RegionId } from "@/engine/types";

export const REGION_IDS: readonly RegionId[] = ["cowl", "plates", "forward"];

export const TELEMETRY_EVENTS = [
  "webgl_fail",
  "audio_init",
  "first_visual",
  "enter_world",
  "return",
] as const;

export type TelemetryEvent = (typeof TELEMETRY_EVENTS)[number];

export type RegionCounts = Record<RegionId, number>;

export function emptyCounts(): RegionCounts {
  return { cowl: 0, plates: 0, forward: 0 };
}

export function parseRegionId(value: unknown): RegionId | null {
  if (value === "cowl" || value === "plates" || value === "forward") return value;
  return null;
}

export function parseTelemetryEvent(value: unknown): TelemetryEvent | null {
  if (typeof value !== "string") return null;
  return (TELEMETRY_EVENTS as readonly string[]).includes(value)
    ? (value as TelemetryEvent)
    : null;
}

export function parseTelemetryValue(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (Math.abs(value) > 1_000_000) return null;
  return value;
}

export function persistenceMode(): "process" | "supabase" {
  return supabaseConfigured() ? "supabase" : "process";
}

export function supabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(url && key);
}

export function supabaseConfig(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}
