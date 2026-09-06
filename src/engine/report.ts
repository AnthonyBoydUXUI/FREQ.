import type { RegionId } from "@/engine/types";

export function rememberCollective(regionId: RegionId) {
  if (typeof window === "undefined") return;
  void fetch("/api/memory", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ regionId }),
    keepalive: true,
  }).catch(() => {
    // The drawing continues if the server is quiet.
  });
}

export function report(
  event: "webgl_fail" | "audio_init" | "first_visual" | "enter_world" | "return" | "travel",
  value?: number,
) {
  if (typeof window === "undefined") return;
  void fetch("/api/telemetry", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(value === undefined ? { event } : { event, value }),
    keepalive: true,
  }).catch(() => {
    // The drawing continues if the server is quiet.
  });
}
