# Supabase

Optional durable store for anonymous collective memory and allowlisted events.

The Next.js backend runs without it. Drawings stay in git. The browser never talks to Supabase.

To connect:

1. Create or reuse one project (do not duplicate)
2. Apply `supabase/migrations/0001_init.sql`
3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel (server only)
4. Do not put the service role key in `NEXT_PUBLIC_*`
5. Confirm RLS before any public write path

Flag any paid plan before enabling it.
