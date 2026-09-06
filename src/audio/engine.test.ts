import { describe, expect, it } from "vitest";
import { stemGainsFor, captionFor } from "@/audio/engine";

describe("stemGainsFor", () => {
  it("keeps encounter quiet", () => {
    const gains = stemGainsFor("encounter", false, false, 0.03);
    expect(gains.metal).toBe(0);
    expect(gains.paper).toBeGreaterThan(0);
  });

  it("gives the interior more air and drone", () => {
    const gains = stemGainsFor("explore", false, false, 0.82);
    expect(gains.air).toBeGreaterThan(0.1);
    expect(gains.drone).toBeGreaterThan(0.1);
  });
});

describe("captionFor", () => {
  it("names silence when muted", () => {
    expect(captionFor("explore", "Cowl", true)).toMatch(/silent/i);
  });
});
