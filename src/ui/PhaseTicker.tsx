"use client";

import { useEffect } from "react";
import { useEngine } from "@/engine/store";

export function PhaseTicker() {
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      useEngine.getState().tickSequence(delta);
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, []);
  return null;
}
