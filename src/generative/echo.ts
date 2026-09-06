import type { ArtworkId } from "@/engine/types";
import type { StrokePoint } from "@/content/artworks";
import { seedUnit } from "@/engine/dailySeed";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Controlled echo: only displaced samples of the original graphite.
 * No new composition, no external model, no auto-publish.
 */
export function deriveEcho(
  strokes: StrokePoint[],
  seed: number,
  count = 64,
): StrokePoint[] {
  if (strokes.length === 0) return [];
  const take = Math.min(count, strokes.length);
  const start = Math.floor(seedUnit(seed, 5) * Math.max(1, strokes.length - take));
  const slice = strokes.slice(start, start + take);
  const fade = 0.45 + seedUnit(seed, 4) * 0.3;
  return slice.map((stroke, index) => {
    const jx = seedUnit(seed, 6 + index);
    const jy = seedUnit(seed, 7 + index);
    return {
      x: clamp01(stroke.x + (jx - 0.5) * 0.028),
      y: clamp01(stroke.y + (jy - 0.5) * 0.028),
      d: Math.min(1, stroke.d * fade),
    };
  });
}

export function echoId(artworkId: ArtworkId, day: string): string {
  return `${artworkId}:${day}`;
}

export type EchoStatus = "draft" | "approved" | "held";

export type EchoDraft = {
  id: string;
  artworkId: ArtworkId;
  day: string;
  seed: number;
  strokes: StrokePoint[];
  status: EchoStatus;
};
