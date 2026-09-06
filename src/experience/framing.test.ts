import { describe, expect, it } from "vitest";
import { fitDistance } from "@/experience/framing";

describe("fitDistance", () => {
  it("pulls the camera back on a tall phone so the sheet is not clipped", () => {
    const phone = fitDistance(390 / 844);
    const desktop = fitDistance(1440 / 900);
    expect(phone).toBeGreaterThan(desktop);
    expect(phone).toBeGreaterThan(7);
  });

  it("is height-limited on a wide landscape viewport", () => {
    const landscape = fitDistance(1440 / 900);
    const square = fitDistance(1);
    expect(landscape).toBeCloseTo(square, 1);
  });
});
