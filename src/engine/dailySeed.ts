const EXPERIENCE_VERSION = 1;

export function dailySeed(
  artworkId: string,
  date: Date = new Date(),
  version: number = EXPERIENCE_VERSION,
): number {
  const day = date.toISOString().slice(0, 10);
  const input = `${artworkId}:${day}:${version}`;
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seedUnit(seed: number, lane: number): number {
  const x = Math.sin(seed * 0.0001 + lane * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
