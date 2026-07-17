-- Garage 43 — Supabase schema.
-- Run this once in the Supabase SQL editor (Dashboard -> SQL -> New query).
-- Reserved words avoided: events use "details" (not desc); lift uses
-- start_hour / end_hour (not start/end).

-- ---------- profiles ----------
-- One row per signed-in member. The app writes this on first login.
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  initials   text not null,
  created_at timestamptz default now()
);

-- ---------- shared data ----------
create table if not exists events (
  id      text primary key,
  type    text not null,          -- 'party' | 'meet'
  title   text not null,
  date    date not null,
  time    text,
  details text,
  rsvp    jsonb not null default '{}'::jsonb  -- { memberId: 'going'|'maybe'|'out' }
);

create table if not exists lift (
  id         text primary key,
  date       date not null,
  start_hour int  not null,        -- 24h, inclusive
  end_hour   int  not null,        -- 24h, exclusive
  member     text not null,        -- profiles.id of the booker
  note       text
);

create table if not exists receipts (
  id     text primary key,
  vendor text not null,
  note   text,
  amount numeric not null,         -- negative = spent, positive = deposit
  "by"   text,                     -- profiles.id of who paid / deposited
  date   date not null,
  icon   text
);

create table if not exists poll (
  id       text primary key,
  author   text,
  age      text,
  question text not null,
  options  jsonb not null,         -- [{ id, label, votes:[memberId] }]
  closes   text
);

create table if not exists posts (
  id         text primary key,
  author     text not null,        -- profiles.id
  body       text not null,
  created_at timestamptz default now()
);

-- ---------- realtime ----------
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table lift;
alter publication supabase_realtime add table receipts;
alter publication supabase_realtime add table poll;
alter publication supabase_realtime add table posts;

-- ---------- access (authenticated only) ----------
alter table profiles enable row level security;
alter table events   enable row level security;
alter table lift     enable row level security;
alter table receipts enable row level security;
alter table poll     enable row level security;
alter table posts    enable row level security;

-- Everyone signed in can read all profiles (to show names), but you can only
-- create / edit your own.
create policy "read profiles"   on profiles for select using (auth.role() = 'authenticated');
create policy "insert own"      on profiles for insert with check (auth.uid() = id);
create policy "update own"      on profiles for update using (auth.uid() = id);

-- Shared garage data: any signed-in member can read and write.
create policy "members events"   on events   for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "members lift"     on lift     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "members receipts" on receipts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "members poll"     on poll     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "members posts"    on posts    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
