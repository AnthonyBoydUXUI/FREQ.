"use client";

import { useEngine } from "@/engine/store";
import { actionGuide } from "@/ui/guide";
import { dailyState } from "@/engine/daily";

export function GuideLine() {
  const phase = useEngine((s) => s.phase);
  const hovered = useEngine((s) => s.hoveredRegionId);
  const inside = useEngine((s) => s.pointer.inside);
  const artworkId = useEngine((s) => s.artworkId);
  const pendingTravelId = useEngine((s) => s.pendingTravelId);
  const daily = dailyState(artworkId);
  const line = actionGuide({
    phase,
    hovered,
    inside,
    artworkId,
    pendingTravelId,
    dailyCaption: daily.caption,
  });

  return (
    <p className="guide" aria-live="polite">
      {line}
    </p>
  );
}
