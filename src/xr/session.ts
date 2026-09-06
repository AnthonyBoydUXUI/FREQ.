export type XrMode = "immersive-vr" | "immersive-ar";

export type XrLike = {
  isSessionSupported?: (mode: XrMode) => Promise<boolean>;
  requestSession?: (
    mode: XrMode,
    options?: { optionalFeatures?: string[] },
  ) => Promise<unknown>;
};

export async function sessionSupported(
  xr: XrLike | undefined,
  mode: XrMode,
): Promise<boolean> {
  if (!xr?.isSessionSupported) return false;
  try {
    return await xr.isSessionSupported(mode);
  } catch {
    return false;
  }
}

export async function detectXr(xr?: XrLike): Promise<{ ar: boolean; vr: boolean }> {
  const [ar, vr] = await Promise.all([
    sessionSupported(xr, "immersive-ar"),
    sessionSupported(xr, "immersive-vr"),
  ]);
  return { ar, vr };
}

export function navigatorXr(): XrLike | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { xr?: XrLike }).xr;
}
