"use client";

import { useEffect, useState } from "react";
import { useEngine } from "@/engine/store";
import { cursorIntent } from "@/ui/guide";

type CursorPos = {
  x: number;
  y: number;
  ready: boolean;
  overUi: boolean;
};

export function FreqCursor() {
  const phase = useEngine((s) => s.phase);
  const hovered = useEngine((s) => s.hoveredRegionId);
  const inside = useEngine((s) => s.pointer.inside);
  const [pos, setPos] = useState<CursorPos>({
    x: 0,
    y: 0,
    ready: false,
    overUi: false,
  });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return undefined;

    const onMove = (event: PointerEvent) => {
      const stage = document.querySelector(".stage");
      if (!(stage instanceof HTMLElement)) return;
      const rect = stage.getBoundingClientRect();
      const overUi =
        event.target instanceof Element &&
        Boolean(event.target.closest("button, a, input, label, .related-mark"));
      setPos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        ready: true,
        overUi,
      });
    };

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const intent = cursorIntent({ phase, hovered, inside });

  return (
    <div
      className="freq-cursor"
      aria-hidden="true"
      data-intent={intent}
      data-ready={pos.ready && !pos.overUi ? "true" : "false"}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
    />
  );
}
