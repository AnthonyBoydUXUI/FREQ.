"use client";

import { heroArtwork, regions } from "@/content/artworks";
import { useEngine } from "@/engine/store";
import { isImmersed } from "@/engine/phases";
import { polygonToClipPath } from "@/semantic/hitTest";

export function SheetHover() {
  const hovered = useEngine((s) => s.hoveredRegionId);
  const inside = useEngine((s) => s.pointer.inside);
  const phase = useEngine((s) => s.phase);
  const hidden = isImmersed(phase) || phase === "return" || phase === "touch";

  return (
    <div
      className="sheet-hover"
      data-hidden={hidden ? "true" : "false"}
      data-inside={inside ? "true" : "false"}
      aria-hidden="true"
    >
      {regions.map((region) => (
        <div
          key={region.id}
          className="sheet-hover-region"
          data-on={hovered === region.id ? "true" : "false"}
          style={{ clipPath: polygonToClipPath(region.polygon) }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroArtwork.paths.display} alt="" />
        </div>
      ))}
    </div>
  );
}
