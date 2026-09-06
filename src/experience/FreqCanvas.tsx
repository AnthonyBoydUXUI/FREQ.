"use client";

import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { DrawingField } from "@/experience/DrawingField";
import { SemanticMeshes } from "@/experience/SemanticMeshes";
import { HelmetTransformation } from "@/experience/HelmetTransformation";
import { InteriorWorld } from "@/experience/InteriorWorld";
import { CameraDirector } from "@/experience/CameraDirector";
import { SceneController } from "@/experience/SceneController";
import { useEngine } from "@/engine/store";
import { profileFor } from "@/quality/detect";
import { isImmersed } from "@/engine/phases";

function SceneLights() {
  const phase = useEngine((s) => s.phase);
  const inside = isImmersed(phase) || phase === "return";
  return (
    <>
      <ambientLight intensity={inside ? 0.32 : 0.44} color="#e8e0d4" />
      <hemisphereLight args={["#f0e8dc", "#2a2723", inside ? 0.32 : 0.52]} />
      <directionalLight
        position={[-2.4, 3.2, 4.2]}
        intensity={inside ? 0.28 : 0.72}
        color="#f3ece1"
      />
      {inside ? (
        <directionalLight
          position={[0, 0.85, 3.4]}
          intensity={0.4}
          color="#f3eee6"
        />
      ) : null}
    </>
  );
}

export default function FreqCanvas({
  onReady,
  xrCompatible = false,
}: {
  onReady?: () => void;
  xrCompatible?: boolean;
}) {
  const quality = useEngine((s) => s.quality);
  const setWebgl = useEngine((s) => s.setWebgl);
  const artworkId = useEngine((s) => s.artworkId);
  const profile = profileFor(quality);

  useEffect(() => {
    setWebgl(true);
  }, [setWebgl]);

  return (
    <Canvas
      className="freq-canvas"
      camera={{ position: [0, 0.02, 4.85], fov: 28, near: 0.05, far: 80 }}
      dpr={profile.dpr}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none" }}
      gl={{
        antialias: profile.antialias,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        if (xrCompatible) {
          gl.xr.enabled = true;
        }
        onReady?.();
      }}
      onPointerMissed={() => {
        const engine = useEngine.getState();
        if (engine.phase === "explore") engine.requestReturn();
      }}
    >
      <SceneLights />
      <Suspense fallback={null} key={artworkId}>
        <DrawingField />
        <SemanticMeshes />
        <HelmetTransformation />
        <InteriorWorld />
      </Suspense>
      <CameraDirector />
      <SceneController />
      <AdaptiveDpr pixelated={false} />
    </Canvas>
  );
}
