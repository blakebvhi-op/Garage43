# Garage 43 — Community Hub 🔧

A shared hub for the garage crew: a customizable board, a filterable garage
calendar, a forum with polls, and a fund/receipts ledger. Installable PWA,
works offline.

> **Note on direction:** this is the community-hub build. The original
> motorcycle-maintenance app is parked — when we pick it back up it'll spin off
> into its own repo and we'll carry the code over.

## Features

- **The Board** — dashboard with fund balance, next event + RSVP, upcoming lift bookings, open vote, and recent receipts.
- **Garage Calendar** — add events tagged Party / Meeting, filter by category, and see lift reservations rolled in.
- **Lift** — real time-slot reservations for the single shared lift. Claim a slot (1–4 hrs), no double-booking, release your own.
- **The Forum** — posts and polls. One vote per member; results reveal after you vote.
- **Receipts & Ledger** — log what came out of the garage fund and what it was for, with a running balance.

## Shared data (Supabase)

The app runs two ways automatically:

- **No keys set** → all data lives in `localStorage` on that device. Great for trying it out; nothing is shared.
- **Supabase keys set** → data is shared and **live** for everyone (realtime), so RSVPs, votes, receipts, and lift bookings update across phones as they happen. The header shows **Synced** vs **Local** so you always know which mode you're in.

To turn on sharing:

1. Create a project at supabase.com.
2. Run `supabase/schema.sql` in the Supabase SQL editor (creates the tables, turns on realtime, adds authenticated-only policies + a `profiles` table).
3. Copy `.env.example` to `.env` and paste your Project URL + anon key.
4. `npm run dev`. The header flips to **Synced**. Online mode starts with an empty database — real content builds up as the crew uses it (the seed data in `src/data/seed.js` is only used in local mode).

## Signing in (auth)

Two ways in, on one screen: **email + password** or **Continue with Google**. On
first sign-in each member picks a display name, which creates their `profiles`
row — that name/initials then shows on their RSVPs, receipts, and lift bookings.
There's a **Sign out** control in the sidebar (desktop) and on the avatar (mobile).

Supabase setup:

- **Email + password** — the Email provider is on by default. For a small crew, turn **off** "Confirm email" (Authentication → Providers → Email) so signups work immediately; leave it on if you want email verification.
- **Google** — enable the Google provider (Authentication → Providers → Google) and paste a Client ID + secret from a Google Cloud OAuth credential. Add your app origin to the provider's redirect URLs.

**Local mode has no login** — when Supabase env vars aren't set, the app runs
with a demo identity so you can try everything without an account.

## Stack

React 18 · Vite · Tailwind CSS · lucide-react · vite-plugin-pwa. Supabase is
already a dependency for when we move shared data off the device.

## Run it

```bash
npm install
npm run dev      # local dev
npm run build    # production build -> dist/
npm run preview  # preview the build
```

## Where things live

```
src/
  App.jsx              app shell, nav, state + handlers, auth gating
  auth.jsx             sign-in state (email/password + Google), profiles
  supabase.js          Supabase client (null when no env vars)
  db.js                one data API over Supabase (+realtime) or localStorage
  store.js             identity registry + formatting + lift helpers
  data/seed.js         members, events, lift, receipts, poll (local-mode data)
  components/
    ui.jsx             shared Tag / Avatar / Panel / Modal / inputs
    AuthShell.jsx      framing for the sign-in screens
    Login.jsx          email/password + Google
    ProfileSetup.jsx   first-login display name
    Dashboard.jsx      The Board
    Calendar.jsx       calendar + filter + add-event
    Lift.jsx           time-slot reservations
    Forum.jsx          posts + poll voting
    Receipts.jsx       ledger + log-receipt
supabase/
  schema.sql           run once to set up the shared database
.env.example           copy to .env to enable sharing + auth
```

## How the data layer works

Components never talk to a backend directly — they call `db.load / upsert /
remove / subscribe` in `src/db.js`, which picks Supabase or `localStorage` based
on whether the env vars exist. That means the same UI code runs offline-only or
fully shared with no changes. When you add Supabase Auth later, it plugs in at
this one layer.

## Design

Shop-ticket aesthetic: gunmetal panels, chalk text, one hazard-orange accent,
hazard-stripe divider, and all data (money, dates, counts) set in monospace like
a printed ticket. Tokens live in `tailwind.config.js`.
