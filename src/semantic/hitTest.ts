import type { RegionId } from "@/engine/types";

export function pointInPolygon(
  x: number,
  y: number,
  polygon: readonly (readonly [number, number])[],
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function polygonBounds(polygon: readonly (readonly [number, number])[]) {
  let minX = 1;
  let minY = 1;
  let maxX = 0;
  let maxY = 0;
  for (const [x, y] of polygon) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

export function clientToSheetUv(
  clientX: number,
  clientY: number,
  sheet: { left: number; top: number; width: number; height: number },
): { u: number; v: number; inside: boolean } {
  if (sheet.width <= 0 || sheet.height <= 0) {
    return { u: 0.5, v: 0.5, inside: false };
  }
  const u = (clientX - sheet.left) / sheet.width;
  const v = (clientY - sheet.top) / sheet.height;
  return {
    u,
    v,
    inside: u >= 0 && u <= 1 && v >= 0 && v <= 1,
  };
}

export function regionAt(
  u: number,
  v: number,
  items: readonly { id: RegionId; polygon: readonly (readonly [number, number])[] }[],
): RegionId | null {
  for (const item of items) {
    if (pointInPolygon(u, v, item.polygon)) return item.id;
  }
  return null;
}

export function centroid(polygon: readonly (readonly [number, number])[]) {
  const sum = polygon.reduce(
    (acc, [x, y]) => {
      acc.x += x;
      acc.y += y;
      return acc;
    },
    { x: 0, y: 0 },
  );
  return { x: sum.x / polygon.length, y: sum.y / polygon.length };
}

export function polygonToClipPath(
  polygon: readonly (readonly [number, number])[],
): string {
  return `polygon(${polygon.map(([x, y]) => `${x * 100}% ${y * 100}%`).join(", ")})`;
}
