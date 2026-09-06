import { describe, expect, it } from "vitest";
import {
  artworks,
  portalFor,
  regionsFor,
  isPortalRegion,
  interiors,
  strokesFor,
} from "@/content/artworks";
import {
  nextArtworkId,
  previousArtworkId,
  worldGraph,
  worldNodeId,
  travelTarget,
} from "@/content/worldGraph";
import { dailyState } from "@/engine/daily";
import { deriveEcho } from "@/generative/echo";
import { detectXr } from "@/xr/session";
import { featureFlags } from "@/engine/featureFlags";

describe("territories", () => {
  it("gives each drawing three regions and one portal", () => {
    expect(artworks.map((item) => item.id)).toEqual(["armor", "facet", "signal"]);
    expect(portalFor("armor").id).toBe("cowl");
    expect(portalFor("facet").id).toBe("visor");
    expect(portalFor("signal").id).toBe("crown");
    for (const artwork of artworks) {
      const regions = regionsFor(artwork.id);
      expect(regions).toHaveLength(3);
      expect(regions.filter((region) => region.portal)).toHaveLength(1);
      expect(interiors[artwork.id].floor.u1).toBeGreaterThan(interiors[artwork.id].floor.u0);
      expect(strokesFor(artwork.id).length).toBeGreaterThan(40);
    }
    expect(isPortalRegion("plates")).toBe(false);
    expect(isPortalRegion("visor")).toBe(true);
  });
});

describe("experience graph", () => {
  it("cycles Armor to Facet to Signal and back", () => {
    expect(nextArtworkId("armor")).toBe("facet");
    expect(nextArtworkId("facet")).toBe("signal");
    expect(nextArtworkId("signal")).toBe("armor");
    expect(previousArtworkId("armor")).toBe("signal");
    expect(travelTarget(worldNodeId("armor"))).toBe("facet");
    expect(worldGraph.nodes.filter((node) => node.kind === "world")).toHaveLength(3);
    expect(
      worldGraph.edges.filter((edge) => edge.transition === "travel"),
    ).toHaveLength(3);
  });
});

describe("daily evolution", () => {
  it("is stable for a day and names an alive region on that drawing", () => {
    const date = new Date("2026-09-06T12:00:00Z");
    const a = dailyState("facet", date);
    const b = dailyState("facet", date);
    expect(a.seed).toBe(b.seed);
    expect(a.aliveRegionId).toBe(b.aliveRegionId);
    expect(regionsFor("facet").some((region) => region.id === a.aliveRegionId)).toBe(true);
    expect(a.caption.toLowerCase()).toContain(
      regionsFor("facet").find((region) => region.id === a.aliveRegionId)!.label.toLowerCase(),
    );
    expect(dailyState("armor", date).seed).not.toBe(a.seed);
  });
});

describe("controlled echo", () => {
  it("only displaces existing graphite samples", () => {
    const source = strokesFor("armor");
    const echo = deriveEcho(source, 19, 24);
    expect(echo).toHaveLength(24);
    for (const point of echo) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(1);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(1);
    }
  });
});

describe("xr detect", () => {
  it("reports no sessions when WebXR is absent", async () => {
    await expect(detectXr(undefined)).resolves.toEqual({ ar: false, vr: false });
  });

  it("asks the browser which modes exist", async () => {
    const xr = {
      isSessionSupported: async (mode: "immersive-ar" | "immersive-vr") => mode === "immersive-vr",
    };
    await expect(detectXr(xr)).resolves.toEqual({ ar: false, vr: true });
  });
});

describe("feature flags", () => {
  it("never auto-publishes generative media", () => {
    expect(featureFlags.generativePublish).toBe(false);
    expect(featureFlags.web3).toBe(false);
    expect(featureFlags.ar).toBe(true);
    expect(featureFlags.vr).toBe(true);
    expect(featureFlags.curator).toBe(true);
    expect(featureFlags.crossDrawingPortals).toBe(true);
  });
});
