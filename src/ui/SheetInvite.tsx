"use client";

import { useEngine } from "@/engine/store";
import { isImmersed } from "@/engine/phases";
import { sheetInvite } from "@/ui/guide";

export function SheetInvite() {
  const phase = useEngine((s) => s.phase);
  const line = sheetInvite({ phase, hovered: null, inside: false });
  const hidden = !line || isImmersed(phase) || phase === "return" || phase === "touch";

  if (!line) return null;

  return (
    <p className="sheet-invite" data-hidden={hidden ? "true" : "false"} aria-hidden="true">
      {line}
    </p>
  );
}
