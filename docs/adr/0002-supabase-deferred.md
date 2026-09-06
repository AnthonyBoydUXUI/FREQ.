# ADR 0002 — Thin experience backend, optional durable store

## Decision

FREQ. ships a Next.js backend with the installation. Drawings, worlds, and interaction stay authored in the client. The server holds only anonymous collective memory and allowlisted events.

A live Supabase project is optional. If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are unset, memory lives in process memory. If they are set, the same routes write to Postgres.

## Why

The drawing does not need a database. The installation does need a quiet server so region touches and enter/return events are not theater. Connecting a paid store is not required to merge the first slice.

## Consequences

- Client talks only to same-origin `/api/*`. No browser Supabase keys.
- Collective visit counts are not shown in the interface.
- Durable shared memory waits on an approved Supabase project and `supabase/migrations/0001_init.sql`.
