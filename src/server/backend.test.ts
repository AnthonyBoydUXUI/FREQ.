import { describe, expect, it, beforeEach } from "vitest";
import { POST as postMemory, GET as getMemory } from "@/app/api/memory/route";
import { POST as postTelemetry } from "@/app/api/telemetry/route";
import { GET as getHealth } from "@/app/api/health/route";
import { parseRegionId, parseTelemetryEvent } from "@/server/contract";
import { resetProcessMemoryForTests } from "@/server/store";
import { resetRateLimitForTests } from "@/server/rateLimit";

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("backend contract", () => {
  it("accepts only the three authored regions", () => {
    expect(parseRegionId("cowl")).toBe("cowl");
    expect(parseRegionId("helmet")).toBeNull();
  });

  it("rejects telemetry that is not part of the experience", () => {
    expect(parseTelemetryEvent("enter_world")).toBe("enter_world");
    expect(parseTelemetryEvent("fps")).toBeNull();
    expect(parseTelemetryEvent("page_view")).toBeNull();
  });
});

describe("experience API", () => {
  beforeEach(() => {
    resetProcessMemoryForTests();
    resetRateLimitForTests();
    delete process.env.SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("counts anonymous region touches in process memory", async () => {
    const first = await postMemory(jsonRequest("http://localhost/api/memory", { regionId: "cowl" }));
    const firstBody = (await first.json()) as { regions: { cowl: number } };
    expect(first.status).toBe(200);
    expect(firstBody.regions.cowl).toBe(1);

    const second = await postMemory(jsonRequest("http://localhost/api/memory", { regionId: "cowl" }));
    const secondBody = (await second.json()) as { regions: { cowl: number } };
    expect(secondBody.regions.cowl).toBe(2);

    const listed = await getMemory();
    const listedBody = (await listed.json()) as { regions: { cowl: number } };
    expect(listedBody.regions.cowl).toBe(2);
  });

  it("rejects unknown regions", async () => {
    const response = await postMemory(
      jsonRequest("http://localhost/api/memory", { regionId: "nave" }),
    );
    expect(response.status).toBe(400);
  });

  it("accepts allowlisted telemetry and ignores the rest", async () => {
    const ok = await postTelemetry(
      jsonRequest("http://localhost/api/telemetry", { event: "enter_world" }),
    );
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ ok: true });

    const bad = await postTelemetry(
      jsonRequest("http://localhost/api/telemetry", { event: "page_view" }),
    );
    expect(bad.status).toBe(400);
  });

  it("reports process persistence when Supabase is unset", async () => {
    const response = await getHealth();
    const body = (await response.json()) as { persistence: string; ok: boolean };
    expect(body.ok).toBe(true);
    expect(body.persistence).toBe("process");
  });
});
