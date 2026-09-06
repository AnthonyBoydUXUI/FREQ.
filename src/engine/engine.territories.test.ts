import { describe, expect, it } from "vitest";
import { useEngine } from "@/engine/store";
import { targetTransformation } from "@/engine/phases";

describe("engine territories", () => {
  it("opens Facet through the visor, not the armor cowl", () => {
    useEngine.getState().setArtwork("facet");
    useEngine.setState({
      phase: "encounter",
      phaseProgress: 0,
      transformation: targetTransformation("encounter", 0),
    });
    useEngine.getState().enterWorld();
    expect(useEngine.getState().artworkId).toBe("facet");
    expect(useEngine.getState().activeRegionId).toBe("visor");
    expect(useEngine.getState().phase).toBe("touch");
  });

  it("keeps non-portal regions as response", () => {
    useEngine.getState().setArtwork("signal");
    useEngine.setState({
      phase: "encounter",
      phaseProgress: 0,
      transformation: targetTransformation("encounter", 0),
    });
    useEngine.getState().selectRegion("mask");
    expect(useEngine.getState().phase).toBe("response");
    expect(useEngine.getState().activeRegionId).toBeNull();
  });

  it("travels to the next drawing on return", () => {
    useEngine.getState().setArtwork("armor");
    useEngine.setState({
      phase: "explore",
      phaseProgress: 1,
      transformation: targetTransformation("explore", 1),
      artworkId: "armor",
    });
    useEngine.getState().requestTravel();
    expect(useEngine.getState().pendingTravelId).toBe("facet");
    expect(useEngine.getState().phase).toBe("return");
    useEngine.getState().tickSequence(20);
    expect(useEngine.getState().artworkId).toBe("facet");
    expect(useEngine.getState().phase).toBe("encounter");
  });
});
