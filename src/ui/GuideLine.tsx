"use client";

import { useEngine } from "@/engine/store";
import { actionGuide } from "@/ui/guide";

export function GuideLine() {
  const phase = useEngine((s) => s.phase);
  const hovered = useEngine((s) => s.hoveredRegionId);
  const inside = useEngine((s) => s.pointer.inside);
  const line = actionGuide({ phase, hovered, inside });

  return (
    <p className="guide" aria-live="polite">
      {line}
    </p>
  );
}
