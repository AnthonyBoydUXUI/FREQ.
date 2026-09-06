import { describe, expect, it } from "vitest";
import {
  createUvMappedPlane,
  drawingFragment,
  drawingVertex,
  planeSizeFromUv,
} from "@/experience/geometry";
import { DRAWING_HEIGHT, DRAWING_WIDTH } from "@/engine/types";

describe("createUvMappedPlane", () => {
  it("maps image-space UVs onto the plane with v flipped for three.js", () => {
    const geo = createUvMappedPlane(2, 2, { u0: 0.2, v0: 0.1, u1: 0.6, v1: 0.5 }, 1, 1);
    const uv = geo.attributes.uv;
    const us: number[] = [];
    const vs: number[] = [];
    for (let i = 0; i < uv.count; i += 1) {
      us.push(uv.getX(i));
      vs.push(uv.getY(i));
    }
    expect(Math.min(...us)).toBeCloseTo(0.2);
    expect(Math.max(...us)).toBeCloseTo(0.6);
    expect(Math.min(...vs)).toBeCloseTo(0.5);
    expect(Math.max(...vs)).toBeCloseTo(0.9);
  });

  it("can run image v from near to far for unfolded floors", () => {
    const geo = createUvMappedPlane(
      2,
      2,
      { u0: 0.2, v0: 0.3, u1: 0.6, v1: 0.8 },
      1,
      1,
      "near-to-far",
    );
    const uv = geo.attributes.uv;
    const vs: number[] = [];
    for (let i = 0; i < uv.count; i += 1) vs.push(uv.getY(i));
    expect(Math.min(...vs)).toBeCloseTo(0.2);
    expect(Math.max(...vs)).toBeCloseTo(0.7);
  });
});

describe("planeSizeFromUv", () => {
  it("keeps photograph proportions when a region becomes a surface", () => {
    const size = planeSizeFromUv({ u0: 0, v0: 0, u1: 1, v1: 1 }, 2);
    expect(size.width).toBeCloseTo(DRAWING_WIDTH * 2);
    expect(size.height).toBeCloseTo(DRAWING_HEIGHT * 2);
    expect(size.width / size.height).toBeCloseTo(DRAWING_WIDTH / DRAWING_HEIGHT);
  });
});

describe("drawing shaders", () => {
  it("stay faithful to the photograph instead of grading it", () => {
    expect(drawingFragment).not.toMatch(/uSepia/);
    expect(drawingFragment).toMatch(/uWound/);
    expect(drawingVertex).toMatch(/uDepth/);
  });
});
