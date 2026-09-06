import { DRAWING_HEIGHT, DRAWING_WIDTH } from "@/engine/types";

export const ENCOUNTER_FOV = 28;
export const DRAWING_MARGIN = 1.02;

/** Camera distance that keeps the whole sheet visible for this viewport. */
export function fitDistance(
  aspect: number,
  fovDeg = ENCOUNTER_FOV,
  margin = DRAWING_MARGIN,
): number {
  const safeAspect = Math.min(3, Math.max(aspect, 0.34));
  const vFov = (fovDeg * Math.PI) / 180;
  const distHeight = (DRAWING_HEIGHT * margin) / 2 / Math.tan(vFov / 2);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * safeAspect);
  const distWidth = (DRAWING_WIDTH * margin) / 2 / Math.tan(hFov / 2);
  return Math.max(distHeight, distWidth);
}

export function approachDistance(aspect: number): number {
  return fitDistance(aspect) * 0.74;
}

export function touchDistance(aspect: number): number {
  return fitDistance(aspect) * 0.58;
}
