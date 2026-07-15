// Starter data for Garage 43. Everything the group edits (RSVPs, votes, receipts,
// events, lift bookings) syncs through src/db.js — to Supabase when it's
// configured, otherwise to localStorage so the app still runs offline.

export const MEMBERS = [
  { id: 'blake', name: 'Blake', initials: 'BK' },
  { id: 'dave',  name: 'Dave',  initials: 'DM' },
  { id: 'reg',   name: 'Reg',   initials: 'RJ' },
  { id: 'tommy', name: 'Tommy', initials: 'TL' },
  { id: 'sam',   name: 'Sam',   initials: 'SW' },
  { id: 'nate',  name: 'Nate',  initials: 'NP' },
]

// The signed-in member (swap out when auth is added)
export const ME = 'blake'

export const CATEGORIES = {
  lift:  { label: 'Lift',    color: '#3E97BF' },
  party: { label: 'Party',   color: '#F0531C' },
  meet:  { label: 'Meeting', color: '#C9A227' },
}

// Parties + meetings live here. Lift time is managed as real bookings (below).
export const SEED_EVENTS = [
  { id: 'e2', type: 'meet',  title: 'Monthly garage meeting', date: '2026-03-15', time: '2:00 PM',  details: 'Dues, spring cleanup, new key fobs', rsvp: {} },
  { id: 'e4', type: 'party', title: 'Dyno Day + Cookout',     date: '2026-03-19', time: '10:00 AM', details: 'Bring a side. Fund covers meat + drinks.',
    rsvp: { dave: 'going', reg: 'going', tommy: 'going', sam: 'maybe', nate: 'going' } },
  { id: 'e5', type: 'party', title: 'Bikes & Bonfire',        date: '2026-03-21', time: '7:00 PM',  details: 'Casual hang · fund covers drinks', rsvp: {} },
]

// Lift reservations. start_hour / end_hour are 24h ints; end is exclusive.
export const SEED_LIFT = [
  { id: 'lb1', date: '2026-03-13', start_hour: 18, end_hour: 21, member: 'dave', note: 'Valve check — bay open to share' },
  { id: 'lb2', date: '2026-03-16', start_hour: 13, end_hour: 15, member: 'reg',  note: 'Tire swap' },
]

// amount: negative = spent from fund, positive = deposit
export const SEED_RECEIPTS = [
  { id: 'r1', vendor: 'Costco run',        note: 'Snacks & drinks · cookout', amount: -74.20, by: 'blake', date: '2026-03-08', icon: '🛒' },
  { id: 'r2', vendor: 'Propane refill',    note: 'Grill for Saturday',        amount: -21.00, by: 'reg',   date: '2026-03-06', icon: '🔥' },
  { id: 'r3', vendor: 'Shop rag rolls ×4', note: 'Consumables',               amount: -18.62, by: 'reg',   date: '2026-03-05', icon: '🧻' },
  { id: 'r4', vendor: 'Monthly dues',      note: 'Deposit · 3 members',       amount: 180.00, by: 'dave',  date: '2026-03-01', icon: '💵' },
  { id: 'r5', vendor: 'Ice + cups',        note: 'Last cookout',              amount: -24.00, by: 'dave',  date: '2026-02-22', icon: '🧊' },
]

export const SEED_POLL = {
  id: 'p1',
  author: 'blake',
  age: '2h ago',
  question: "What's the theme for the next cookout?",
  options: [
    { id: 'o1', label: 'Low-country boil', votes: ['dave'] },
    { id: 'o2', label: 'Smash burgers',    votes: ['reg', 'tommy'] },
    { id: 'o3', label: 'Taco bar',         votes: ['sam'] },
  ],
  closes: 'Friday',
}

export const SEED_POSTS = [
  { id: 'ps1', author: 'dave', age: '5h ago',
    body: "Lift's free Thursday night if anyone needs it before the weekend. I'll be doing a valve check ~6–9, plenty of room to share the bay.",
    up: 5, replies: 3 },
  { id: 'ps2', author: 'reg', age: 'yesterday',
    body: "Fund's looking healthy 💪 dropped receipts for the propane and the new shop rags in the ledger. Someone grab ice before Saturday.",
    up: 8, replies: 6 },
]
