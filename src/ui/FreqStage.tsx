"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { artworkById, portalFor } from "@/content/artworks";
import type { ArtworkId } from "@/engine/types";
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
import { EchoLayer } from "@/ui/EchoLayer";
import { SheetInvite } from "@/ui/SheetInvite";
import { cursorIntent } from "@/ui/guide";
import { canSelectRegion, isImmersed } from "@/engine/phases";
import { report } from "@/engine/report";

const FreqCanvas = dynamic(() => import("@/experience/FreqCanvas"), {
  ssr: false,
  loading: () => null,
});

export function FreqStage({ artworkId = "armor" }: { artworkId?: ArtworkId }) {
  const [stageEl, setStageEl] = useState<HTMLElement | null>(null);
  const [sheetEl, setSheetEl] = useState<HTMLElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const boot = useEngine((s) => s.boot);
  const setArtwork = useEngine((s) => s.setArtwork);
  const webgl = useEngine((s) => s.webgl);
  const phase = useEngine((s) => s.phase);
  const hovered = useEngine((s) => s.hoveredRegionId);
  const inside = useEngine((s) => s.pointer.inside);
  const currentId = useEngine((s) => s.artworkId);
  const router = useRouter();
  const pathname = usePathname();
  const artwork = artworkById[artworkId];

  useLayoutEffect(() => {
    setArtwork(artworkId);
    boot();
    report("first_visual");
  }, [artworkId, boot, setArtwork]);

  useEffect(() => {
    if (currentId === artworkId) return;
    const expected = currentId === "armor" ? "/" : `/t/${currentId}`;
    if (pathname === expected) return;
    router.replace(expected);
  }, [artworkId, currentId, pathname, router]);

  useEffect(() => {
    document.documentElement.dataset.phase = phase;
    document.documentElement.dataset.artwork = currentId;
  }, [phase, currentId]);

  const immersed = isImmersed(phase) || phase === "return";
  const intent = cursorIntent({ phase, hovered, inside, artworkId: currentId });

  return (
    <section
      ref={setStageEl}
      className="stage"
      data-immersed={immersed ? "true" : "false"}
      data-intent={intent}
      data-inside={inside ? "true" : "false"}
      data-artwork={artworkId}
    >
      <h1 className="sr-only">FREQ.</h1>
      <p className="sr-only">
        Touch the big picture of {artwork.title} to go inside it. The small pictures
        on the sides are other drawings you can open. In the corners you can turn
        sound on, show captions, or read this as a page.
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
          engine.rememberVisit(portalFor(engine.artworkId).id);
          engine.enterWorld();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artwork.paths.display}
          alt={artwork.alt}
          className="poster"
          width={artwork.width}
          height={artwork.height}
          data-hidden={canvasReady && webgl === true ? "true" : "false"}
        />
        {webgl !== false ? <FreqCanvas onReady={() => setCanvasReady(true)} /> : null}
        {webgl === false ? <Fallback2D /> : null}
        <SheetHover artworkId={artworkId} />
        <EchoLayer />
        <SemanticHtmlLayer enabled artworkId={artworkId} />
        <SheetInvite />
      </div>
      <RelatedMarks currentId={artworkId} />
      <InputHost target={stageEl} sheet={sheetEl} />
      <PhaseTicker />
      <FreqCursor />
      <SystemChrome artworkId={artworkId} />
      <AudioHost />
    </section>
  );
}
