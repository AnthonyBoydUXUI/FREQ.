"use client";

import Link from "next/link";
import { useEngine } from "@/engine/store";

export function SystemChrome() {
  const muted = useEngine((s) => s.muted);
  const volume = useEngine((s) => s.volume);
  const captions = useEngine((s) => s.captions);
  const phase = useEngine((s) => s.phase);
  const hovered = useEngine((s) => s.hoveredRegionId);
  const toggleMuted = useEngine((s) => s.toggleMuted);
  const setVolume = useEngine((s) => s.setVolume);
  const setCaptions = useEngine((s) => s.setCaptions);
  const unlockAudio = useEngine((s) => s.unlockAudio);
  const requestReturn = useEngine((s) => s.requestReturn);
  const webgl = useEngine((s) => s.webgl);

  return (
    <div className="chrome">
      <div className="chrome-left">
        <p className="mark" aria-hidden="true">
          FREQ.
        </p>
        <p className="sr-live" aria-live="polite">
          {phase === "explore"
            ? "Inside the drawing. Drag, scroll, or use arrows to move. The far mark returns you."
            : hovered
              ? `${hovered} is responding.`
              : "The drawing is still."}
        </p>
      </div>

      <div className="chrome-right">
        {phase === "explore" || phase === "enter" ? (
          <button type="button" className="text-button" onClick={requestReturn}>
            Return
          </button>
        ) : null}
        <button
          type="button"
          className="text-button"
          onClick={() => {
            unlockAudio();
            toggleMuted();
          }}
          aria-pressed={!muted}
        >
          {muted ? "Sound" : "Sound on"}
        </button>
        {!muted ? (
          <label className="volume">
            <span className="sr-only">Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => {
                unlockAudio();
                setVolume(Number(event.target.value));
              }}
              aria-label="Volume"
            />
          </label>
        ) : null}
        <button
          type="button"
          className="text-button quiet-control"
          aria-pressed={captions}
          onClick={() => setCaptions(!captions)}
        >
          Captions
        </button>
        <Link className="text-button quiet-control" href="/journey">
          Journey
        </Link>
        {webgl === false ? (
          <span className="quiet">Flat field</span>
        ) : null}
      </div>
    </div>
  );
}
