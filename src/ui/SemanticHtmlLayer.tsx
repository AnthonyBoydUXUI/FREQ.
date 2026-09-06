"use client";

import { regions } from "@/content/artworks";
import { polygonBounds } from "@/semantic/hitTest";
import { useEngine } from "@/engine/store";
import { canSelectRegion } from "@/engine/phases";

export function SemanticHtmlLayer({ enabled }: { enabled: boolean }) {
  const setFocusedRegion = useEngine((s) => s.setFocusedRegion);
  const setHoveredRegion = useEngine((s) => s.setHoveredRegion);
  const selectRegion = useEngine((s) => s.selectRegion);
  const enterWorld = useEngine((s) => s.enterWorld);
  const unlockAudio = useEngine((s) => s.unlockAudio);
  const rememberVisit = useEngine((s) => s.rememberVisit);
  const phase = useEngine((s) => s.phase);
  const focused = useEngine((s) => s.focusedRegionId);

  return (
    <div className="semantic-html" data-enabled={enabled ? "true" : "false"}>
      <button
        type="button"
        className="sheet-enter"
        aria-label="Touch the drawing to enter the world inside the vaulted cowl."
        onClick={() => {
          if (!canSelectRegion(phase)) return;
          unlockAudio();
          rememberVisit("cowl");
          enterWorld();
        }}
      />
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
            onPointerEnter={() => setHoveredRegion(region.id)}
            onPointerLeave={() => {
              if (useEngine.getState().hoveredRegionId === region.id) {
                setHoveredRegion(null);
              }
            }}
            onFocus={() => setFocusedRegion(region.id)}
            onBlur={() => {
              if (useEngine.getState().focusedRegionId === region.id) {
                setFocusedRegion(null);
              }
            }}
            onClick={(event) => {
              event.stopPropagation();
              unlockAudio();
              rememberVisit(region.id);
              if (!canSelectRegion(phase)) return;
              if (event.detail === 0) {
                selectRegion(region.id);
                return;
              }
              enterWorld();
            }}
          />
        );
      })}
    </div>
  );
}
