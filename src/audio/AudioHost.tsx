"use client";

import { useEffect, useRef } from "react";
import { audioPaths } from "@/content/artworks";
import { regionById } from "@/content/artworks";
import { SpatialAudio, captionFor, stemGainsFor } from "@/audio/engine";
import { useEngine } from "@/engine/store";
import { report } from "@/engine/report";

let singleton: SpatialAudio | null = null;

export function AudioHost() {
  const engineRef = useRef<SpatialAudio | null>(null);
  const phase = useEngine((s) => s.phase);
  const hovered = useEngine((s) => s.hoveredRegionId);
  const pointer = useEngine((s) => s.pointer);
  const transformation = useEngine((s) => s.transformation);
  const muted = useEngine((s) => s.muted);
  const volume = useEngine((s) => s.volume);
  const unlocked = useEngine((s) => s.audioUnlocked);
  const captions = useEngine((s) => s.captions);

  useEffect(() => {
    if (!singleton) singleton = new SpatialAudio(audioPaths as never);
    engineRef.current = singleton;
    return () => {
      // Keep audio across remounts; dispose only on full page unload.
    };
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    void engineRef.current?.unlock().then(() => {
      engineRef.current?.setMaster(muted, volume);
    });
  }, [unlocked, muted, volume]);

  useEffect(() => {
    if (!unlocked) return;
    report("audio_init");
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked) return;
    engineRef.current?.setStems(
      stemGainsFor(phase, Boolean(hovered), pointer.active, transformation),
      pointer.ndcX * 0.35,
    );
  }, [phase, hovered, pointer.active, pointer.ndcX, transformation, unlocked]);

  const label = hovered && regionById[hovered] ? regionById[hovered].label : null;
  const text = captionFor(phase, label, muted || !unlocked);

  return (
    <p
      className="captions"
      aria-live="polite"
      data-visible={captions && unlocked ? "true" : "false"}
    >
      {text}
    </p>
  );
}
