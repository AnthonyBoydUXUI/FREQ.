# Architecture

FREQ. is a Next.js App Router application with a client-side experience engine.

## Layers

- `src/app` — routes, metadata, security headers, APIs
- `src/engine` — phase machine, transformation scale, daily seed, flags
- `src/content` — authored artwork, regions, world graph
- `src/semantic` — polygon hit testing
- `src/experience` — R3F scene, shaders, helmet, interior
- `src/audio` — Web Audio stems
- `src/input` — pointer / keyboard / wheel, not mouse-coupled world logic
- `src/quality` — capability, budgets, WebGL detection
- `src/ui` — secondary chrome, accessible region buttons
- `src/server` — thin experience backend: collective memory, allowlisted events
- `src/web3` — dormant provenance records; no wallet
- `src/content/generated` — derived catalog from the artwork pipeline

## Experience phases

`boot → encounter → notice → approach → response → touch → transform → enter → explore → return`

The interior nave is the same photograph unfolded into space. A wound in the cowl is the entrance; the original sheet remains.

## Progressive enhancement

1. HTML poster of the original drawing (first visual)
2. WebGL field if capable
3. 2.5D CSS field if not
4. `/journey` if the visitor does not want the spatial field

Phone, tablet, and desktop share this path. The camera distance changes so the whole drawing stays in frame.

## Data

World graph, regions, and assets are authored in-repo. The Next.js `/api` routes are the backend. Collective memory and telemetry persist in process memory unless `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set. The browser never receives a service role key.

## APIs

- `GET /api/health` — liveness and persistence mode
- `GET|POST /api/memory` — anonymous region counts
- `POST /api/telemetry` — allowlisted anonymous events (`first_visual`, `audio_init`, `enter_world`, `return`, `webgl_fail`)
- `GET /api/provenance` — hashes of the three drawings; Web3 does not apply as an interface yet
