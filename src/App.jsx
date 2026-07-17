import { useEffect, useState } from 'react'
import { LayoutGrid, CalendarDays, Wrench, MessageSquare, Receipt, LogOut, Palette } from 'lucide-react'
import Dashboard from './components/Dashboard'
import Calendar from './components/Calendar'
import Lift from './components/Lift'
import Forum from './components/Forum'
import Receipts from './components/Receipts'
import Login from './components/Login'
import ProfileSetup from './components/ProfileSetup'
import AuthShell from './components/AuthShell'
import ThemeMenu from './components/ThemeMenu'
import { useAuth } from './auth'
import * as db from './db'
import { loadTheme, applyTheme, saveTheme, DEFAULT_THEME } from './themes'
import { SEED_EVENTS, SEED_RECEIPTS, SEED_POLL, SEED_LIFT, SEED_POSTS } from './data/seed'

const NAV = [
  { id: 'dash',     label: 'Board',    crumb: 'Community Hub · The Board',         Icon: LayoutGrid },
  { id: 'calendar', label: 'Calendar', crumb: 'Community Hub · Garage Calendar',   Icon: CalendarDays },
  { id: 'lift',     label: 'Lift',     crumb: 'Community Hub · Lift Schedule',     Icon: Wrench },
  { id: 'forum',    label: 'Forum',    crumb: 'Community Hub · The Forum',         Icon: MessageSquare },
  { id: 'receipts', label: 'Receipts', crumb: 'Community Hub · Receipts & Ledger', Icon: Receipt },
]

let idCount = 0
const uid = p => `${p}${Date.now()}${idCount++}`

export default function App() {
  const { ready, online, session, profile, me, signOut } = useAuth()

  const [tab, setTab] = useState('dash')
  const [events, setEvents] = useState(SEED_EVENTS)
  const [receipts, setReceipts] = useState(SEED_RECEIPTS)
  const [pollArr, setPollArr] = useState([SEED_POLL])
  const [lift, setLift] = useState(SEED_LIFT)
  const [posts, setPosts] = useState(SEED_POSTS)
  const [theme, setTheme] = useState(DEFAULT_THEME)
  const [themeOpen, setThemeOpen] = useState(false)
  const poll = pollArr[0] || SEED_POLL

  const signedIn = !online || (session && profile)

  // Load once we're authenticated (or offline)
  useEffect(() => {
    if (!signedIn) return
    let alive = true
    ;(async () => {
      try {
        const [ev, rc, pl, lf, ps] = await Promise.all([
          db.load('events', SEED_EVENTS),
          db.load('receipts', SEED_RECEIPTS),
          db.load('poll', [SEED_POLL]),
          db.load('lift', SEED_LIFT),
          db.load('posts', SEED_POSTS),
        ])
        if (!alive) return
        setEvents(ev); setReceipts(rc); setPollArr(pl.length ? pl : [SEED_POLL]); setLift(lf); setPosts(ps)
      } catch (e) { console.error('load failed', e) }
    })()
    return () => { alive = false }
  }, [signedIn])

  // Live updates from other members (no-op offline)
  useEffect(() => {
    if (!signedIn) return
    const reload = (table, setter, seed) => async () => {
      try { setter(await db.load(table, seed)) } catch (e) { console.error(e) }
    }
    const unsub = [
      db.subscribe('events',   reload('events', setEvents, SEED_EVENTS)),
      db.subscribe('receipts', reload('receipts', setReceipts, SEED_RECEIPTS)),
      db.subscribe('poll',     reload('poll', setPollArr, [SEED_POLL])),
      db.subscribe('lift',     reload('lift', setLift, SEED_LIFT)),
      db.subscribe('posts',    reload('posts', setPosts, SEED_POSTS)),
    ]
    return () => unsub.forEach(u => u && u())
  }, [signedIn])

  // ---- gates ----
  if (!ready) return <Splash />
  if (online && !session) return <Login />
  if (online && session && !profile) return <ProfileSetup />

  // Apply this member's saved color scheme
  useEffect(() => {
    const t = loadTheme(me)
    setTheme(t); applyTheme(t)
  }, [me])

  const chooseTheme = id => { setTheme(id); applyTheme(id); saveTheme(me, id); setThemeOpen(false) }

  const go = id => { setTab(id); window.scrollTo(0, 0) }

  const setRsvp = (eventId, status) =>
    setEvents(evs => {
      const next = evs.map(e => {
        if (e.id !== eventId) return e
        const rsvp = { ...(e.rsvp || {}) }
        if (status == null) delete rsvp[me]; else rsvp[me] = status
        return { ...e, rsvp }
      })
      const changed = next.find(e => e.id === eventId)
      if (changed) db.upsert('events', changed).catch(console.error)
      return next
    })

  const addEvent = ev => {
    const row = { ...ev, id: uid('e'), rsvp: {} }
    setEvents(x => [...x, row]); db.upsert('events', row).catch(console.error)
  }

  const addReceipt = rc => {
    const row = { ...rc, id: uid('r') }
    setReceipts(x => [row, ...x]); db.upsert('receipts', row).catch(console.error)
  }

  const vote = optionId =>
    setPollArr(([p]) => {
      if (!p || p.options.some(o => o.votes.includes(me))) return [p]
      const next = { ...p, options: p.options.map(o => o.id === optionId ? { ...o, votes: [...o.votes, me] } : o) }
      db.upsert('poll', next).catch(console.error)
      return [next]
    })

  const bookLift = b => {
    const row = { ...b, id: uid('lb') }
    setLift(x => [...x, row]); db.upsert('lift', row).catch(console.error)
  }

  const releaseLift = id => {
    setLift(x => x.filter(b => b.id !== id)); db.remove('lift', id).catch(console.error)
  }

  const addPost = body => {
    const row = { id: uid('ps'), author: me, body, created_at: new Date().toISOString() }
    setPosts(x => [row, ...x]); db.upsert('posts', row).catch(console.error)
  }

  const createPoll = (question, optionLabels) => {
    const p = {
      id: 'active', author: me, question, closes: '',
      options: optionLabels.map((label, i) => ({ id: `o${i}`, label, votes: [] })),
    }
    setPollArr([p]); db.upsert('poll', p).catch(console.error)
  }

  const meta = NAV.find(n => n.id === tab)

  return (
    <div className="flex min-h-screen max-w-[1180px] mx-auto">
      {/* Desktop rail */}
      <aside className="hidden md:flex flex-col w-[220px] shrink-0 bg-steel border-r border-edge sticky top-0 h-screen">
        <div className="px-[18px] pt-[18px] pb-3.5 border-b border-edge"><Brand /></div>
        <nav className="flex flex-col p-2.5 gap-1">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => go(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-cond font-semibold uppercase tracking-wide text-[14px] text-left ${
                tab === id ? 'bg-ink text-chalk' : 'text-muted'}`}>
              <Icon size={20} className={tab === id ? 'text-hazard' : 'text-muted'} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-edge space-y-3">
          <SyncBadge online={online} />
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted text-[13px] truncate">{profile?.name}</span>
            {online && (
              <button onClick={signOut} title="Sign out"
                className="flex items-center gap-1 text-dim hover:text-chalk font-cond uppercase tracking-wide text-[11px]">
                <LogOut size={13} /> Out
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 pb-[92px] md:pb-0">
        <header className="bg-steel border-b border-edge px-[18px] pt-3.5 pb-3 sticky top-0 z-20">
          <div className="flex items-center justify-between gap-3">
            <Brand crumb={meta?.crumb} />
          <div className="flex items-center gap-2">
            <button onClick={() => setThemeOpen(true)} title="Color scheme"
              className="w-[34px] h-[34px] rounded-full bg-steel2 border border-edge grid place-items-center text-muted hover:text-chalk shrink-0">
              <Palette size={16} />
            </button>
            <button onClick={online ? signOut : undefined} title={online ? 'Sign out' : undefined}
              className="md:hidden w-[34px] h-[34px] rounded-full bg-steel2 border border-edge grid place-items-center font-mono text-[12px] shrink-0">
              {profile?.initials || 'ME'}
            </button>
          </div>
          </div>
        </header>
        <div className="hazard-strip h-1.5" />

        {tab === 'dash' && <Dashboard events={events} receipts={receipts} poll={poll} lift={lift} me={me} onRsvp={setRsvp} go={go} />}
        {tab === 'calendar' && <Calendar events={events} lift={lift} onAddEvent={addEvent} />}
        {tab === 'lift' && <Lift lift={lift} me={me} onBook={bookLift} onRelease={releaseLift} />}
        {tab === 'forum' && <Forum posts={posts} poll={poll} me={me} onVote={vote} onPost={addPost} onCreatePoll={createPoll} />}
        {tab === 'receipts' && <Receipts receipts={receipts} me={me} onAddReceipt={addReceipt} />}
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 max-w-[1180px] mx-auto bg-steel border-t border-edge flex z-30"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => go(id)}
            className={`flex-1 py-2 flex flex-col items-center gap-0.5 ${tab === id ? 'text-hazard' : 'text-dim'}`}>
            <Icon size={21} strokeWidth={1.8} />
            <span className="font-cond font-semibold uppercase tracking-wide text-[10px]">{label}</span>
          </button>
        ))}
      </nav>

      {themeOpen && <ThemeMenu current={theme} onPick={chooseTheme} onClose={() => setThemeOpen(false)} />}
    </div>
  )
}

function Splash() {
  return (
    <AuthShell>
      <div className="text-center text-muted font-cond uppercase tracking-wide text-[13px]">Opening the garage…</div>
    </AuthShell>
  )
}

function SyncBadge({ online }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-cond font-semibold uppercase tracking-wide text-[10.5px]"
      style={{ color: online ? '#5FA463' : '#8B939C' }}>
      <span className="w-2 h-2 rounded-full" style={{ background: online ? '#5FA463' : '#5B636C' }} />
      {online ? 'Synced' : 'On this device'}
    </span>
  )
}

function Brand({ crumb }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="bg-hazard text-ink font-display font-black text-[20px] leading-none px-2.5 py-2 rounded-[3px] tracking-tighter"
        style={{ boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.25)' }}>43</span>
      <div>
        <h1 className="font-display font-extrabold text-[19px] tracking-tight leading-none">GARAGE</h1>
        <div className="font-cond font-semibold uppercase tracking-[0.14em] text-[10.5px] text-muted mt-0.5">
          {crumb || 'Community Hub'}
        </div>
      </div>
    </div>
  )
}
