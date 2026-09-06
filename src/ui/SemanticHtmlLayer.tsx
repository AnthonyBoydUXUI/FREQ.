"use client";

import { regions } from "@/content/artworks";
import { polygonBounds } from "@/semantic/hitTest";
import { useEngine } from "@/engine/store";
import { canSelectRegion } from "@/engine/phases";

export function SemanticHtmlLayer({ enabled }: { enabled: boolean }) {
  const setFocusedRegion = useEngine((s) => s.setFocusedRegion);
  const selectRegion = useEngine((s) => s.selectRegion);
  const unlockAudio = useEngine((s) => s.unlockAudio);
  const rememberVisit = useEngine((s) => s.rememberVisit);
  const phase = useEngine((s) => s.phase);
  const focused = useEngine((s) => s.focusedRegionId);

  return (
    <div className="semantic-html" data-enabled={enabled ? "true" : "false"}>
      {regions.map((region) => {
        const box = polygonBounds(region.polygon);
        return (
          <button
            key={region.id}
            type="button"
            className="semantic-button"
            style={{
              left: `${box.minX * 100}%`,
              top: `${box.minY * 100}%`,
              width: `${box.width * 100}%`,
              height: `${box.height * 100}%`,
            }}
            aria-label={region.accessibleLabel}
            data-focused={focused === region.id ? "true" : "false"}
            onFocus={() => setFocusedRegion(region.id)}
            onBlur={() => {
              if (useEngine.getState().focusedRegionId === region.id) {
                setFocusedRegion(null);
              }
            }}
            onClick={() => {
              unlockAudio();
              rememberVisit(region.id);
              if (canSelectRegion(phase)) selectRegion(region.id);
            }}
          />
        );
      })}
    </div>
  );
}
