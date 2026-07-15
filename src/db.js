import { supabase, isOnline } from './supabase'

// One data API, two backends. Online → Supabase tables + realtime.
// Offline → localStorage. Components never know which one they're talking to.

export const online = isOnline

const cache = {} // table -> rows, used in localStorage mode

const ls = {
  get(table, seed) {
    try {
      const raw = localStorage.getItem('g43.' + table)
      return raw != null ? JSON.parse(raw) : seed
    } catch {
      return seed
    }
  },
  set(table, rows) {
    try { localStorage.setItem('g43.' + table, JSON.stringify(rows)) } catch { /* ignore */ }
  },
}

export async function load(table, seed) {
  if (online) {
    const { data, error } = await supabase.from(table).select('*')
    if (error) throw error
    return data || []
  }
  cache[table] = ls.get(table, seed)
  return cache[table]
}

export async function upsert(table, row) {
  if (online) {
    const { error } = await supabase.from(table).upsert(row)
    if (error) throw error
    return
  }
  const rows = cache[table] || []
  const i = rows.findIndex(r => r.id === row.id)
  if (i >= 0) rows[i] = row
  else rows.push(row)
  cache[table] = [...rows]
  ls.set(table, cache[table])
}

export async function remove(table, id) {
  if (online) {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
    return
  }
  cache[table] = (cache[table] || []).filter(r => r.id !== id)
  ls.set(table, cache[table])
}

// Live updates from other members. No-op in localStorage mode.
export function subscribe(table, onChange) {
  if (!online) return () => {}
  const channel = supabase
    .channel('rt-' + table)
    .on('postgres_changes', { event: '*', schema: 'public', table }, onChange)
    .subscribe()
  return () => supabase.removeChannel(channel)
}
