# Garage 43 — crew hub (HTML PWA)

Single-file PWA rebuilt on the Better View Pro shell: fixed header, bottom nav
on mobile / tabs on desktop, per-view FAB, bottom-sheet editors.

## Files
- `app.html` — the whole app (styles + markup + JS)
- `sw.js` — offline shell cache + web push
- `manifest.webmanifest`, `icon-192.png`, `icon-512.png`
- `index.html` — redirects to `app.html`
- `supabase/migration_community_hub.sql` — adds events, RSVPs, polls, votes, receipts, lift no-overlap constraint, create/join-garage RPCs, RLS, realtime

## Run local-only
Open `app.html` from any static server (`npx serve .`). With no keys set it runs
in Local mode: no sign-in, data in `localStorage`, seeded with a few examples.

## Turn on sharing
1. Run `supabase/migration_community_hub.sql` in the Supabase SQL editor.
2. Paste your project URL + anon key into `SB_URL` / `SB_KEY` at the top of the
   `<script>` in `app.html`.
3. Auth → Providers: Email on (turn off "Confirm email" for a small crew), Google
   on with your OAuth client, and add your site origin to the redirect URLs.
4. Deploy the folder to any static host (GitHub Pages, Netlify, Cloudflare Pages).

First sign-in asks for a display name, then to join a garage by invite code or
create one. The owner shares the code from the avatar menu.
