"use client";

import { useEffect } from "react";
import { useEngine } from "@/engine/store";
import { canExplore, canSelectRegion } from "@/engine/phases";
import { portalFor, regionsFor } from "@/content/artworks";
import { clientToSheetUv, regionAt } from "@/semantic/hitTest";

const TAP_PX = 16;

export function InputHost({
  target,
  sheet,
}: {
  target: HTMLElement | null;
  sheet: HTMLElement | null;
}) {
  const setPointer = useEngine((s) => s.setPointer);
  const unlockAudio = useEngine((s) => s.unlockAudio);
  const setRail = useEngine((s) => s.setRail);
  const requestReturn = useEngine((s) => s.requestReturn);
  const selectRegion = useEngine((s) => s.selectRegion);
  const enterWorld = useEngine((s) => s.enterWorld);
  const rememberVisit = useEngine((s) => s.rememberVisit);
  const setFocusedRegion = useEngine((s) => s.setFocusedRegion);
  const setHoveredRegion = useEngine((s) => s.setHoveredRegion);
  const toggleMuted = useEngine((s) => s.toggleMuted);
  const artworkId = useEngine((s) => s.artworkId);

  useEffect(() => {
    if (!target) return;

    const toNdc = (event: PointerEvent | WheelEvent) => {
      const rect = target.getBoundingClientRect();
      const x = "clientX" in event ? event.clientX : rect.width / 2;
      const y = "clientY" in event ? event.clientY : rect.height / 2;
      const nx = ((x - rect.left) / rect.width) * 2 - 1;
      const ny = -(((y - rect.top) / rect.height) * 2 - 1);
      const sheetRect = sheet?.getBoundingClientRect();
      const uv = sheetRect
        ? clientToSheetUv(x, y, sheetRect)
        : { u: (x - rect.left) / rect.width, v: (y - rect.top) / rect.height, inside: true };
      return {
        x: (x - rect.left) / rect.width,
        y: (y - rect.top) / rect.height,
        ndcX: nx,
        ndcY: ny,
        u: uv.u,
        v: uv.v,
        inside: uv.inside,
      };
    };

    let lastY = 0;
    let dragging = false;
    let downX = 0;
    let downY = 0;

    const fromUi = (event: Event) =>
      event.target instanceof Element &&
      Boolean(event.target.closest(".chrome, .related-mark, .skip-link, .media-chrome"));

    const onMove = (event: PointerEvent) => {
      if (fromUi(event) && !dragging) return;
      const mapped = toNdc(event);
      const pressed = event.buttons > 0 || event.pressure > 0;
      setPointer({
        x: mapped.x,
        y: mapped.y,
        ndcX: mapped.ndcX,
        ndcY: mapped.ndcY,
        u: mapped.u,
        v: mapped.v,
        inside: mapped.inside,
        active: pressed,
      });
      const engine = useEngine.getState();
      const currentRegions = regionsFor(engine.artworkId);
      if (canSelectRegion(engine.phase)) {
        const region = mapped.inside ? regionAt(mapped.u, mapped.v, currentRegions) : null;
        if (region !== engine.hoveredRegionId) setHoveredRegion(region);
      }
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
      if (fromUi(event)) return;
      unlockAudio();
      dragging = true;
      lastY = event.clientY;
      downX = event.clientX;
      downY = event.clientY;
      if (canExplore(useEngine.getState().phase)) {
        try {
          target.setPointerCapture(event.pointerId);
        } catch {
          // Capture is best-effort on older browsers.
        }
      }
      const mapped = toNdc(event);
      setPointer({
        x: mapped.x,
        y: mapped.y,
        ndcX: mapped.ndcX,
        ndcY: mapped.ndcY,
        u: mapped.u,
        v: mapped.v,
        inside: mapped.inside,
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
      const mapped = toNdc(event);
      const travel = Math.hypot(event.clientX - downX, event.clientY - downY);
      const engine = useEngine.getState();
      if (
        !fromUi(event) &&
        travel <= TAP_PX &&
        mapped.inside &&
        canSelectRegion(engine.phase)
      ) {
        rememberVisit(portalFor(engine.artworkId).id);
        enterWorld();
      }
      setPointer({
        x: mapped.x,
        y: mapped.y,
        ndcX: mapped.ndcX,
        ndcY: mapped.ndcY,
        u: mapped.u,
        v: mapped.v,
        inside: mapped.inside,
        active: false,
      });
      if (event.pointerType !== "mouse") {
        setHoveredRegion(null);
      }
    };
    const onLeave = () => {
      if (!dragging) {
        setPointer({ inside: false, active: false });
        setHoveredRegion(null);
      }
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
  }, [
    target,
    sheet,
    artworkId,
    setPointer,
    unlockAudio,
    setRail,
    enterWorld,
    rememberVisit,
    setHoveredRegion,
  ]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const engine = useEngine.getState();
      const currentRegions = regionsFor(engine.artworkId);
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
        const index = current
          ? currentRegions.findIndex((region) => region.id === current)
          : -1;
        const next = currentRegions[(index + 1) % currentRegions.length];
        if (next) setFocusedRegion(next.id);
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
  }, [requestReturn, selectRegion, setFocusedRegion, toggleMuted, artworkId]);

  return null;
}
