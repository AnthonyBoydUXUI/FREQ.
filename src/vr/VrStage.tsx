"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { artworkById, portalFor } from "@/content/artworks";
import { useEngine } from "@/engine/store";
import { detectXr, navigatorXr } from "@/xr/session";
import { SystemChrome } from "@/ui/SystemChrome";
import { PhaseTicker } from "@/ui/PhaseTicker";
import { AudioHost } from "@/audio/AudioHost";
import { InputHost } from "@/input/InputHost";
import { report } from "@/engine/report";

const FreqCanvas = dynamic(() => import("@/experience/FreqCanvas"), {
  ssr: false,
  loading: () => null,
});

export function VrStage() {
  const boot = useEngine((s) => s.boot);
  const enterExploreDirectly = useEngine((s) => s.enterExploreDirectly);
  const artworkId = useEngine((s) => s.artworkId);
  const artwork = artworkById[artworkId];
  const portal = portalFor(artworkId);
  const phase = useEngine((s) => s.phase);
  const [xr, setXr] = useState({ ar: false, vr: false });
  const [note, setNote] = useState<string | null>(null);
  const [stageEl, setStageEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    boot();
    report("first_visual");
    void detectXr(navigatorXr()).then(setXr);
  }, [boot]);

  async function enterVr() {
    const xrNav = navigatorXr();
    if (!xrNav?.requestSession) {
      setNote("This browser does not offer WebXR. The seated world is open below.");
      enterExploreDirectly();
      return;
    }
    try {
      await xrNav.requestSession("immersive-vr", { optionalFeatures: ["local-floor"] });
      enterExploreDirectly();
      setNote("WebXR VR session started. You are inside the drawing.");
    } catch {
      enterExploreDirectly();
      setNote("WebXR could not start. The seated world is the same interior.");
    }
  }

  return (
    <main className="media-stage vr-stage" data-phase={phase} ref={setStageEl}>
      <div className="vr-field">
        <FreqCanvas xrCompatible />
      </div>
      <div className="media-chrome">
        <p className="kicker">Seated world</p>
        <h1>VR</h1>
        <p>
          The {portal.label.toLowerCase()} of {artwork.title} is the door. Enter seated
          if a headset is not present. The interior is still this photograph.
        </p>
        <div className="media-actions">
          <button type="button" className="text-button" onClick={() => enterExploreDirectly()}>
            Enter seated
          </button>
          {xr.vr ? (
            <button type="button" className="text-button" onClick={() => void enterVr()}>
              Enter VR
            </button>
          ) : (
            <span className="quiet">WebXR VR is not on this device</span>
          )}
          {note ? <p>{note}</p> : null}
        </div>
        <nav className="journey-nav">
          <Link href="/">Return to the drawing</Link>
          <Link href="/ar">AR</Link>
          <Link href="/journey">Journey</Link>
        </nav>
      </div>
      <PhaseTicker />
      <InputHost target={stageEl} sheet={stageEl} />
      <SystemChrome />
      <AudioHost />
    </main>
  );
}
