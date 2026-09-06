import { describe, expect, it } from "vitest";
import { provenance, WEB3_APPLIES } from "@/web3/provenance";
import { featureFlags } from "@/engine/featureFlags";

describe("web3 provenance", () => {
  it("does not apply as an interface in this slice", () => {
    expect(WEB3_APPLIES).toBe(false);
    expect(featureFlags.web3).toBe(false);
    expect(provenance.applies).toBe(false);
    expect(provenance.chain).toBeNull();
    expect(provenance.artworks).toHaveLength(3);
  });
});
