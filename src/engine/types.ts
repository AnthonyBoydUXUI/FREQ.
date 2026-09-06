export type Phase =
  | "boot"
  | "encounter"
  | "notice"
  | "approach"
  | "response"
  | "touch"
  | "transform"
  | "enter"
  | "explore"
  | "return";

export type QualityMode = "ultra" | "high" | "balanced" | "efficient";

export const ARTWORK_IDS = ["armor", "facet", "signal"] as const;
export type ArtworkId = (typeof ARTWORK_IDS)[number];

export const REGION_IDS = [
  "cowl",
  "plates",
  "forward",
  "visor",
  "horns",
  "harness",
  "crown",
  "mask",
  "strap",
] as const;
export type RegionId = (typeof REGION_IDS)[number];

export type Vec2 = readonly [number, number];

export const PHASE_ORDER: Phase[] = [
  "boot",
  "encounter",
  "notice",
  "approach",
  "response",
  "touch",
  "transform",
  "enter",
  "explore",
  "return",
];

export const TRANSFORMATION_FOR_PHASE: Record<Phase, number> = {
  boot: 0,
  encounter: 0.03,
  notice: 0.05,
  approach: 0.08,
  response: 0.12,
  touch: 0.22,
  transform: 0.5,
  enter: 0.75,
  explore: 0.82,
  return: 0.1,
};

export const HERO_ARTWORK_ID: ArtworkId = "armor";

export const DRAWING_WIDTH = 1.65;
export const DRAWING_HEIGHT = 2.2;

export function emptyRegionCounts(): Record<RegionId, number> {
  return {
    cowl: 0,
    plates: 0,
    forward: 0,
    visor: 0,
    horns: 0,
    harness: 0,
    crown: 0,
    mask: 0,
    strap: 0,
  };
}

export function isArtworkId(value: unknown): value is ArtworkId {
  return value === "armor" || value === "facet" || value === "signal";
}
