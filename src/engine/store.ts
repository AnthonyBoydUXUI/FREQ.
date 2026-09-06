import { create } from "zustand";
import type { Phase, QualityMode, RegionId } from "./types";
import { HERO_ARTWORK_ID } from "./types";
import { dailySeed } from "./dailySeed";
import {
  canSelectRegion,
  REDUCED_SEQUENCE_SECONDS,
  SEQUENCE_SECONDS,
  targetTransformation,
} from "./phases";
import { detectQuality } from "@/quality/detect";
import { detectWebGL } from "@/quality/webgl";
import { rememberCollective, report } from "@/engine/report";

export type PointerState = {
  x: number;
  y: number;
  ndcX: number;
  ndcY: number;
  u: number;
  v: number;
  active: boolean;
  inside: boolean;
};

type EngineState = {
  phase: Phase;
  phaseProgress: number;
  transformation: number;
  hoveredRegionId: RegionId | null;
  focusedRegionId: RegionId | null;
  activeRegionId: RegionId | null;
  pointer: PointerState;
  quality: QualityMode;
  webgl: boolean | null;
  reducedMotion: boolean;
  audioUnlocked: boolean;
  muted: boolean;
  volume: number;
  captions: boolean;
  fps: number;
  seed: number;
  visitCounts: Record<RegionId, number>;
  rail: number;
  boot: () => void;
  setPointer: (pointer: Partial<PointerState>) => void;
  setHoveredRegion: (id: RegionId | null) => void;
  setFocusedRegion: (id: RegionId | null) => void;
  selectRegion: (id: RegionId) => void;
  setQuality: (quality: QualityMode) => void;
  setWebgl: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setMuted: (value: boolean) => void;
  toggleMuted: () => void;
  setVolume: (value: number) => void;
  setCaptions: (value: boolean) => void;
  unlockAudio: () => void;
  setFps: (fps: number) => void;
  setRail: (value: number) => void;
  tickSequence: (delta: number) => void;
  requestReturn: () => void;
  rememberVisit: (id: RegionId) => void;
};

const emptyPointer: PointerState = {
  x: 0.5,
  y: 0.5,
  ndcX: 0,
  ndcY: 0,
  u: 0.5,
  v: 0.5,
  active: false,
  inside: false,
};

function loadVisits(): Record<RegionId, number> {
  if (typeof window === "undefined") {
    return { cowl: 0, plates: 0, forward: 0 };
  }
  try {
    const raw = window.localStorage.getItem("freq.visits");
    if (!raw) return { cowl: 0, plates: 0, forward: 0 };
    const parsed = JSON.parse(raw) as Partial<Record<RegionId, number>>;
    return {
      cowl: parsed.cowl ?? 0,
      plates: parsed.plates ?? 0,
      forward: parsed.forward ?? 0,
    };
  } catch {
    return { cowl: 0, plates: 0, forward: 0 };
  }
}

export const useEngine = create<EngineState>((set, get) => ({
  phase: "boot",
  phaseProgress: 0,
  transformation: 0,
  hoveredRegionId: null,
  focusedRegionId: null,
  activeRegionId: null,
  pointer: emptyPointer,
  quality: "balanced",
  webgl: null,
  reducedMotion: false,
  audioUnlocked: false,
  muted: true,
  volume: 0.55,
  captions: false,
  fps: 60,
  seed: dailySeed(HERO_ARTWORK_ID),
  visitCounts: { cowl: 0, plates: 0, forward: 0 },
  rail: 0,
  boot: () => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const capable = typeof window !== "undefined" ? detectWebGL() : null;
    const quality = typeof window !== "undefined" ? detectQuality() : "balanced";
    set({
      phase: "encounter",
      phaseProgress: 0,
      transformation: targetTransformation("encounter", 0),
      reducedMotion: reduced,
      visitCounts: loadVisits(),
      seed: dailySeed(HERO_ARTWORK_ID),
      webgl: capable,
      quality,
    });
    if (capable === false) report("webgl_fail");
  },
  setPointer: (pointer) =>
    set((state) => ({ pointer: { ...state.pointer, ...pointer } })),
  setHoveredRegion: (id) => {
    const { phase, hoveredRegionId } = get();
    if (hoveredRegionId === id) return;
    if (!canSelectRegion(phase) && phase !== "explore") {
      set({ hoveredRegionId: id });
      return;
    }
    let nextPhase = phase;
    if (id && (phase === "encounter" || phase === "notice")) {
      nextPhase = "approach";
    } else if (id) {
      nextPhase = "response";
    } else if (phase === "approach" || phase === "response") {
      nextPhase = "notice";
    }
    set({
      hoveredRegionId: id,
      phase: nextPhase,
      transformation: targetTransformation(nextPhase, 0),
    });
  },
  setFocusedRegion: (id) => set({ focusedRegionId: id, hoveredRegionId: id }),
  selectRegion: (id) => {
    const { phase } = get();
    if (!canSelectRegion(phase) && phase !== "explore") return;
    if (id !== "cowl") {
      set({
        hoveredRegionId: id,
        focusedRegionId: id,
        phase: "response",
        transformation: targetTransformation("response", 0),
      });
      return;
    }
    set({
      activeRegionId: id,
      hoveredRegionId: id,
      focusedRegionId: id,
      phase: "touch",
      phaseProgress: 0,
      transformation: targetTransformation("touch", 0),
    });
  },
  setQuality: (quality) => set({ quality }),
  setWebgl: (value) => {
    if (value === false) report("webgl_fail");
    set({ webgl: value });
  },
  setReducedMotion: (value) => set({ reducedMotion: value }),
  setMuted: (value) => set({ muted: value }),
  toggleMuted: () =>
    set((state) => ({
      muted: !state.muted,
      audioUnlocked: true,
    })),
  setVolume: (value) => set({ volume: Math.min(1, Math.max(0, value)) }),
  setCaptions: (value) => set({ captions: value }),
  unlockAudio: () =>
    set((state) => ({
      audioUnlocked: true,
      muted: state.audioUnlocked ? state.muted : false,
    })),
  setFps: (fps) => set({ fps }),
  setRail: (value) => set({ rail: Math.min(1, Math.max(0, value)) }),
  tickSequence: (delta) => {
    const { phase, phaseProgress, reducedMotion } = get();
    if (
      phase !== "touch" &&
      phase !== "transform" &&
      phase !== "enter" &&
      phase !== "return"
    ) {
      return;
    }
    const duration = reducedMotion
      ? REDUCED_SEQUENCE_SECONDS[phase]
      : SEQUENCE_SECONDS[phase];
    const nextProgress = Math.min(1, phaseProgress + delta / duration);
    if (nextProgress < 1) {
      set({
        phaseProgress: nextProgress,
        transformation: targetTransformation(phase, nextProgress),
      });
      return;
    }

    if (phase === "touch") {
      set({
        phase: "transform",
        phaseProgress: 0,
        transformation: targetTransformation("transform", 0),
      });
    } else if (phase === "transform") {
      set({
        phase: "enter",
        phaseProgress: 0,
        transformation: targetTransformation("enter", 0),
      });
    } else if (phase === "enter") {
      set({
        phase: "explore",
        phaseProgress: 1,
        transformation: targetTransformation("explore", 1),
        rail: 0,
      });
      report("enter_world");
    } else if (phase === "return") {
      set({
        phase: "encounter",
        phaseProgress: 0,
        transformation: targetTransformation("encounter", 0),
        activeRegionId: null,
        rail: 0,
      });
      report("return");
    }
  },
  requestReturn: () => {
    const { phase } = get();
    if (phase === "explore" || phase === "enter" || phase === "transform") {
      set({
        phase: "return",
        phaseProgress: 0,
        transformation: targetTransformation("return", 0),
      });
    }
  },
  rememberVisit: (id) => {
    const next = { ...get().visitCounts, [id]: get().visitCounts[id] + 1 };
    set({ visitCounts: next });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("freq.visits", JSON.stringify(next));
    }
    rememberCollective(id);
  },
}));
