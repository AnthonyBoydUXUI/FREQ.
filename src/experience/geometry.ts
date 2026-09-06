import * as THREE from "three";
import { DRAWING_HEIGHT, DRAWING_WIDTH } from "@/engine/types";
import type { Vec2 } from "@/engine/types";

export type ImageUvRect = {
  u0: number;
  v0: number;
  u1: number;
  v1: number;
};

export function uvToLocal(u: number, vImage: number): THREE.Vector3 {
  const x = (u - 0.5) * DRAWING_WIDTH;
  const y = (0.5 - vImage) * DRAWING_HEIGHT;
  return new THREE.Vector3(x, y, 0);
}

export function imageToThreeUv(u: number, vImage: number): readonly [number, number] {
  return [u, 1 - vImage];
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

/** Stretch one rectangle of the source photograph onto a plane. Image v = 0 at the top. */
export function createUvMappedPlane(
  width: number,
  height: number,
  uvRect: ImageUvRect,
  widthSegments = 24,
  heightSegments = 32,
  vAlong: "upright" | "near-to-far" = "upright",
): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i += 1) {
    const pu = uv.getX(i);
    const pv = uv.getY(i);
    const imageU = uvRect.u0 + (uvRect.u1 - uvRect.u0) * pu;
    const imageV =
      vAlong === "near-to-far"
        ? uvRect.v0 + (uvRect.v1 - uvRect.v0) * pv
        : uvRect.v1 + (uvRect.v0 - uvRect.v1) * pv;
    uv.setXY(i, imageU, 1 - imageV);
  }
  uv.needsUpdate = true;
  return geometry;
}

export const drawingVertex = /* glsl */ `
uniform sampler2D uDepth;
uniform vec2 uPointer;
uniform float uHover;
uniform float uTime;
uniform float uBreath;
uniform float uLift;
varying vec2 vUv;
varying float vDepth;
varying float vHover;

void main() {
  vUv = uv;
  float depth = texture2D(uDepth, uv).r;
  vDepth = depth;
  float dist = distance(uv, uPointer);
  float hover = smoothstep(0.26, 0.0, dist) * uHover;
  vHover = hover;
  vec3 pos = position;
  // Wrinkles and graphite pressure from the photograph — not a sculpted mesh.
  pos.z += (depth - 0.38) * 0.12 * uLift;
  // Attention separates the mark from the paper. Darker hatching lifts more.
  pos.z += hover * mix(0.012, 0.09, depth);
  pos.z += sin(uTime * 0.22 + depth * 7.0) * 0.0018 * uBreath;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const drawingFragment = /* glsl */ `
uniform sampler2D uMap;
uniform sampler2D uPaper;
uniform sampler2D uMask;
uniform float uWound;
varying vec2 vUv;
varying float vDepth;
varying float vHover;

void main() {
  vec3 faithful = texture2D(uMap, vUv).rgb;
  vec3 paper = texture2D(uPaper, vUv).rgb;
  // Hover is line-separation, not a grade. Graphite darkens; paper stays.
  vec3 separated = mix(faithful * 1.015, faithful * 0.82, vDepth);
  vec3 color = mix(faithful, separated, vHover * 0.45);
  float mask = texture2D(uMask, vUv).r;
  float hole = mask * uWound;
  float edge = smoothstep(0.04, 0.32, hole) * (1.0 - smoothstep(0.42, 0.82, hole));
  color = mix(color, mix(color, paper * 0.62, 0.8), edge);
  if (!gl_FrontFacing) {
    color = paper * 0.88;
  }
  if (hole > 0.62) discard;
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`;

export const unfoldedVertex = /* glsl */ `
uniform sampler2D uDepth;
uniform float uWrinkle;
varying vec2 vUv;
varying float vDepth;

void main() {
  vUv = uv;
  float depth = texture2D(uDepth, uv).r;
  vDepth = depth;
  vec3 pos = position;
  pos.z += (depth - 0.42) * uWrinkle;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const unfoldedFragment = /* glsl */ `
uniform sampler2D uMap;
varying vec2 vUv;

void main() {
  vec3 color = texture2D(uMap, vUv).rgb;
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`;
