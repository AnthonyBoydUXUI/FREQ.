import type { RegionId } from "@/engine/types";
import {
  emptyCounts,
  parseRegionId,
  persistenceMode,
  supabaseConfig,
  type RegionCounts,
  type TelemetryEvent,
} from "@/server/contract";

type GlobalMemory = {
  counts: RegionCounts;
};

const globalStore = globalThis as typeof globalThis & {
  __freqMemory?: GlobalMemory;
};

function processMemory(): GlobalMemory {
  if (!globalStore.__freqMemory) {
    globalStore.__freqMemory = { counts: emptyCounts() };
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

export function backendStatus() {
  return {
    ok: true,
    name: "FREQ.",
    slice: "armor-cowl-nave",
    persistence: persistenceMode(),
  };
}

export function resetProcessMemoryForTests() {
  globalStore.__freqMemory = { counts: emptyCounts() };
}
