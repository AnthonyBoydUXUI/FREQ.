"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { heroArtwork } from "@/content/artworks";
import { useEngine } from "@/engine/store";
import { SystemChrome } from "@/ui/SystemChrome";
import { SemanticHtmlLayer } from "@/ui/SemanticHtmlLayer";
import { InputHost } from "@/input/InputHost";
import { AudioHost } from "@/audio/AudioHost";
import { Fallback2D } from "@/experience/Fallback2D";
import { isImmersed } from "@/engine/phases";

const FreqCanvas = dynamic(() => import("@/experience/FreqCanvas"), {
  ssr: false,
  loading: () => null,
});

export function FreqStage() {
  const [stageEl, setStageEl] = useState<HTMLElement | null>(null);
  const boot = useEngine((s) => s.boot);
  const webgl = useEngine((s) => s.webgl);
  const phase = useEngine((s) => s.phase);

  useEffect(() => {
    boot();
  }, [boot]);

  useEffect(() => {
    document.documentElement.dataset.phase = phase;
  }, [phase]);

  const immersed = isImmersed(phase) || phase === "return";

  return (
    <section
      ref={setStageEl}
      className="stage"
      data-immersed={immersed ? "true" : "false"}
    >
      <h1 className="sr-only">FREQ.</h1>
      <p className="sr-only">
        A spatial installation made from an original hand drawing. The artwork is
        the interface. Move over the drawing. The vaulted cowl can open into a world.
        An accessible journey is available.
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
      <div className="drawing-frame">
        <SemanticHtmlLayer enabled={webgl === false} />
      </div>
      <InputHost target={stageEl} />
      <SystemChrome />
      <AudioHost />
    </section>
  );
}
