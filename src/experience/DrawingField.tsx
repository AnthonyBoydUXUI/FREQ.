"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { heroArtwork } from "@/content/artworks";
import { DRAWING_HEIGHT, DRAWING_WIDTH } from "@/engine/types";
import { useEngine } from "@/engine/store";
import { isImmersed } from "@/engine/phases";
import { drawingFragment, drawingVertex } from "@/experience/geometry";
import { profileFor } from "@/quality/detect";
import { seedUnit } from "@/engine/dailySeed";

export function DrawingField() {
  const [map, depth, paper] = useTexture(
    [heroArtwork.paths.display, heroArtwork.paths.depth, heroArtwork.paths.paper],
    (loaded) => {
      loaded[0].colorSpace = THREE.SRGBColorSpace;
      loaded[1].colorSpace = THREE.NoColorSpace;
      loaded[2].colorSpace = THREE.SRGBColorSpace;
    },
  );
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: map },
        uDepth: { value: depth },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uHover: { value: 0 },
        uTime: { value: 0 },
        uBreath: { value: 1 },
        uLift: { value: 0.35 },
        uRecede: { value: 0 },
        uFocus: { value: 0 },
        uSepia: { value: 0.22 },
      },
      vertexShader: drawingVertex,
      fragmentShader: drawingFragment,
      toneMapped: false,
    });
    return mat;
  }, [map, depth]);

  const phase = useEngine((s) => s.phase);
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
      hovered || pointer.inside ? 1 : 0.15,
      4,
      delta,
    );
    const profile = profileFor(quality);
    uniforms.uBreath.value = reducedMotion ? 0 : profile.displacement * (0.7 + seedUnit(seed, 1) * 0.4);
    uniforms.uLift.value = 0.28 + transformation * 0.9;
    uniforms.uRecede.value = isImmersed(phase) ? 1 : transformation * 0.4;
    uniforms.uFocus.value = phase === "approach" || phase === "response" ? 0.4 : 0.1;
    uniforms.uSepia.value = 0.18 + seedUnit(seed, 2) * 0.08;

    if (group.current) {
      const tiltX = reducedMotion ? 0 : pointer.ndcY * -0.045;
      const tiltY = reducedMotion ? 0 : pointer.ndcX * 0.05;
      const extra = isImmersed(phase) ? -0.55 * transformation : 0;
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, tiltX + extra, 3, delta);
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, tiltY, 3, delta);
      const recedeZ = isImmersed(phase) ? -1.8 * transformation : 0;
      group.current.position.z = THREE.MathUtils.damp(group.current.position.z, recedeZ, 2.4, delta);
    }
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0, -0.035]} receiveShadow>
        <planeGeometry args={[DRAWING_WIDTH * 1.06, DRAWING_HEIGHT * 1.08, 1, 1]} />
        <meshStandardMaterial
          map={paper}
          roughness={0.96}
          metalness={0}
          color="#e6ddd0"
        />
      </mesh>
      <mesh
        renderOrder={1}
        userData={{ freq: "drawing" }}
      >
        <planeGeometry args={[DRAWING_WIDTH, DRAWING_HEIGHT, 72, 96]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}
