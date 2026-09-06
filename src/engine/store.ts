import { create } from "zustand";
import type { ArtworkId, Phase, QualityMode, RegionId } from "./types";
import { HERO_ARTWORK_ID, emptyRegionCounts } from "./types";
import { dailySeed } from "./dailySeed";
import { dailyState } from "./daily";
import {
  canSelectRegion,
  REDUCED_SEQUENCE_SECONDS,
  SEQUENCE_SECONDS,
  targetTransformation,
} from "./phases";
import { detectQuality } from "@/quality/detect";
import { detectWebGL } from "@/quality/webgl";
import { rememberCollective, report } from "@/engine/report";
import { isPortalRegion, portalFor } from "@/content/artworks";
import { nextArtworkId } from "@/content/worldGraph";

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
  artworkId: ArtworkId;
  phase: Phase;
  phaseProgress: number;
  transformation: number;
  hoveredRegionId: RegionId | null;
  focusedRegionId: RegionId | null;
  activeRegionId: RegionId | null;
  pendingTravelId: ArtworkId | null;
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
  setArtwork: (id: ArtworkId) => void;
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
  requestTravel: (id?: ArtworkId) => void;
  rememberVisit: (id: RegionId) => void;
  enterWorld: () => void;
  enterExploreDirectly: () => void;
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
  const empty = emptyRegionCounts();
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem("freq.visits");
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<Record<RegionId, number>>;
    return { ...empty, ...parsed };
  } catch {
    return empty;
  }
}

function encounterReset(artworkId: ArtworkId) {
  const daily = dailyState(artworkId);
  return {
    artworkId,
    phase: "encounter" as const,
    phaseProgress: 0,
    transformation: targetTransformation("encounter", 0) + daily.openness * 0.15,
    hoveredRegionId: null as RegionId | null,
    focusedRegionId: null as RegionId | null,
    activeRegionId: null as RegionId | null,
    pendingTravelId: null as ArtworkId | null,
    rail: 0,
    seed: daily.seed,
  };
}

export const useEngine = create<EngineState>((set, get) => ({
  artworkId: HERO_ARTWORK_ID,
  phase: "boot",
  phaseProgress: 0,
  transformation: 0,
  hoveredRegionId: null,
  focusedRegionId: null,
  activeRegionId: null,
  pendingTravelId: null,
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
  visitCounts: emptyRegionCounts(),
  rail: 0,
  boot: () => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const capable = typeof window !== "undefined" ? detectWebGL() : null;
    const quality = typeof window !== "undefined" ? detectQuality() : "balanced";
    const id = get().artworkId;
    set({
      ...encounterReset(id),
      reducedMotion: reduced,
      visitCounts: loadVisits(),
      webgl: capable,
      quality,
    });
    if (capable === false) report("webgl_fail");
  },
  setArtwork: (id) => {
    if (get().artworkId === id && get().phase !== "boot") {
      return;
    }
    set(encounterReset(id));
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
    if (!isPortalRegion(id)) {
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
      const { pendingTravelId, artworkId } = get();
      if (pendingTravelId && pendingTravelId !== artworkId) {
        report("travel");
        set({
          ...encounterReset(pendingTravelId),
        });
        return;
      }
      set({
        ...encounterReset(artworkId),
      });
      report("return");
    }
  },
  requestReturn: () => {
    const { phase } = get();
    if (phase === "explore" || phase === "enter" || phase === "transform") {
      set({
        pendingTravelId: null,
        phase: "return",
        phaseProgress: 0,
        transformation: targetTransformation("return", 0),
      });
    }
  },
  requestTravel: (id) => {
    const { phase, artworkId } = get();
    if (phase !== "explore" && phase !== "enter") return;
    const target = id ?? nextArtworkId(artworkId);
    set({
      pendingTravelId: target,
      phase: "return",
      phaseProgress: 0,
      transformation: targetTransformation("return", 0),
    });
  },
  rememberVisit: (id) => {
    const next = { ...get().visitCounts, [id]: (get().visitCounts[id] ?? 0) + 1 };
    set({ visitCounts: next });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("freq.visits", JSON.stringify(next));
    }
    rememberCollective(id);
  },
  enterWorld: () => {
    const { phase, artworkId } = get();
    if (!canSelectRegion(phase)) return;
    get().selectRegion(portalFor(artworkId).id);
  },
  enterExploreDirectly: () => {
    const portal = portalFor(get().artworkId);
    set({
      activeRegionId: portal.id,
      hoveredRegionId: portal.id,
      focusedRegionId: portal.id,
      phase: "explore",
      phaseProgress: 1,
      transformation: targetTransformation("explore", 1),
      rail: 0,
    });
  },
}));
