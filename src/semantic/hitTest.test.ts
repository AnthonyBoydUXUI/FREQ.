import { describe, expect, it } from "vitest";
import {
  pointInPolygon,
  polygonBounds,
  centroid,
  clientToSheetUv,
  regionAt,
} from "@/semantic/hitTest";

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

describe("clientToSheetUv", () => {
  const sheet = { left: 100, top: 50, width: 200, height: 400 };

  it("maps a point on the sheet to 0-1 uv", () => {
    expect(clientToSheetUv(200, 250, sheet)).toEqual({
      u: 0.5,
      v: 0.5,
      inside: true,
    });
  });

  it("marks parchment around the sheet as outside", () => {
    expect(clientToSheetUv(20, 20, sheet).inside).toBe(false);
  });
});

describe("regionAt", () => {
  const items = [{ id: "cowl" as const, polygon: square }];

  it("returns the region under a uv point", () => {
    expect(regionAt(0.4, 0.4, items)).toBe("cowl");
    expect(regionAt(0.9, 0.9, items)).toBeNull();
  });
});
