"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { cowlPanels, heroArtwork, regionById } from "@/content/artworks";
import { useEngine } from "@/engine/store";
import { createUvPolygonGeometry } from "@/experience/geometry";

export function HelmetTransformation() {
  const [map, mask] = useTexture(
    [heroArtwork.paths.display, regionById.cowl.mask],
    (loaded) => {
      loaded[0].colorSpace = THREE.SRGBColorSpace;
      loaded[1].colorSpace = THREE.NoColorSpace;
    },
  );
  const phase = useEngine((s) => s.phase);
  const progress = useEngine((s) => s.phaseProgress);
  const reducedMotion = useEngine((s) => s.reducedMotion);
  const group = useRef<THREE.Group>(null);
  const panels = useRef<THREE.Group>(null);

  const cowlGeometry = useMemo(
    () => createUvPolygonGeometry(regionById.cowl.polygon),
    [],
  );
  const panelGeometries = useMemo(
    () => cowlPanels.map((panel) => createUvPolygonGeometry(panel.uv)),
    [],
  );

  useFrame((_, delta) => {
    const transforming =
      phase === "touch" ||
      phase === "transform" ||
      phase === "enter" ||
      phase === "explore" ||
      phase === "return";
    if (!group.current || !panels.current) return;

    const reverse = phase === "return" ? 1 - progress : 1;
    const touch = phase === "touch" ? progress : phase === "encounter" ? 0 : 1;
    const transform =
      phase === "transform" ? progress : phase === "touch" ? 0 : reverse;
    const opened =
      phase === "enter" || phase === "explore"
        ? 1
        : phase === "transform"
          ? Math.max(0, (progress - 0.5) / 0.5)
          : 0;

    const lift = reducedMotion
      ? transform * 0.07
      : 0.016 + touch * 0.04 + transform * 0.26;
    const peel = reducedMotion ? 0 : transform * -0.05;

    group.current.visible = transforming;
    group.current.position.z = THREE.MathUtils.damp(
      group.current.position.z,
      lift,
      2.8,
      delta,
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      peel,
      2.2,
      delta,
    );
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      0,
      2.2,
      delta,
    );

    const showPanels = opened > 0.02 || (phase === "return" && progress < 0.55);
    panels.current.visible = showPanels;
    group.current.children[0].visible = !showPanels || opened < 0.28;

    panels.current.children.forEach((child, index) => {
      const dir = index % 2 === 0 ? 1 : -1;
      const yaw = opened * dir * (0.42 + index * 0.07);
      const pitch = opened * -0.16;
      const z = opened * (0.06 + index * 0.028);
      child.rotation.y = THREE.MathUtils.damp(child.rotation.y, yaw, 2.1, delta);
      child.rotation.x = THREE.MathUtils.damp(child.rotation.x, pitch, 2.1, delta);
      child.position.z = THREE.MathUtils.damp(child.position.z, z, 2.1, delta);
    });
  });

  return (
    <group ref={group} visible={false}>
      <mesh geometry={cowlGeometry} renderOrder={3}>
        <meshBasicMaterial
          map={map}
          alphaMap={mask}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <group ref={panels}>
        {panelGeometries.map((geometry, index) => (
          <mesh key={cowlPanels[index].id} geometry={geometry} renderOrder={4}>
            <meshBasicMaterial
              map={map}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
