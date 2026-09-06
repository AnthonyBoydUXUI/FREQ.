import * as THREE from "three";
import { DRAWING_HEIGHT, DRAWING_WIDTH } from "@/engine/types";
import type { Vec2 } from "@/engine/types";

export function uvToLocal(u: number, vImage: number): THREE.Vector3 {
  const x = (u - 0.5) * DRAWING_WIDTH;
  const y = (0.5 - vImage) * DRAWING_HEIGHT;
  return new THREE.Vector3(x, y, 0);
}

export function createUvPolygonGeometry(polygon: readonly Vec2[]): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const normals: number[] = [];

  const verts = polygon.map(([u, v]) => {
    const p = uvToLocal(u, v);
    return { p, u, v: 1 - v };
  });

  for (let i = 1; i < verts.length - 1; i += 1) {
    const a = verts[0];
    const b = verts[i];
    const c = verts[i + 1];
    for (const vert of [a, b, c]) {
      positions.push(vert.p.x, vert.p.y, vert.p.z);
      uvs.push(vert.u, vert.v);
      normals.push(0, 0, 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.computeBoundingSphere();
  return geometry;
}

export const drawingVertex = /* glsl */ `
uniform sampler2D uDepth;
uniform vec2 uPointer;
uniform float uHover;
uniform float uTime;
uniform float uBreath;
uniform float uLift;
uniform float uRecede;
uniform float uFocus;
varying vec2 vUv;
varying float vDepth;
varying float vHover;

void main() {
  vUv = uv;
  float depth = texture2D(uDepth, uv).r;
  vDepth = depth;
  float dist = distance(uv, uPointer);
  float hover = smoothstep(0.32, 0.0, dist) * uHover;
  vHover = hover;
  vec3 pos = position;
  pos.z += depth * 0.06 * uLift;
  pos.z += hover * 0.075;
  pos.z += sin(uTime * 0.32 + depth * 10.0) * 0.0038 * uBreath;
  pos.z -= uRecede * 0.04;
  pos.xy += (uv - 0.5) * uFocus * 0.04;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const drawingFragment = /* glsl */ `
uniform sampler2D uMap;
uniform float uSepia;
varying vec2 vUv;
varying float vDepth;
varying float vHover;

void main() {
  vec4 color = texture2D(uMap, vUv);
  vec3 faithful = color.rgb;
  vec3 warm = faithful * vec3(1.015, 0.995, 0.972);
  vec3 receded = mix(warm, warm * 0.82, vDepth * 0.12);
  receded += vec3(0.03, 0.026, 0.02) * vHover;
  receded = mix(receded, faithful, 1.0 - uSepia);
  gl_FragColor = vec4(receded, 1.0);
  #include <colorspace_fragment>
}
`;
