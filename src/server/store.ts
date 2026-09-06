import type { ArtworkId, RegionId } from "@/engine/types";
import {
  emptyCounts,
  parseArtworkId,
  parseRegionId,
  persistenceMode,
  supabaseConfig,
  type RegionCounts,
  type TelemetryEvent,
} from "@/server/contract";
import { deriveEcho, echoId, type EchoDraft, type EchoStatus } from "@/generative/echo";
import { strokesFor } from "@/content/artworks";
import { dailyState } from "@/engine/daily";

type GlobalMemory = {
  counts: RegionCounts;
  events: Partial<Record<TelemetryEvent, number>>;
  echoes: Record<string, EchoDraft>;
};

const globalStore = globalThis as typeof globalThis & {
  __freqMemory?: GlobalMemory;
};

function processMemory(): GlobalMemory {
  if (!globalStore.__freqMemory) {
    globalStore.__freqMemory = { counts: emptyCounts(), events: {}, echoes: {} };
  }
  return globalStore.__freqMemory;
}

async function supabaseHeaders(key: string): Promise<HeadersInit> {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export async function readCounts(): Promise<RegionCounts> {
  const remote = supabaseConfig();
  if (!remote) return { ...processMemory().counts };

  try {
    const response = await fetch(
      `${remote.url}/rest/v1/collective_memory?select=region_id,visits`,
      { headers: await supabaseHeaders(remote.key), cache: "no-store" },
    );
    if (!response.ok) return { ...processMemory().counts };
    const rows = (await response.json()) as Array<{ region_id?: string; visits?: number }>;
    const counts = emptyCounts();
    for (const row of rows) {
      const id = parseRegionId(row.region_id);
      if (id) counts[id] = Number(row.visits) || 0;
    }
    return counts;
  } catch {
    return { ...processMemory().counts };
  }
}

export async function touchRegion(regionId: RegionId): Promise<RegionCounts> {
  const remote = supabaseConfig();
  if (!remote) {
    const memory = processMemory();
    memory.counts[regionId] += 1;
    return { ...memory.counts };
  }

  try {
    const response = await fetch(`${remote.url}/rest/v1/rpc/touch_region`, {
      method: "POST",
      headers: await supabaseHeaders(remote.key),
      body: JSON.stringify({ p_region: regionId }),
      cache: "no-store",
    });
    if (!response.ok) {
      const memory = processMemory();
      memory.counts[regionId] += 1;
      return { ...memory.counts };
    }
    return readCounts();
  } catch {
    const memory = processMemory();
    memory.counts[regionId] += 1;
    return { ...memory.counts };
  }
}

export async function recordEvent(event: TelemetryEvent, value: number | null): Promise<void> {
  const memory = processMemory();
  memory.events[event] = (memory.events[event] ?? 0) + 1;

  const remote = supabaseConfig();
  if (!remote) return;

  try {
    await fetch(`${remote.url}/rest/v1/analytics_events`, {
      method: "POST",
      headers: {
        ...(await supabaseHeaders(remote.key)),
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ event, value }),
      cache: "no-store",
    });
  } catch {
    // Telemetry must never affect the drawing.
  }
}

export function readEvents(): Partial<Record<TelemetryEvent, number>> {
  return { ...processMemory().events };
}

export function ensureTodayEcho(artworkId: ArtworkId, date: Date = new Date()): EchoDraft {
  const daily = dailyState(artworkId, date);
  const id = echoId(artworkId, daily.day);
  const memory = processMemory();
  const existing = memory.echoes[id];
  if (existing) return existing;
  const draft: EchoDraft = {
    id,
    artworkId,
    day: daily.day,
    seed: daily.seed,
    strokes: deriveEcho(strokesFor(artworkId), daily.seed),
    status: "draft",
  };
  memory.echoes[id] = draft;
  return draft;
}

export function listEchoes(): EchoDraft[] {
  return Object.values(processMemory().echoes).sort((a, b) => b.day.localeCompare(a.day));
}

export function approvedEcho(artworkId: ArtworkId, date: Date = new Date()): EchoDraft | null {
  const daily = dailyState(artworkId, date);
  const draft = processMemory().echoes[echoId(artworkId, daily.day)];
  if (draft?.status === "approved") return draft;
  return null;
}

export function setEchoStatus(id: string, status: EchoStatus): EchoDraft | null {
  const memory = processMemory();
  const draft = memory.echoes[id];
  if (!draft) return null;
  draft.status = status;
  return draft;
}

export function studioSnapshot() {
  return {
    persistence: persistenceMode(),
    regions: { ...processMemory().counts },
    events: readEvents(),
    echoes: listEchoes(),
    generativePublish: false,
  };
}

export function backendStatus() {
  return {
    ok: true,
    name: "FREQ.",
    slice: "three-territories",
    persistence: persistenceMode(),
    territories: ["armor", "facet", "signal"],
  };
}

export function resetProcessMemoryForTests() {
  globalStore.__freqMemory = { counts: emptyCounts(), events: {}, echoes: {} };
}

export function parseStudioArtwork(value: unknown): ArtworkId | null {
  return parseArtworkId(value);
}
