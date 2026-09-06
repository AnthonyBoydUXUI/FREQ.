import { describe, expect, it, beforeEach } from "vitest";
import { POST as postMemory, GET as getMemory } from "@/app/api/memory/route";
import { POST as postTelemetry } from "@/app/api/telemetry/route";
import { GET as getHealth } from "@/app/api/health/route";
import { GET as getEcho } from "@/app/api/echo/route";
import { GET as getStudio, POST as postStudio } from "@/app/api/studio/route";
import { parseRegionId, parseTelemetryEvent, curatorAuthorized } from "@/server/contract";
import { resetProcessMemoryForTests } from "@/server/store";
import { resetRateLimitForTests } from "@/server/rateLimit";

function jsonRequest(url: string, body: unknown, headers?: HeadersInit) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("backend contract", () => {
  it("accepts the nine authored regions", () => {
    expect(parseRegionId("cowl")).toBe("cowl");
    expect(parseRegionId("visor")).toBe("visor");
    expect(parseRegionId("crown")).toBe("crown");
    expect(parseRegionId("helmet")).toBeNull();
  });

  it("rejects telemetry that is not part of the experience", () => {
    expect(parseTelemetryEvent("enter_world")).toBe("enter_world");
    expect(parseTelemetryEvent("travel")).toBe("travel");
    expect(parseTelemetryEvent("fps")).toBeNull();
    expect(parseTelemetryEvent("page_view")).toBeNull();
  });

  it("opens the curator desk when no key is configured", () => {
    delete process.env.CURATOR_KEY;
    expect(curatorAuthorized(new Request("http://localhost/api/studio"))).toBe(true);
  });
});

describe("experience API", () => {
  beforeEach(() => {
    resetProcessMemoryForTests();
    resetRateLimitForTests();
    delete process.env.SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.CURATOR_KEY;
  });

  it("counts anonymous region touches in process memory", async () => {
    const first = await postMemory(jsonRequest("http://localhost/api/memory", { regionId: "cowl" }));
    const firstBody = (await first.json()) as { regions: { cowl: number } };
    expect(first.status).toBe(200);
    expect(firstBody.regions.cowl).toBe(1);

    const second = await postMemory(jsonRequest("http://localhost/api/memory", { regionId: "visor" }));
    const secondBody = (await second.json()) as { regions: { visor: number } };
    expect(secondBody.regions.visor).toBe(1);

    const listed = await getMemory();
    const listedBody = (await listed.json()) as { regions: { cowl: number; visor: number } };
    expect(listedBody.regions.cowl).toBe(1);
    expect(listedBody.regions.visor).toBe(1);
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
    const body = (await response.json()) as { persistence: string; ok: boolean; slice: string };
    expect(body.ok).toBe(true);
    expect(body.persistence).toBe("process");
    expect(body.slice).toBe("three-territories");
  });

  it("keeps generative echoes as drafts until the curator approves", async () => {
    const unseen = await getEcho(new Request("http://localhost/api/echo?artworkId=armor"));
    const unseenBody = (await unseen.json()) as { approved: boolean; strokes: unknown[] };
    expect(unseen.status).toBe(200);
    expect(unseenBody.approved).toBe(false);
    expect(unseenBody.strokes).toEqual([]);

    const studio = await getStudio(new Request("http://localhost/api/studio"));
    const studioBody = (await studio.json()) as { echoes: Array<{ id: string; status: string }> };
    expect(studio.status).toBe(200);
    const draft = studioBody.echoes.find((item) => item.id.startsWith("armor:"));
    expect(draft).toBeTruthy();

    const approved = await postStudio(
      jsonRequest("http://localhost/api/studio", { action: "approve", echoId: draft!.id }),
    );
    expect(approved.status).toBe(200);

    const visible = await getEcho(new Request("http://localhost/api/echo?artworkId=armor"));
    const visibleBody = (await visible.json()) as { approved: boolean; strokes: unknown[] };
    expect(visibleBody.approved).toBe(true);
    expect(visibleBody.strokes.length).toBeGreaterThan(0);
  });
});
