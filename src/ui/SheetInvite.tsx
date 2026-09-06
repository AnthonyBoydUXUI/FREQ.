"use client";

import { regionById } from "@/content/artworks";
import { useEngine } from "@/engine/store";
import { isImmersed } from "@/engine/phases";
import { polygonBounds } from "@/semantic/hitTest";
import { sheetInvite } from "@/ui/guide";

export function SheetInvite() {
  const phase = useEngine((s) => s.phase);
  const hovered = useEngine((s) => s.hoveredRegionId);
  const inside = useEngine((s) => s.pointer.inside);
  const line = sheetInvite({ phase, hovered, inside });
  const hidden = !line || isImmersed(phase) || phase === "return" || phase === "touch";

  if (!line) return null;

  const region = hovered ? regionById[hovered] : null;
  const box = region ? polygonBounds(region.polygon) : null;
  const style = box
    ? {
        left: `${(box.minX + box.width / 2) * 100}%`,
        top: `${(box.minY + box.height / 2) * 100}%`,
        bottom: "auto",
        transform: "translate(-50%, -50%)",
      }
    : undefined;

  return (
    <p
      className="sheet-invite"
      data-hidden={hidden ? "true" : "false"}
      data-anchored={box ? "true" : "false"}
      aria-hidden="true"
      style={style}
    >
      {line}
    </p>
  );
}
