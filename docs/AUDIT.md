# Phase 0 audit

Inspected 2026-09-06 against the FREQ. master specification.

## A. Current state

The GitHub repository `AnthonyBoydUXUI/FREQ.` was an initial commit containing only `# FREQ.`. No application source, no 3D stack, no CI, no schema, no artwork in-repo.

Vercel project URL on the GitHub homepage: `https://freq-two.vercel.app` — 404 at audit time. Treat that project as the existing deployment target; do not create a duplicate.

No Supabase project is present in the repo or environment. No secrets were found.

Three source drawings were supplied as 640×480 JPEGs (chat-transcoded photographs of wrinkled tracing-paper originals).

## B. What can be reused

- The GitHub repository itself
- The existing Vercel project association (`freq-two`)
- The three original drawings as source DNA
- Node 22 / pnpm toolchain in this environment

## C. What must change

The repository had to become an application. The drawings must be preserved, not replaced. A semantic interaction engine, one authored helmet transformation, one interior world, spatial sound, return, mobile-capable rendering, reduced motion, and an accessible journey all had to be built.

## D. FREQ. experience architecture

Authored phase machine with an invisible transformation scale. System UI is secondary. The armor drawing is the first territory; facet and signal are catalogued as latent territories in one universe.

## E. Visual / 3D pipeline

Photograph → archival JPEG + display WebP + luminance depth + linework + paper + region masks + sampled graphite strokes. Runtime: R3F plane with displacement, UV-mapped cowl panels, interior nave textured with the same drawing. No generic robot GLB.

## F. Semantic interaction system

Authored UV polygons, invisible meshes, HTML buttons for keyboard/AT, no visible hotspots.

## G. World graph

`armor.encounter` ↔ `armor.cowl.nave`. Facet and signal nodes exist as latent.

## H. Audio architecture

Web Audio stems (paper, graphite, drone, metal, air). Unlock on gesture. Mute, volume, captions are real.

## I. Mobile performance strategy

Quality modes ultra/high/balanced/efficient. Adaptive DPR, stroke count, antialias. Fast HTML poster. Do not load other territories.

## J. AR / VR strategy

Designed, not shown. Flags remain false until a functional path exists.

## K. Supabase architecture

Schema in `supabase/migrations/0001_init.sql`. Not connected. RLS designed. No service key in the client.

## L. Vercel architecture

Next.js app, security headers, preview-from-PR. Use the existing project.

## M. GitHub / CI strategy

`pnpm typecheck`, `lint`, `test`, `build` on pull request and `main`.

## N. Security

CSP, nosniff, frame options, permissions policy, no privileged keys, validated telemetry/memory payloads.

## O. Accessibility

Skip link, semantic regions, keyboard, captions, reduced motion, `/journey`.

## P. Media / AI pipeline

Generate → store → preview → curate → approve → publish is documented. Nothing is auto-published. No generative models in this slice.

## Q. Recommended new dependencies or services

Added: Next.js, React, R3F, drei, three, zustand, vitest. No new paid services.

## R. Cost implications

Hobby Vercel should host this slice. Supabase, custom domains, and media workers may cost money later — do not enable without approval. No paid APIs were added.

## S. Phased execution plan

This PR is Phases 0–8 for one drawing, at vertical-slice depth. Remaining drawings, curator, AR/VR, and generative media wait on the quality gate.

## T. Exact first build

Armor drawing + three invisible regions + pre-interaction response + cowl/helmet transformation + nave derived from the drawing + graphite DNA inside + spatial stems + return + desktop/mobile + reduced motion + accessible journey.
