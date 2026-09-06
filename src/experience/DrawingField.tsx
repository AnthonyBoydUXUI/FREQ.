"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { heroArtwork, regionById } from "@/content/artworks";
import { DRAWING_HEIGHT, DRAWING_WIDTH } from "@/engine/types";
import { useEngine } from "@/engine/store";
import { drawingFragment, drawingVertex } from "@/experience/geometry";
import { profileFor } from "@/quality/detect";
import { seedUnit } from "@/engine/dailySeed";
import { woundAmount } from "@/engine/phases";

export function DrawingField() {
  const [map, depth, paper, mask] = useTexture(
    [
      heroArtwork.paths.display,
      heroArtwork.paths.depth,
      heroArtwork.paths.paper,
      regionById.cowl.mask,
    ],
    (loaded) => {
      loaded[0].colorSpace = THREE.SRGBColorSpace;
      loaded[1].colorSpace = THREE.NoColorSpace;
      loaded[2].colorSpace = THREE.SRGBColorSpace;
      loaded[3].colorSpace = THREE.NoColorSpace;
    },
  );
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: map },
        uDepth: { value: depth },
        uPaper: { value: paper },
        uMask: { value: mask },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uHover: { value: 0 },
        uTime: { value: 0 },
        uBreath: { value: 1 },
        uLift: { value: 0.35 },
        uWound: { value: 0 },
      },
      vertexShader: drawingVertex,
      fragmentShader: drawingFragment,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
    return mat;
  }, [map, depth, paper, mask]);

  const phase = useEngine((s) => s.phase);
  const phaseProgress = useEngine((s) => s.phaseProgress);
  const pointer = useEngine((s) => s.pointer);
  const hovered = useEngine((s) => s.hoveredRegionId);
  const transformation = useEngine((s) => s.transformation);
  const reducedMotion = useEngine((s) => s.reducedMotion);
  const quality = useEngine((s) => s.quality);
  const seed = useEngine((s) => s.seed);
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const uniforms = material.uniforms;
    uniforms.uTime.value += delta;
    uniforms.uPointer.value.set(pointer.u, 1 - pointer.v);
    uniforms.uHover.value = THREE.MathUtils.damp(
      uniforms.uHover.value as number,
      hovered || pointer.inside ? 1 : 0,
      4,
      delta,
    );
    const profile = profileFor(quality);
    uniforms.uBreath.value = reducedMotion
      ? 0
      : profile.displacement * (0.55 + seedUnit(seed, 1) * 0.35);
    uniforms.uLift.value = 0.72 + transformation * 0.55;
    uniforms.uWound.value = THREE.MathUtils.damp(
      uniforms.uWound.value as number,
      woundAmount(phase, phaseProgress),
      reducedMotion ? 8 : 2.4,
      delta,
    );

    if (group.current) {
      const still =
        phase === "encounter" || phase === "notice" || phase === "boot";
      const tiltX = reducedMotion || !still ? 0 : pointer.ndcY * -0.022;
      const tiltY = reducedMotion || !still ? 0 : pointer.ndcX * 0.026;
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        tiltX,
        3,
        delta,
      );
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        tiltY,
        3,
        delta,
      );
      group.current.position.z = THREE.MathUtils.damp(
        group.current.position.z,
        0,
        2.8,
        delta,
      );
    }
  });

  return (
    <group ref={group}>
      <mesh renderOrder={1} userData={{ freq: "drawing" }}>
        <planeGeometry args={[DRAWING_WIDTH, DRAWING_HEIGHT, 72, 96]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}
