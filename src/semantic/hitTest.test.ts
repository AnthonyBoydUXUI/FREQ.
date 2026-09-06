import { describe, expect, it } from "vitest";
import { pointInPolygon, polygonBounds, centroid } from "@/semantic/hitTest";

const square: [number, number][] = [
  [0.2, 0.2],
  [0.6, 0.2],
  [0.6, 0.6],
  [0.2, 0.6],
];

describe("pointInPolygon", () => {
  it("detects interior and exterior points", () => {
    expect(pointInPolygon(0.4, 0.4, square)).toBe(true);
    expect(pointInPolygon(0.9, 0.9, square)).toBe(false);
  });
});

describe("polygonBounds", () => {
  it("returns the axis-aligned box", () => {
    const box = polygonBounds(square);
    expect(box.minX).toBe(0.2);
    expect(box.maxY).toBe(0.6);
    expect(box.width).toBeCloseTo(0.4);
  });
});

describe("centroid", () => {
  it("averages vertices", () => {
    const c = centroid(square);
    expect(c.x).toBeCloseTo(0.4);
    expect(c.y).toBeCloseTo(0.4);
  });
});
