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
import { cursorIntent } from "@/ui/guide";
import { isImmersed } from "@/engine/phases";
import { report } from "@/engine/report";

const FreqCanvas = dynamic(() => import("@/experience/FreqCanvas"), {
  ssr: false,
  loading: () => null,
});

export function FreqStage() {
  const [stageEl, setStageEl] = useState<HTMLElement | null>(null);
  const [sheetEl, setSheetEl] = useState<HTMLElement | null>(null);
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroArtwork.paths.display}
        alt={heroArtwork.alt}
        className="poster"
        width={heroArtwork.width}
        height={heroArtwork.height}
        data-hidden={webgl ? "true" : "false"}
      />
      {webgl === true ? <FreqCanvas /> : null}
      {webgl === false ? <Fallback2D /> : null}
      <div className="drawing-frame" ref={setSheetEl}>
        <SemanticHtmlLayer enabled />
      </div>
      <RelatedMarks />
      <InputHost target={stageEl} sheet={sheetEl} />
      <FreqCursor />
      <SystemChrome />
      <AudioHost />
    </section>
  );
}
