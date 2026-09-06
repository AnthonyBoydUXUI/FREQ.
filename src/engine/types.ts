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

export type RegionId = "cowl" | "plates" | "forward";

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

export const HERO_ARTWORK_ID = "armor";

export const DRAWING_WIDTH = 2.4;
export const DRAWING_HEIGHT = 1.8;
