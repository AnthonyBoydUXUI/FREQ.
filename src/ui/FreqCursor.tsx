"use client";

import { useEffect, useState } from "react";
import { useEngine } from "@/engine/store";
import { cursorIntent } from "@/ui/guide";

type CursorPos = {
  x: number;
  y: number;
  ready: boolean;
  overUi: boolean;
  mouse: boolean;
};

function isChromeUi(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest(".chrome, .related-mark, .skip-link"))
  );
}

export function FreqCursor() {
  const phase = useEngine((s) => s.phase);
  const hovered = useEngine((s) => s.hoveredRegionId);
  const inside = useEngine((s) => s.pointer.inside);
  const pressed = useEngine((s) => s.pointer.active);
  const [pos, setPos] = useState<CursorPos>({
    x: 0,
    y: 0,
    ready: false,
    overUi: false,
    mouse: false,
  });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const mouse = event.pointerType !== "touch";
      const stage = document.querySelector(".stage");
      if (!(stage instanceof HTMLElement)) return;
      const rect = stage.getBoundingClientRect();
      setPos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        ready: true,
        overUi: isChromeUi(event.target),
        mouse,
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const intent = cursorIntent({ phase, hovered, inside });
  const visible = pos.ready && pos.mouse && !pos.overUi;

  return (
    <div
      className="freq-cursor"
      aria-hidden="true"
      data-intent={intent}
      data-region={hovered ?? "none"}
      data-pressed={pressed ? "true" : "false"}
      data-ready={visible ? "true" : "false"}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
    >
      <span className="freq-cursor-ring" />
      <span className="freq-cursor-dot" />
    </div>
  );
}
