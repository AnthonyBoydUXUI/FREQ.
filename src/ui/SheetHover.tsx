"use client";

import { artworkById, regionsFor } from "@/content/artworks";
import type { ArtworkId } from "@/engine/types";
import { useEngine } from "@/engine/store";
import { isImmersed } from "@/engine/phases";
import { polygonToClipPath } from "@/semantic/hitTest";

export function SheetHover({ artworkId }: { artworkId?: ArtworkId }) {
  const storeId = useEngine((s) => s.artworkId);
  const current = artworkId ?? storeId;
  const artwork = artworkById[current];
  const regions = regionsFor(current);
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
          <img src={artwork.paths.display} alt="" />
        </div>
      ))}
    </div>
  );
}
