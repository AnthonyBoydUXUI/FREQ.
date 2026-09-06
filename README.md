# FREQ.

A living spatial digital installation born from three original hand drawings.

The drawing is the interface. The first public vertical slice opens one armored drawing, three invisible semantic regions, a helmet transformation into architecture, spatial sound, a return to the mark, and an accessible journey. The drawings are the origin of the system, not content dropped into an engine.

This is not a portfolio, a gallery, or a 3D demo.

## Local setup

Requirements: Node 20+, pnpm 10, Python 3 with Pillow and NumPy (only for reprocessing artwork).

```bash
pnpm install
pnpm process:artworks   # optional; derived assets are already in public/
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The accessible journey is at `/journey`.

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## Environment variables

Names only. Configure values in Vercel project settings, never in git.

| Name | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical URL for metadata |
| `NEXT_PUBLIC_SUPABASE_URL` | no | Reserved; unused in this slice |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | no | Reserved; unused in this slice |
| `SUPABASE_SERVICE_ROLE_KEY` | no | Server-only; do not expose |

The first slice runs entirely from authored local content.

## Architecture

```
Drawing (HTML poster, fast first visual)
  → WebGL 2.5D field (R3F) if capable
  → Invisible semantic regions
  → Cowl / helmet transformation
  → Interior nave unfolded from the same photograph
  → Spatial stems
  → Collapse back into the drawing
```

If WebGL fails, a composed 2.5D field remains. If audio fails, the image remains. Reduced motion shortens the sequence instead of removing meaning.

See `docs/ARCHITECTURE.md` and `docs/WORLD_GUIDE.md`.

## Source artwork

Original photographs live under `public/artworks/{armor,facet,signal}/archival.jpg`.

Current captures are 640×480 chat-transcoded stills. Replace `archival.jpg` with the original scans, keep the filenames, then run `pnpm process:artworks`.

Do not clean the drawings. Do not replace them with generated robots.

## Deployment

The GitHub repository is canonical. Vercel should deploy from this repo:

`main` → production  
pull requests → preview

Existing project URL on record: `https://freq-two.vercel.app`. Do not create a duplicate Vercel project.

## Supabase

Schema is designed in `supabase/migrations/0001_init.sql`. It is not connected yet. Connecting it is a later phase and may involve a paid project — do not enable until needed.

## Accessibility

- Keyboard: Tab through regions, Enter to open the cowl, Escape to return, M to mute
- Visible focus on semantic regions
- Mute, volume, captions
- `prefers-reduced-motion`
- First-class `/journey` path
- WCAG 2.2 AA is the target for system UI and the journey

## What this slice does not include

AR, VR, curator tools, generative publish, cross-drawing portals, and live Supabase. Those are designed, not built, until this transformation feels extraordinary.
