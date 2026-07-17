// No filler data. Real content comes from Supabase once members start using the
// app. These empty collections are what a fresh install shows.

// Real members come from the `profiles` table after sign-in. This stays empty.
export const MEMBERS = []

// Identity used ONLY in local mode (no Supabase configured) so the app still
// runs for local dev/preview. Not shown to real users.
export const LOCAL_USER = { id: 'local', name: 'You', initials: 'ME' }
export const ME = LOCAL_USER.id

export const CATEGORIES = {
  lift:  { label: 'Lift',    color: '#3E97BF' },
  party: { label: 'Party',   color: '#F0531C' },
  meet:  { label: 'Meeting', color: '#C9A227' },
}

export const SEED_EVENTS = []
export const SEED_LIFT = []
export const SEED_RECEIPTS = []
export const SEED_POSTS = []
export const SEED_POLL = null
