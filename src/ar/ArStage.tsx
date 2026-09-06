"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { artworkById } from "@/content/artworks";
import { useEngine } from "@/engine/store";
import { detectXr, navigatorXr, type XrMode } from "@/xr/session";

export function ArStage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const artworkId = useEngine((s) => s.artworkId);
  const artwork = artworkById[artworkId];
  const [camera, setCamera] = useState<"idle" | "live" | "denied">("idle");
  const [xr, setXr] = useState({ ar: false, vr: false });
  const [xrNote, setXrNote] = useState<string | null>(null);

  useEffect(() => {
    void detectXr(navigatorXr()).then(setXr);
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamera("live");
    } catch {
      setCamera("denied");
    }
  }

  async function enterXr(mode: XrMode) {
    const xrNav = navigatorXr();
    if (!xrNav?.requestSession) {
      setXrNote("This browser does not offer WebXR.");
      return;
    }
    try {
      await xrNav.requestSession(mode, { optionalFeatures: ["local-floor", "dom-overlay"] });
      setXrNote("WebXR session started. The drawing remains a sheet of paper in the room.");
    } catch {
      setXrNote("WebXR could not start. The camera overlay is the room.");
    }
  }

  return (
    <main className="media-stage ar-stage">
      <video
        ref={videoRef}
        className="ar-video"
        playsInline
        muted
        autoPlay
        data-live={camera === "live" ? "true" : "false"}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="ar-paper"
        src={artwork.paths.display}
        alt={artwork.alt}
        width={artwork.width}
        height={artwork.height}
      />
      <div className="media-chrome">
        <p className="kicker">The drawing in the room</p>
        <h1>Look around you</h1>
        <p>
          Press Open camera, then point the phone at a table. The drawing sits
          there as a sheet of paper. That is the whole AR gesture: paper in the
          room, not a 3D object. Press Back to the picture when you are done.
        </p>
        <div className="media-actions">
          <button type="button" className="text-button" onClick={() => void startCamera()}>
            {camera === "live" ? "Camera is on" : "Open camera"}
          </button>
          {xr.ar ? (
            <button type="button" className="text-button" onClick={() => void enterXr("immersive-ar")}>
              Enter AR
            </button>
          ) : (
            <span className="quiet">This phone cannot do headset AR. Open camera still works.</span>
          )}
          {camera === "denied" ? (
            <p>The camera was not allowed. The drawing is still here as paper.</p>
          ) : null}
          {xrNote ? <p>{xrNote}</p> : null}
        </div>
        <nav className="journey-nav">
          <Link href="/">Back to the picture</Link>
          <Link href="/vr">Sit and look around</Link>
          <Link href="/journey">Read it instead</Link>
        </nav>
      </div>
    </main>
  );
}
