import { describe, expect, it } from "vitest";
import { deviceClassFrom } from "@/quality/device";

describe("deviceClassFrom", () => {
  it("classifies phones, tablets, and desktops", () => {
    expect(
      deviceClassFrom({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      }),
    ).toBe("phone");

    expect(
      deviceClassFrom({
        userAgent: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      }),
    ).toBe("tablet");

    expect(
      deviceClassFrom({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        platform: "MacIntel",
        maxTouchPoints: 5,
      }),
    ).toBe("tablet");

    expect(
      deviceClassFrom({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        width: 1440,
      }),
    ).toBe("desktop");
  });
});
