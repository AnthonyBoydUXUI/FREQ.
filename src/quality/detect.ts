import type { QualityMode } from "@/engine/types";
import { deviceClassFrom } from "@/quality/device";

export type QualityProfile = {
  mode: QualityMode;
  dpr: [number, number];
  strokes: number;
  antialias: boolean;
  displacement: number;
  particles: boolean;
};

const PROFILES: Record<QualityMode, QualityProfile> = {
  ultra: {
    mode: "ultra",
    dpr: [1, 2],
    strokes: 360,
    antialias: true,
    displacement: 1,
    particles: true,
  },
  high: {
    mode: "high",
    dpr: [1, 1.75],
    strokes: 280,
    antialias: true,
    displacement: 0.85,
    particles: true,
  },
  balanced: {
    mode: "balanced",
    dpr: [1, 1.35],
    strokes: 180,
    antialias: true,
    displacement: 0.7,
    particles: true,
  },
  efficient: {
    mode: "efficient",
    dpr: [1, 1],
    strokes: 80,
    antialias: false,
    displacement: 0.4,
    particles: false,
  },
};

export function detectQuality(): QualityMode {
  if (typeof navigator === "undefined") return "balanced";
  const device = deviceClassFrom({
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints,
    platform: navigator.platform,
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    coarsePointer:
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches,
  });
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 4;

  if (device === "phone") return (memory ?? 4) <= 4 ? "efficient" : "balanced";
  if (device === "tablet") return cores >= 6 ? "high" : "balanced";
  if ((memory ?? 8) >= 8 && cores >= 8) return "high";
  if ((memory ?? 4) <= 4) return "efficient";
  return "balanced";
}

export function profileFor(mode: QualityMode): QualityProfile {
  return PROFILES[mode];
}

export function adaptFromFps(current: QualityMode, fps: number): QualityMode {
  if (fps < 28 && current !== "efficient") {
    if (current === "ultra") return "high";
    if (current === "high") return "balanced";
    return "efficient";
  }
  if (fps > 56 && current === "efficient") return "balanced";
  return current;
}

export const PERFORMANCE_BUDGETS = {
  initialJsKb: 280,
  drawingTexturePx: 1280,
  frameTimeMs: 16.7,
  drawCalls: 40,
  audioMb: 3,
};
