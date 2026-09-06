import type { ArtworkId, RegionId } from "@/engine/types";
import { ARTWORK_IDS, REGION_IDS, emptyRegionCounts, isArtworkId } from "@/engine/types";

export const REGION_IDS_LIST: readonly RegionId[] = REGION_IDS;

export { emptyRegionCounts };

export const TELEMETRY_EVENTS = [
  "webgl_fail",
  "audio_init",
  "first_visual",
  "enter_world",
  "return",
  "travel",
] as const;

export type TelemetryEvent = (typeof TELEMETRY_EVENTS)[number];

export type RegionCounts = Record<RegionId, number>;

export function emptyCounts(): RegionCounts {
  return emptyRegionCounts();
}

export function parseRegionId(value: unknown): RegionId | null {
  if (typeof value !== "string") return null;
  return (REGION_IDS as readonly string[]).includes(value) ? (value as RegionId) : null;
}

export function parseArtworkId(value: unknown): ArtworkId | null {
  return isArtworkId(value) ? value : null;
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

export function curatorAuthorized(request: Request): boolean {
  const expected = process.env.CURATOR_KEY;
  if (!expected) return true;
  const header = request.headers.get("x-curator-key");
  const url = new URL(request.url);
  return header === expected || url.searchParams.get("key") === expected;
}

export { ARTWORK_IDS };
