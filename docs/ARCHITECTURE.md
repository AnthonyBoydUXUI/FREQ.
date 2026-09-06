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
- `src/content/generated` — derived catalog from the artwork pipeline

## Experience phases

`boot → encounter → notice → approach → response → touch → transform → enter → explore → return`

The interior nave is the same photograph unfolded into space. A wound in the cowl is the entrance; the original sheet remains.

## Progressive enhancement

1. HTML poster of the original drawing (first visual)
2. WebGL field if capable
3. 2.5D CSS field if not
4. `/journey` if the visitor does not want the spatial field

## Data

World graph, regions, and assets are authored in-repo. Supabase schema exists for later curator, collective memory, and generation jobs. It is unused until explicitly connected.

## APIs

- `GET /api/health`
- `GET|POST /api/memory` — anonymous region counts, process memory only
- `POST /api/telemetry` — allowlisted anonymous events
