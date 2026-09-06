"use client";

import { useMemo, useRef } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cowlPanels, graphiteStrokes, heroArtwork, regionById } from "@/content/artworks";
import { useEngine } from "@/engine/store";
import { profileFor } from "@/quality/detect";
import { isImmersed } from "@/engine/phases";
import { createUvPolygonGeometry, uvToLocal } from "@/experience/geometry";

export function InteriorWorld() {
  const map = useTexture(heroArtwork.paths.display);
  const paper = useTexture(heroArtwork.paths.paper);
  const linework = useTexture(heroArtwork.paths.linework);
  const phase = useEngine((s) => s.phase);
  const quality = useEngine((s) => s.quality);
  const group = useRef<THREE.Group>(null);
  const requestReturn = useEngine((s) => s.requestReturn);

  const panelGeometries = useMemo(
    () => cowlPanels.map((panel) => createUvPolygonGeometry(panel.uv)),
    [],
  );
  const cowlMonument = useMemo(
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
      positions[i * 3] = origin.x * 3.4;
      positions[i * 3 + 1] = 0.55 + stroke.d * 2.6;
      positions[i * 3 + 2] = -4.2 - stroke.y * 14.5;
      const shade = 0.2 + stroke.d * 0.32;
      colors[i * 3] = shade;
      colors[i * 3 + 1] = shade * 0.96;
      colors[i * 3 + 2] = shade * 0.88;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [profile.strokes]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const visible = isImmersed(phase) || phase === "return";
    const target = visible ? 1 : 0;
    const current = (group.current.userData.opacity as number | undefined) ?? 0;
    const next = THREE.MathUtils.damp(current, target, 1.8, delta);
    group.current.userData.opacity = next;
    group.current.visible = next > 0.02;
    group.current.traverse((child) => {
      const mesh = child as THREE.Mesh;
      const material = mesh.material;
      if (material && !Array.isArray(material) && "opacity" in material) {
        const mat = material as THREE.MeshStandardMaterial;
        mat.transparent = true;
        mat.opacity = next;
      }
    });
  });

  return (
    <group ref={group} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]} receiveShadow>
        <planeGeometry args={[18, 28]} />
        <meshStandardMaterial map={paper} roughness={0.95} metalness={0} color="#d9d0c3" />
      </mesh>
      <mesh position={[-3.15, 1.7, -10]} rotation={[0, Math.PI / 2.55, 0]}>
        <planeGeometry args={[22, 5.4]} />
        <meshStandardMaterial map={map} roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[3.15, 1.7, -10]} rotation={[0, -Math.PI / 2.55, 0]}>
        <planeGeometry args={[22, 5.4]} />
        <meshStandardMaterial map={linework} roughness={0.92} metalness={0} color="#cfc6b8" />
      </mesh>
      <mesh position={[0, 4.15, -10]} rotation={[Math.PI / 2.35, 0, 0]}>
        <planeGeometry args={[10, 24]} />
        <meshStandardMaterial map={map} roughness={0.93} metalness={0} color="#b7aea1" />
      </mesh>

      {panelGeometries.map((geometry, index) => (
        <mesh
          key={`monument-${cowlPanels[index].id}`}
          geometry={geometry}
          position={[
            (index % 2 === 0 ? -1.15 : 1.15),
            1.35,
            -5.2 - index * 2.15,
          ]}
          rotation={[0, index % 2 === 0 ? 0.55 : -0.55, 0]}
          scale={[6.4, 6.4, 6.4]}
        >
          <meshStandardMaterial
            map={map}
            roughness={0.86}
            metalness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={`tower-${i}`} position={[-2.15 + (i % 2) * 4.3, 1.05, -5 - i * 2.55]}>
          <boxGeometry args={[0.11, 2.15, 0.11]} />
          <meshStandardMaterial color="#2c2a27" roughness={0.8} metalness={0.12} />
        </mesh>
      ))}

      <mesh
        geometry={cowlMonument}
        position={[0, 1.7, -19.2]}
        scale={[8.2, 8.2, 8.2]}
        onClick={(event) => {
          event.stopPropagation();
          requestReturn();
        }}
      >
        <meshStandardMaterial map={map} roughness={0.94} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {profile.particles ? (
        <points geometry={points}>
          <pointsMaterial
            size={0.032}
            vertexColors
            transparent
            opacity={0.7}
            sizeAttenuation
            depthWrite={false}
          />
        </points>
      ) : null}
    </group>
  );
}
