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

export default function FreqCanvas() {
  const quality = useEngine((s) => s.quality);
  const setWebgl = useEngine((s) => s.setWebgl);
  const profile = profileFor(quality);

  useEffect(() => {
    setWebgl(true);
  }, [setWebgl]);

  return (
    <Canvas
      className="freq-canvas"
      camera={{ position: [0, 0.02, 4.85], fov: 28, near: 0.05, far: 80 }}
      dpr={profile.dpr}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      gl={{
        antialias: profile.antialias,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
      onPointerMissed={() => {
        const engine = useEngine.getState();
        if (engine.phase === "explore") engine.requestReturn();
      }}
    >
      <ambientLight intensity={0.42} color="#e8e0d4" />
      <hemisphereLight args={["#f0e8dc", "#2a2723", 0.55]} />
      <directionalLight
        position={[-2.4, 3.2, 4.2]}
        intensity={0.85}
        color="#f3ece1"
      />
      <Suspense fallback={null}>
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
