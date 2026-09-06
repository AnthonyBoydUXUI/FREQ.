import type { Phase } from "./types";
import { TRANSFORMATION_FOR_PHASE } from "./types";

export function isImmersed(phase: Phase): boolean {
  return phase === "enter" || phase === "explore" || phase === "transform";
}

export function canSelectRegion(phase: Phase): boolean {
  return (
    phase === "boot" ||
    phase === "encounter" ||
    phase === "notice" ||
    phase === "approach" ||
    phase === "response"
  );
}

export function canExplore(phase: Phase): boolean {
  return phase === "explore";
}

export function isReturning(phase: Phase): boolean {
  return phase === "return";
}

/** How open the paper wound is. The drawing stays; the mark becomes a hole. */
export function woundAmount(phase: Phase, progress: number): number {
  if (phase === "touch") return progress * 0.14;
  if (phase === "transform") return Math.min(1, Math.max(0, (progress - 0.12) / 0.78));
  if (phase === "enter" || phase === "explore") return 1;
  if (phase === "return") return 1 - progress;
  return 0;
}

export function targetTransformation(phase: Phase, progress: number): number {
  const base = TRANSFORMATION_FOR_PHASE[phase];
  if (phase === "transform") {
    return 0.25 + progress * 0.5;
  }
  if (phase === "enter") {
    return 0.7 + progress * 0.12;
  }
  if (phase === "return") {
    return Math.max(0.03, 0.82 * (1 - progress));
  }
  return base;
}

export const SEQUENCE_SECONDS: Record<
  Extract<Phase, "touch" | "transform" | "enter" | "return">,
  number
> = {
  touch: 0.9,
  transform: 5.8,
  enter: 3.6,
  return: 5.2,
};

export const REDUCED_SEQUENCE_SECONDS: Record<
  Extract<Phase, "touch" | "transform" | "enter" | "return">,
  number
> = {
  touch: 0.2,
  transform: 0.55,
  enter: 0.45,
  return: 0.5,
};
