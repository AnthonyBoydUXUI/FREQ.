# Supabase

FREQ. can use Supabase later for content, world state, storage, curator data, generation jobs, and privacy-preserving collective memory.

It is **not connected** in the first vertical slice.

To connect later:

1. Create or reuse one project (do not duplicate)
2. Apply `supabase/migrations/0001_init.sql`
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel
4. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only
5. Confirm RLS before any public write path

Flag any paid plan before enabling it.
