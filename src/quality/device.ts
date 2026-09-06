export type DeviceClass = "phone" | "tablet" | "desktop";

export function deviceClassFrom(input: {
  userAgent: string;
  maxTouchPoints?: number;
  platform?: string;
  width?: number;
  coarsePointer?: boolean;
}): DeviceClass {
  const ua = input.userAgent;
  const maxTouch = input.maxTouchPoints ?? 0;
  const iPadOS = input.platform === "MacIntel" && maxTouch > 1;
  const tabletUa =
    iPadOS ||
    /iPad|Tablet|Nexus 7|Nexus 9|SM-T|Kindle/i.test(ua) ||
    (/Android/i.test(ua) && !/Mobile/i.test(ua));
  const phoneUa = /Mobi|Android.*Mobile|iPhone|iPod/i.test(ua) && !tabletUa;

  if (phoneUa) return "phone";
  if (tabletUa) return "tablet";
  if (input.coarsePointer && (input.width ?? 1200) < 900) {
    return (input.width ?? 800) < 600 ? "phone" : "tablet";
  }
  return "desktop";
}
