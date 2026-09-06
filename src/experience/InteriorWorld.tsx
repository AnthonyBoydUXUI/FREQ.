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
  unfoldedFragment,
  unfoldedVertex,
  uvToLocal,
} from "@/experience/geometry";

const NAVE_LENGTH = 16.5;
const NAVE_WIDTH = 3.55;
const NAVE_HEIGHT = 3.05;

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
        uWrinkle: { value: 0.22 },
      },
      vertexShader: unfoldedVertex,
      fragmentShader: unfoldedFragment,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
    return mat;
  }, [map, depth]);

  const floor = useMemo(
    () =>
      createUvMappedPlane(
        NAVE_WIDTH,
        NAVE_LENGTH,
        { u0: 0.28, v0: 0.32, u1: 0.78, v1: 0.82 },
        24,
        32,
        "near-to-far",
      ),
    [],
  );
  const leftWall = useMemo(
    () =>
      createUvMappedPlane(NAVE_LENGTH, NAVE_HEIGHT, {
        u0: 0.0,
        v0: 0.02,
        u1: 0.22,
        v1: 0.92,
      }),
    [],
  );
  const rightWall = useMemo(
    () =>
      createUvMappedPlane(NAVE_LENGTH, NAVE_HEIGHT, {
        u0: 0.78,
        v0: 0.02,
        u1: 1.0,
        v1: 0.92,
      }),
    [],
  );
  const vault = useMemo(
    () =>
      createUvMappedPlane(NAVE_WIDTH, NAVE_LENGTH, {
        u0: 0.22,
        v0: 0.02,
        u1: 0.68,
        v1: 0.34,
      }),
    [],
  );
  const farPaper = useMemo(
    () =>
      createUvMappedPlane(NAVE_WIDTH * 1.08, NAVE_HEIGHT * 1.12, {
        u0: 0.0,
        v0: 0.78,
        u1: 1.0,
        v1: 1.0,
      }),
    [],
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
    for (let i = 0; i < count; i += 1) {
      const stroke = graphiteStrokes[i];
      const origin = uvToLocal(stroke.x, stroke.y);
      positions[i * 3] = origin.x * 1.9;
      positions[i * 3 + 1] = 0.28 + stroke.d * 2.15 + (1 - stroke.y) * 0.25;
      positions[i * 3 + 2] = -0.9 - stroke.y * NAVE_LENGTH;
      const shade = 0.11 + (1 - stroke.d) * 0.22;
      colors[i * 3] = shade;
      colors[i * 3 + 1] = shade;
      colors[i * 3 + 2] = shade * 0.96;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [profile.strokes]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const open = woundAmount(phase, phaseProgress);
    group.current.visible = open > 0.04;
    unfolded.uniforms.uWrinkle.value = THREE.MathUtils.damp(
      unfolded.uniforms.uWrinkle.value as number,
      0.16 + open * 0.12,
      1.8,
      delta,
    );
  });

  const paperDepths = [0.045, 0.11, 0.19, 0.3];

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
        position={[0, 0, -NAVE_LENGTH / 2]}
        material={unfolded}
      />
      <mesh
        geometry={leftWall}
        rotation={[0, Math.PI / 2, 0]}
        position={[-NAVE_WIDTH / 2, NAVE_HEIGHT / 2, -NAVE_LENGTH / 2]}
        material={unfolded}
      />
      <mesh
        geometry={rightWall}
        rotation={[0, -Math.PI / 2, 0]}
        position={[NAVE_WIDTH / 2, NAVE_HEIGHT / 2, -NAVE_LENGTH / 2]}
        material={unfolded}
      />
      <mesh
        geometry={vault}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, NAVE_HEIGHT, -NAVE_LENGTH / 2]}
        material={unfolded}
      />
      <mesh
        geometry={farPaper}
        position={[0, NAVE_HEIGHT / 2, -NAVE_LENGTH + 0.2]}
        material={unfolded}
      />

      <mesh
        geometry={originMark}
        position={[0, 1.15, -NAVE_LENGTH + 0.55]}
        scale={[5.4, 5.4, 5.4]}
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
