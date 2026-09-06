"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { provenance } from "@/web3/provenance";
import type { EchoDraft } from "@/generative/echo";
import type { DailyState } from "@/engine/daily";
import { featureFlags } from "@/engine/featureFlags";

type StudioPayload = {
  persistence: string;
  regions: Record<string, number>;
  events: Record<string, number>;
  echoes: EchoDraft[];
  daily: DailyState[];
  flags: typeof featureFlags;
};

export function StudioDesk() {
  const [data, setData] = useState<StudioPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/studio");
    if (response.status === 401) {
      setError("A curator key is required on this installation.");
      return;
    }
    if (!response.ok) {
      setError("The desk could not open.");
      return;
    }
    setError(null);
    setData((await response.json()) as StudioPayload);
  }

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/studio")
      .then(async (response) => {
        if (cancelled) return;
        if (response.status === 401) {
          setError("A curator key is required on this installation.");
          return;
        }
        if (!response.ok) {
          setError("The desk could not open.");
          return;
        }
        const payload = (await response.json()) as StudioPayload;
        if (cancelled) return;
        setError(null);
        setData(payload);
      })
      .catch(() => {
        if (!cancelled) setError("The desk could not open.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function setStatus(echoId: string, action: "approve" | "hold") {
    setBusy(echoId);
    await fetch("/api/studio", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ echoId, action }),
    });
    await load();
    setBusy(null);
  }

  return (
    <main className="studio">
      <header>
        <p className="kicker">Curator desk</p>
        <h1>FREQ.</h1>
        <p className="lede">
          Inspect provenance, memory, the daily state, and generative drafts.
          Drafts never appear on the drawing until they are approved. Auto-publish
          stays off.
        </p>
        <nav className="journey-nav">
          <Link href="/">Installation</Link>
          <Link href="/journey">Journey</Link>
          <Link href="/api/provenance">Provenance JSON</Link>
        </nav>
      </header>

      {error ? <p className="studio-error">{error}</p> : null}

      <section>
        <h2>Provenance</h2>
        <p>Web3 does not apply as an interface. Hashes only.</p>
        <ul>
          {provenance.artworks.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong> {item.sha256}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Collective memory</h2>
          {Object.entries(data?.regions ?? {}).length === 0 ? (
            <p>Opening memory…</p>
          ) : (
            <ul className="studio-grid">
              {Object.entries(data?.regions ?? {}).map(([id, count]) => (
                <li key={id}>
                  {id} <em>{count}</em>
                </li>
              ))}
            </ul>
          )}
      </section>

      <section>
        <h2>Anonymous events</h2>
        <ul className="studio-grid">
          {Object.entries(data?.events ?? {}).map(([id, count]) => (
            <li key={id}>
              {id} <em>{count}</em>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Today</h2>
          {(data?.daily ?? []).length === 0 ? (
            <p>Opening today…</p>
          ) : (
            <ul>
              {(data?.daily ?? []).map((item) => (
                <li key={item.artworkId}>
                  <strong>{item.artworkId}</strong> {item.caption} Seed {item.seed}.
                </li>
              ))}
            </ul>
          )}
      </section>

      <section>
        <h2>Generative drafts</h2>
        <p>
          Echoes are displaced samples of the original graphite. Publish is{" "}
          {featureFlags.generativePublish ? "on" : "off"}.
        </p>
          {(data?.echoes ?? []).length === 0 ? (
            <p>No drafts yet. Opening the desk will seed today’s echoes.</p>
          ) : (
            <ul className="echo-list">
              {(data?.echoes ?? []).map((echo) => (
                <li key={echo.id}>
                  <p>
                    {echo.artworkId} {echo.day} — {echo.status} ({echo.strokes.length}{" "}
                    marks)
                  </p>
                  <button
                    type="button"
                    className="text-button"
                    disabled={busy === echo.id}
                    onClick={() => void setStatus(echo.id, "approve")}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    disabled={busy === echo.id}
                    onClick={() => void setStatus(echo.id, "hold")}
                  >
                    Hold
                  </button>
                </li>
              ))}
            </ul>
          )}
      </section>
    </main>
  );
}
