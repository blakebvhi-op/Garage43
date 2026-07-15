import { MEMBERS } from './data/seed'

// Identity registry. Seeded with the demo members; real profiles get merged in
// from Supabase after sign-in (see src/auth.jsx -> registerProfiles).
const registry = new Map(MEMBERS.map(m => [m.id, { name: m.name, initials: m.initials }]))

export function registerProfiles(list) {
  list.forEach(p => registry.set(p.id, { name: p.name, initials: p.initials }))
}

export const nameOf = id => registry.get(id)?.name || id
export const initialsOf = id =>
  registry.get(id)?.initials || (id ? String(id).slice(0, 2).toUpperCase() : '??')

export const money = n => (n < 0 ? '-' : '+') + '$' + Math.abs(n).toFixed(2)

export const balanceOf = receipts => receipts.reduce((sum, r) => sum + r.amount, 0)

// "2026-03-19" -> { m:'Mar', d:'19', weekday:'Sat', full:'Sat · Mar 19' }
export function fmtDate(iso) {
  const [y, mo, d] = iso.split('-').map(Number)
  const dt = new Date(y, mo - 1, d)
  const m = dt.toLocaleDateString('en-US', { month: 'short' })
  const weekday = dt.toLocaleDateString('en-US', { weekday: 'short' })
  return { m, d: String(d).padStart(2, '0'), weekday, full: `${weekday} · ${m} ${d}` }
}

// 18 -> "6 PM", 13 -> "1 PM", 12 -> "12 PM", 0 -> "12 AM"
export function hourLabel(h) {
  const ampm = h < 12 || h === 24 ? 'AM' : 'PM'
  let hr = h % 12
  if (hr === 0) hr = 12
  return `${hr} ${ampm}`
}

export const rangeLabel = (start, end) => `${hourLabel(start)}–${hourLabel(end)}`

// True if [aStart,aEnd) overlaps any booking on the same date.
export function hasConflict(bookings, date, aStart, aEnd, ignoreId) {
  return bookings.some(b =>
    b.date === date && b.id !== ignoreId && aStart < b.end_hour && aEnd > b.start_hour
  )
}
