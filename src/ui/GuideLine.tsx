"use client";

import { useEngine } from "@/engine/store";
import { actionGuide } from "@/ui/guide";
import { dailyState } from "@/engine/daily";
import type { ArtworkId } from "@/engine/types";

export function GuideLine({ artworkId }: { artworkId?: ArtworkId }) {
  const phase = useEngine((s) => s.phase);
  const hovered = useEngine((s) => s.hoveredRegionId);
  const inside = useEngine((s) => s.pointer.inside);
  const storeId = useEngine((s) => s.artworkId);
  const pendingTravelId = useEngine((s) => s.pendingTravelId);
  const current = artworkId ?? storeId;
  const daily = dailyState(current);
  const line = actionGuide({
    phase,
    hovered,
    inside,
    artworkId: current,
    pendingTravelId,
    dailyCaption: daily.caption,
  });

  return (
    <p className="guide" aria-live="polite">
      {line}
    </p>
  );
}
