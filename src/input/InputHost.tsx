"use client";

import { useEffect } from "react";
import { useEngine } from "@/engine/store";
import { canExplore, canSelectRegion } from "@/engine/phases";
import { regions } from "@/content/artworks";

export function InputHost({ target }: { target: HTMLElement | null }) {
  const setPointer = useEngine((s) => s.setPointer);
  const unlockAudio = useEngine((s) => s.unlockAudio);
  const setRail = useEngine((s) => s.setRail);
  const requestReturn = useEngine((s) => s.requestReturn);
  const selectRegion = useEngine((s) => s.selectRegion);
  const setFocusedRegion = useEngine((s) => s.setFocusedRegion);
  const toggleMuted = useEngine((s) => s.toggleMuted);

  useEffect(() => {
    if (!target) return;

    const toNdc = (event: PointerEvent | WheelEvent) => {
      const rect = target.getBoundingClientRect();
      const x = "clientX" in event ? event.clientX : rect.width / 2;
      const y = "clientY" in event ? event.clientY : rect.height / 2;
      const nx = ((x - rect.left) / rect.width) * 2 - 1;
      const ny = -(((y - rect.top) / rect.height) * 2 - 1);
      return { x: (x - rect.left) / rect.width, y: (y - rect.top) / rect.height, ndcX: nx, ndcY: ny };
    };

    let lastY = 0;
    let dragging = false;

    const onMove = (event: PointerEvent) => {
      const mapped = toNdc(event);
      const pressed = event.buttons > 0 || event.pressure > 0;
      setPointer({
        x: mapped.x,
        y: mapped.y,
        ndcX: mapped.ndcX,
        ndcY: mapped.ndcY,
        active: pressed,
      });
      if (dragging && canExplore(useEngine.getState().phase)) {
        const dy = event.clientY - lastY;
        lastY = event.clientY;
        if (dy !== 0) {
          const { rail } = useEngine.getState();
          setRail(rail + dy * 0.0036);
        }
      }
    };
    const onDown = (event: PointerEvent) => {
      unlockAudio();
      dragging = true;
      lastY = event.clientY;
      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        // Capture is best-effort on older browsers.
      }
      const mapped = toNdc(event);
      setPointer({
        x: mapped.x,
        y: mapped.y,
        ndcX: mapped.ndcX,
        ndcY: mapped.ndcY,
        active: true,
      });
    };
    const onUp = (event: PointerEvent) => {
      dragging = false;
      try {
        if (target.hasPointerCapture(event.pointerId)) {
          target.releasePointerCapture(event.pointerId);
        }
      } catch {
        // ignore
      }
      setPointer({ active: false });
    };
    const onLeave = () => {
      if (!dragging) setPointer({ inside: false, active: false });
    };
    const onWheel = (event: WheelEvent) => {
      const { phase, rail } = useEngine.getState();
      if (!canExplore(phase)) return;
      event.preventDefault();
      setRail(rail + event.deltaY * 0.0007);
    };

    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerdown", onDown);
    target.addEventListener("pointerup", onUp);
    target.addEventListener("pointercancel", onUp);
    target.addEventListener("pointerleave", onLeave);
    target.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerdown", onDown);
      target.removeEventListener("pointerup", onUp);
      target.removeEventListener("pointercancel", onUp);
      target.removeEventListener("pointerleave", onLeave);
      target.removeEventListener("wheel", onWheel);
    };
  }, [target, setPointer, unlockAudio, setRail]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const engine = useEngine.getState();
      if (event.key === "Escape") {
        requestReturn();
      }
      if (event.key === "m" || event.key === "M") {
        toggleMuted();
      }
      if (event.key === "Enter" || event.key === " ") {
        const id = engine.focusedRegionId ?? engine.hoveredRegionId;
        if (id && canSelectRegion(engine.phase)) {
          event.preventDefault();
          selectRegion(id);
        }
      }
      if (event.key === "Tab" && !event.shiftKey && engine.phase !== "explore") {
        const current = engine.focusedRegionId;
        const index = current ? regions.findIndex((region) => region.id === current) : -1;
        const next = regions[(index + 1) % regions.length];
        setFocusedRegion(next.id);
      }
      if (canExplore(engine.phase)) {
        if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
          engine.setRail(engine.rail + 0.04);
        }
        if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
          engine.setRail(engine.rail - 0.04);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestReturn, selectRegion, setFocusedRegion, toggleMuted]);

  return null;
}
