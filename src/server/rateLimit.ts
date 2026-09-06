const WINDOW_MS = 60_000;
const LIMIT = 48;

type Bucket = { times: number[] };

const globalRate = globalThis as typeof globalThis & {
  __freqRate?: Map<string, Bucket>;
};

function buckets() {
  if (!globalRate.__freqRate) globalRate.__freqRate = new Map();
  return globalRate.__freqRate;
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = request.headers.get("x-real-ip")?.trim();
  return forwarded || real || "local";
}

export function allowRequest(key: string, now = Date.now()): boolean {
  const store = buckets();
  const current = store.get(key)?.times.filter((time) => now - time < WINDOW_MS) ?? [];
  if (current.length >= LIMIT) {
    store.set(key, { times: current });
    return false;
  }
  current.push(now);
  store.set(key, { times: current });
  return true;
}

export function resetRateLimitForTests() {
  globalRate.__freqRate = new Map();
}
