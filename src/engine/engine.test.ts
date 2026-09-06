import { describe, expect, it } from "vitest";
import { dailySeed, seedUnit } from "@/engine/dailySeed";
import { targetTransformation, woundAmount } from "@/engine/phases";

describe("dailySeed", () => {
  it("is deterministic for the same artwork and date", () => {
    const date = new Date("2026-09-06T12:00:00Z");
    expect(dailySeed("armor", date)).toBe(dailySeed("armor", date));
    expect(dailySeed("armor", date)).not.toBe(dailySeed("facet", date));
  });

  it("produces a unit value in 0-1", () => {
    const value = seedUnit(dailySeed("armor", new Date("2026-09-06T00:00:00Z")), 3);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  });
});

describe("targetTransformation", () => {
  it("keeps encounter near the original artifact", () => {
    expect(targetTransformation("encounter", 0)).toBeLessThan(0.1);
  });

  it("collapses on return", () => {
    expect(targetTransformation("return", 1)).toBeLessThan(0.1);
  });
});

describe("woundAmount", () => {
  it("keeps the sheet closed at encounter", () => {
    expect(woundAmount("encounter", 0)).toBe(0);
  });

  it("opens fully once inside", () => {
    expect(woundAmount("explore", 1)).toBe(1);
    expect(woundAmount("enter", 0.4)).toBe(1);
  });

  it("closes as the world returns to the mark", () => {
    expect(woundAmount("return", 0)).toBe(1);
    expect(woundAmount("return", 1)).toBe(0);
  });
});
