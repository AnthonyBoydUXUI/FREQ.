"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { regions } from "@/content/artworks";
import { useEngine } from "@/engine/store";
import { canSelectRegion } from "@/engine/phases";
import { createUvPolygonGeometry } from "@/experience/geometry";
import type { RegionId } from "@/engine/types";

export function SemanticMeshes() {
  const setHoveredRegion = useEngine((s) => s.setHoveredRegion);
  const selectRegion = useEngine((s) => s.selectRegion);
  const rememberVisit = useEngine((s) => s.rememberVisit);
  const unlockAudio = useEngine((s) => s.unlockAudio);
  const phase = useEngine((s) => s.phase);

  const geometries = useMemo(
    () =>
      Object.fromEntries(
        regions.map((region) => [region.id, createUvPolygonGeometry(region.polygon)]),
      ) as Record<RegionId, THREE.BufferGeometry>,
    [],
  );

  return (
    <group>
      {regions.map((region) => (
        <mesh
          key={region.id}
          geometry={geometries[region.id]}
          position={[0, 0, 0.01]}
          onPointerOver={(event) => {
            event.stopPropagation();
            if (typeof navigator !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate(8);
            }
            setHoveredRegion(region.id);
          }}
          onPointerOut={(event) => {
            event.stopPropagation();
            if (useEngine.getState().hoveredRegionId === region.id) {
              setHoveredRegion(null);
            }
          }}
          onClick={(event) => {
            event.stopPropagation();
            unlockAudio();
            rememberVisit(region.id);
            if (canSelectRegion(phase) || phase === "explore") {
              selectRegion(region.id);
            }
          }}
        >
          <meshBasicMaterial
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
