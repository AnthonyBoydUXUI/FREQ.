"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
        <p className="kicker">Sit and look around</p>
        <h1>Inside</h1>
        <p>
          You do not need a headset. Press Go inside to sit in the world that is
          already in the drawing. Slide to look around. Press Go back when you want
          the picture again. If this device has a headset, Enter VR is the same
          interior, only around you.
        </p>
        <div className="media-actions">
          <button type="button" className="text-button" onClick={() => enterExploreDirectly()}>
            Go inside
          </button>
          {xr.vr ? (
            <button type="button" className="text-button" onClick={() => void enterVr()}>
              Enter VR
            </button>
          ) : (
            <span className="quiet">This device has no headset. Go inside still works.</span>
          )}
          {note ? <p>{note}</p> : null}
        </div>
        <nav className="journey-nav">
          <Link href="/">Back to the picture</Link>
          <Link href="/ar">Look around you</Link>
          <Link href="/journey">Read it instead</Link>
        </nav>
      </div>
      <PhaseTicker />
      <InputHost target={stageEl} sheet={stageEl} />
      <SystemChrome />
      <AudioHost />
    </main>
  );
}
