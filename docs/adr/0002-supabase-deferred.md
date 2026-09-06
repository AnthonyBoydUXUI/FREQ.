# ADR 0002 — Defer Supabase until the first world is proven

## Decision

Design the schema now. Do not connect a live Supabase project in this slice.

## Why

The vertical slice must run from authored content. Connecting a database before the transformation is extraordinary would add vendor surface, secrets, and possible cost without serving the drawing.

## Consequences

Collective memory is device-local plus ephemeral process memory. Durable shared memory waits for an approved Supabase project.
