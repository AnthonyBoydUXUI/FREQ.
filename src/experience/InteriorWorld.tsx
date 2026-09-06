"use client";

import { useMemo, useRef } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { graphiteStrokes, heroArtwork, regionById } from "@/content/artworks";
import { useEngine } from "@/engine/store";
import { profileFor } from "@/quality/detect";
import { woundAmount } from "@/engine/phases";
import {
  createUvMappedPlane,
  createUvPolygonGeometry,
  planeSizeFromUv,
  unfoldedFragment,
  unfoldedVertex,
  uvToLocal,
} from "@/experience/geometry";

const SCALE = 2.55;

const FLOOR_UV = { u0: 0.24, v0: 0.3, u1: 0.8, v1: 0.9 };
const LEFT_UV = { u0: 0.0, v0: 0.02, u1: 0.36, v1: 0.6 };
const RIGHT_UV = { u0: 0.64, v0: 0.08, u1: 1.0, v1: 0.82 };
const VAULT_UV = { u0: 0.18, v0: 0.02, u1: 0.74, v1: 0.38 };
const TAPE_UV = { u0: 0.05, v0: 0.62, u1: 0.95, v1: 1.0 };

export function InteriorWorld() {
  const [map, depth, paper] = useTexture(
    [heroArtwork.paths.display, heroArtwork.paths.depth, heroArtwork.paths.paper],
    (loaded) => {
      loaded[0].colorSpace = THREE.SRGBColorSpace;
      loaded[1].colorSpace = THREE.NoColorSpace;
      loaded[2].colorSpace = THREE.SRGBColorSpace;
    },
  );
  const phase = useEngine((s) => s.phase);
  const phaseProgress = useEngine((s) => s.phaseProgress);
  const quality = useEngine((s) => s.quality);
  const group = useRef<THREE.Group>(null);
  const requestReturn = useEngine((s) => s.requestReturn);

  const unfolded = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: map },
        uDepth: { value: depth },
        uWrinkle: { value: 0.18 },
      },
      vertexShader: unfoldedVertex,
      fragmentShader: unfoldedFragment,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
    return mat;
  }, [map, depth]);

  const floorSize = planeSizeFromUv(FLOOR_UV, SCALE);
  const leftSize = planeSizeFromUv(LEFT_UV, SCALE);
  const rightSize = planeSizeFromUv(RIGHT_UV, SCALE);
  const vaultSize = planeSizeFromUv(VAULT_UV, SCALE);
  const tapeSize = planeSizeFromUv(TAPE_UV, SCALE);

  const floor = useMemo(
    () => createUvMappedPlane(floorSize.width, floorSize.height, FLOOR_UV, 24, 32, "near-to-far"),
    [floorSize.height, floorSize.width],
  );
  const leftWall = useMemo(
    () => createUvMappedPlane(leftSize.width, leftSize.height, LEFT_UV),
    [leftSize.height, leftSize.width],
  );
  const rightWall = useMemo(
    () => createUvMappedPlane(rightSize.width, rightSize.height, RIGHT_UV),
    [rightSize.height, rightSize.width],
  );
  const vault = useMemo(
    () => createUvMappedPlane(vaultSize.width, vaultSize.height, VAULT_UV),
    [vaultSize.height, vaultSize.width],
  );
  const farTape = useMemo(
    () => createUvMappedPlane(tapeSize.width, tapeSize.height, TAPE_UV),
    [tapeSize.height, tapeSize.width],
  );
  const originMark = useMemo(
    () => createUvPolygonGeometry(regionById.cowl.polygon),
    [],
  );
  const woundRing = useMemo(
    () => createUvPolygonGeometry(regionById.cowl.polygon),
    [],
  );

  const profile = profileFor(quality);
  const points = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = Math.min(profile.strokes, graphiteStrokes.length);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const depth = floorSize.height;
    for (let i = 0; i < count; i += 1) {
      const stroke = graphiteStrokes[i];
      const origin = uvToLocal(stroke.x, stroke.y);
      positions[i * 3] = origin.x * SCALE * 0.92;
      positions[i * 3 + 1] = 0.22 + stroke.d * 1.55;
      positions[i * 3 + 2] = -0.55 - stroke.y * depth;
      const shade = 0.11 + (1 - stroke.d) * 0.22;
      colors[i * 3] = shade;
      colors[i * 3 + 1] = shade;
      colors[i * 3 + 2] = shade * 0.96;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [floorSize.height, profile.strokes]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const open = woundAmount(phase, phaseProgress);
    group.current.visible = open > 0.04;
    unfolded.uniforms.uWrinkle.value = THREE.MathUtils.damp(
      unfolded.uniforms.uWrinkle.value as number,
      0.12 + open * 0.1,
      1.8,
      delta,
    );
  });

  const paperDepths = [0.045, 0.11, 0.19, 0.3];
  const floorZ = -0.45 - floorSize.height / 2;
  const midZ = floorZ;

  return (
    <group ref={group} visible={false}>
      {paperDepths.map((z) => (
        <mesh
          key={`wound-${z}`}
          geometry={woundRing}
          position={[0, 0, -z]}
          renderOrder={2}
        >
          <meshBasicMaterial
            map={paper}
            color="#d8cfc2"
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}

      <mesh
        geometry={floor}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, floorZ]}
        material={unfolded}
      />
      <mesh
        geometry={leftWall}
        rotation={[0, 0.62, 0]}
        position={[-floorSize.width * 0.38, leftSize.height / 2, midZ - 0.35]}
        material={unfolded}
      />
      <mesh
        geometry={rightWall}
        rotation={[0, -0.58, 0]}
        position={[floorSize.width * 0.38, rightSize.height / 2, midZ - 0.55]}
        material={unfolded}
      />
      <mesh
        geometry={vault}
        rotation={[1.22, 0, 0]}
        position={[0, 1.72, midZ - 0.15]}
        material={unfolded}
      />
      <mesh
        geometry={farTape}
        position={[0, tapeSize.height / 2 + 0.12, floorZ - floorSize.height / 2 + 0.15]}
        material={unfolded}
      />

      <mesh
        geometry={originMark}
        position={[0, 1.05, floorZ - floorSize.height / 2 + 0.55]}
        scale={[SCALE, SCALE, SCALE]}
        onClick={(event) => {
          event.stopPropagation();
          requestReturn();
        }}
      >
        <meshBasicMaterial
          map={map}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {profile.particles ? (
        <points geometry={points}>
          <pointsMaterial
            size={0.02}
            vertexColors
            transparent
            opacity={0.78}
            sizeAttenuation
            depthWrite={false}
          />
        </points>
      ) : null}
    </group>
  );
}
