"use client";

import { useEffect, useState } from "react";
import { useEngine } from "@/engine/store";
import { isImmersed } from "@/engine/phases";
import type { StrokePoint } from "@/content/artworks";

type EchoPayload = {
  approved: boolean;
  strokes?: StrokePoint[];
};

export function EchoLayer() {
  const artworkId = useEngine((s) => s.artworkId);
  const phase = useEngine((s) => s.phase);
  const hidden = isImmersed(phase) || phase === "return" || phase === "touch";
  const [strokes, setStrokes] = useState<StrokePoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/echo?artworkId=${artworkId}`)
      .then((response) => response.json() as Promise<EchoPayload>)
      .then((payload) => {
        if (cancelled) return;
        setStrokes(payload.approved && payload.strokes ? payload.strokes : []);
      })
      .catch(() => {
        if (!cancelled) setStrokes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [artworkId]);

  if (strokes.length === 0) return null;

  return (
    <div className="echo-layer" data-hidden={hidden ? "true" : "false"} aria-hidden="true">
      {strokes.map((stroke, index) => (
        <span
          key={`${stroke.x}-${stroke.y}-${index}`}
          className="echo-mark"
          style={{
            left: `${stroke.x * 100}%`,
            top: `${stroke.y * 100}%`,
            opacity: 0.12 + stroke.d * 0.28,
            transform: `translate(-50%, -50%) scale(${0.6 + stroke.d})`,
          }}
        />
      ))}
    </div>
  );
}
