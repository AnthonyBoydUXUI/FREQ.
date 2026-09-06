"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { heroArtwork } from "@/content/artworks";
import { useEngine } from "@/engine/store";
import { SystemChrome } from "@/ui/SystemChrome";
import { RelatedMarks } from "@/ui/RelatedMarks";
import { SemanticHtmlLayer } from "@/ui/SemanticHtmlLayer";
import { InputHost } from "@/input/InputHost";
import { AudioHost } from "@/audio/AudioHost";
import { Fallback2D } from "@/experience/Fallback2D";
import { FreqCursor } from "@/ui/FreqCursor";
import { SheetHover } from "@/ui/SheetHover";
import { PhaseTicker } from "@/ui/PhaseTicker";
import { cursorIntent } from "@/ui/guide";
import { canSelectRegion, isImmersed } from "@/engine/phases";
import { report } from "@/engine/report";

const FreqCanvas = dynamic(() => import("@/experience/FreqCanvas"), {
  ssr: false,
  loading: () => null,
});

export function FreqStage() {
  const [stageEl, setStageEl] = useState<HTMLElement | null>(null);
  const [sheetEl, setSheetEl] = useState<HTMLElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const boot = useEngine((s) => s.boot);
  const webgl = useEngine((s) => s.webgl);
  const phase = useEngine((s) => s.phase);
  const hovered = useEngine((s) => s.hoveredRegionId);
  const inside = useEngine((s) => s.pointer.inside);

  useEffect(() => {
    boot();
    report("first_visual");
  }, [boot]);

  useEffect(() => {
    document.documentElement.dataset.phase = phase;
  }, [phase]);

  const immersed = isImmersed(phase) || phase === "return";
  const intent = cursorIntent({ phase, hovered, inside });

  return (
    <section
      ref={setStageEl}
      className="stage"
      data-immersed={immersed ? "true" : "false"}
      data-intent={intent}
      data-inside={inside ? "true" : "false"}
    >
      <h1 className="sr-only">FREQ.</h1>
      <p className="sr-only">
        The drawing is the interface. Move over it. Touch it to enter the world
        inside the helmet. Facet and Signal are the other two drawings. Journey
        is a still path through the same meaning.
      </p>
      <div
        className="drawing-frame"
        ref={setSheetEl}
        data-hovered={hovered ?? "none"}
        onPointerUp={(event) => {
          if (event.button !== 0) return;
          const engine = useEngine.getState();
          if (!canSelectRegion(engine.phase)) return;
          engine.unlockAudio();
          engine.rememberVisit("cowl");
          engine.enterWorld();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroArtwork.paths.display}
          alt={heroArtwork.alt}
          className="poster"
          width={heroArtwork.width}
          height={heroArtwork.height}
          data-hidden={canvasReady && webgl === true ? "true" : "false"}
        />
        {webgl !== false ? <FreqCanvas onReady={() => setCanvasReady(true)} /> : null}
        {webgl === false ? <Fallback2D /> : null}
        <SheetHover />
        <SemanticHtmlLayer enabled />
      </div>
      <RelatedMarks />
      <InputHost target={stageEl} sheet={sheetEl} />
      <PhaseTicker />
      <FreqCursor />
      <SystemChrome />
      <AudioHost />
    </section>
  );
}
