"use client";

import { useMemo } from "react";
import { artworkById, portalFor, regionsFor } from "@/content/artworks";
import { useEngine } from "@/engine/store";
import { polygonBounds } from "@/semantic/hitTest";
import { canSelectRegion } from "@/engine/phases";

export function Fallback2D() {
  const artworkId = useEngine((s) => s.artworkId);
  const artwork = artworkById[artworkId];
  const regions = regionsFor(artworkId);
  const portal = portalFor(artworkId);
  const pointer = useEngine((s) => s.pointer);
  const hovered = useEngine((s) => s.hoveredRegionId);
  const phase = useEngine((s) => s.phase);
  const setHoveredRegion = useEngine((s) => s.setHoveredRegion);
  const unlockAudio = useEngine((s) => s.unlockAudio);
  const rememberVisit = useEngine((s) => s.rememberVisit);
  const reducedMotion = useEngine((s) => s.reducedMotion);

  const tilt = useMemo(() => {
    if (reducedMotion) return "none";
    return `rotateX(${(-pointer.ndcY * 4).toFixed(2)}deg) rotateY(${(pointer.ndcX * 5).toFixed(2)}deg)`;
  }, [pointer.ndcX, pointer.ndcY, reducedMotion]);

  return (
    <div className="fallback-stage" aria-hidden={false}>
      <div
        className="fallback-paper"
        style={{ transform: tilt }}
        onClick={() => {
          if (!canSelectRegion(phase)) return;
          unlockAudio();
          rememberVisit(portal.id);
          useEngine.getState().enterWorld();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={artwork.paths.display} alt="" className="fallback-image" />
        {regions.map((region) => {
          const box = polygonBounds(region.polygon);
          const active = hovered === region.id;
          return (
            <button
              key={region.id}
              type="button"
              className="fallback-region"
              style={{
                left: `${box.minX * 100}%`,
                top: `${box.minY * 100}%`,
                width: `${box.width * 100}%`,
                height: `${box.height * 100}%`,
                transform: active ? "translateY(-4px)" : undefined,
              }}
              aria-label={region.accessibleLabel}
              onMouseEnter={() => setHoveredRegion(region.id)}
              onMouseLeave={() => setHoveredRegion(null)}
              onFocus={() => useEngine.getState().setFocusedRegion(region.id)}
              onClick={(event) => {
                event.stopPropagation();
                unlockAudio();
                rememberVisit(region.id);
                if (canSelectRegion(phase)) useEngine.getState().enterWorld();
              }}
            />
          );
        })}
      </div>
      {phase === "explore" || phase === "enter" || phase === "transform" ? (
        <div className="fallback-world">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artwork.paths.display} alt="" />
          <p>
            Inside the {portal.label.toLowerCase()}, the same paper continues. Slide to
            look. Press Go back when you want the picture again.
          </p>
          <button type="button" onClick={() => useEngine.getState().requestReturn()}>
            Go back
          </button>
        </div>
      ) : null}
    </div>
  );
}
