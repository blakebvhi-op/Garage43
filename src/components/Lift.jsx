import { useMemo, useState } from 'react'
import { Plus, Lock } from 'lucide-react'
import { Eyebrow, H2, Panel, Modal, inputCls, btnPrimary } from './ui'
import { nameOf, fmtDate, hourLabel, rangeLabel, hasConflict } from '../store'

const OPEN = 8       // lift opens 8 AM
const CLOSE = 22     // last slot ends by 10 PM
const MAX_HOURS = 4  // cap a single booking

const isoOf = d => {
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function BookModal({ date, start, maxHours, onBook, onClose }) {
  const [dur, setDur] = useState(1)
  const [note, setNote] = useState('')
  const durs = Array.from({ length: maxHours }, (_, i) => i + 1)
  return (
    <Modal title="Claim lift time" onClose={onClose}>
      <div className="space-y-3">
        <div className="bg-ink border border-edge rounded-md p-3">
          <Eyebrow>{fmtDate(date).full}</Eyebrow>
          <div className="font-mono font-bold text-[22px] mt-1">{rangeLabel(start, start + dur)}</div>
        </div>
        <div>
          <Eyebrow className="mb-1.5">How long</Eyebrow>
          <div className="flex gap-2">
            {durs.map(d => (
              <button key={d} onClick={() => setDur(d)}
                className={`flex-1 font-mono font-bold py-2 rounded-md border ${
                  dur === d ? 'border-lift text-lift bg-lift/10' : 'border-edge text-muted'}`}>
                {d}h
              </button>
            ))}
          </div>
        </div>
        <div>
          <Eyebrow className="mb-1.5">What for</Eyebrow>
          <input className={inputCls} value={note} onChange={e => setNote(e.target.value)} placeholder="Tire swap, valve check…" />
        </div>
        <button className={`${btnPrimary} w-full`}
          onClick={() => { onBook({ date, start_hour: start, end_hour: start + dur, note: note.trim() || 'Lift time' }); onClose() }}>
          Book it
        </button>
      </div>
    </Modal>
  )
}

export default function Lift({ lift, me, onBook, onRelease }) {
  // 10-day strip, starting at today or the earliest existing booking (so history shows)
  const base = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const dates = lift.map(b => b.date).sort()
    if (dates[0]) {
      const [y, m, d] = dates[0].split('-').map(Number)
      const earliest = new Date(y, m - 1, d)
      if (earliest < today) return earliest
    }
    return today
  }, [lift])

  const days = useMemo(
    () => Array.from({ length: 10 }, (_, i) => { const d = new Date(base); d.setDate(d.getDate() + i); return isoOf(d) }),
    [base]
  )
  const hasBooking = d => lift.some(b => b.date === d)
  const [day, setDay] = useState(() => days.find(hasBooking) || days[0])
  const [booking, setBooking] = useState(null) // { start, maxHours }

  const dayBookings = lift.filter(b => b.date === day).sort((a, b) => a.start_hour - b.start_hour)

  const openBook = h => {
    const nextStart = dayBookings.filter(b => b.start_hour > h).reduce((m, b) => Math.min(m, b.start_hour), CLOSE)
    const maxHours = Math.min(MAX_HOURS, nextStart - h)
    setBooking({ start: h, maxHours })
  }

  // Build rows: multi-hour booked blocks + single free hours
  const rows = []
  for (let h = OPEN; h < CLOSE;) {
    const b = dayBookings.find(x => x.start_hour === h)
    if (b) { rows.push({ kind: 'booked', b }); h = b.end_hour; continue }
    const covered = dayBookings.find(x => h >= x.start_hour && h < x.end_hour)
    if (covered) { h++; continue }
    rows.push({ kind: 'free', h }); h++
  }

  return (
    <div className="p-4 pb-6 md:px-6 md:max-w-[820px]">
      <Eyebrow>One lift · first come, first served</Eyebrow>
      <H2>Lift Schedule</H2>

      {/* day strip */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {days.map(d => {
          const f = fmtDate(d)
          const on = d === day
          return (
            <button key={d} onClick={() => setDay(d)}
              className={`shrink-0 w-[52px] rounded-md border py-2 flex flex-col items-center ${
                on ? 'bg-ink border-lift' : 'bg-steel border-edge'}`}>
              <span className={`font-cond font-semibold uppercase text-[10px] tracking-wider ${on ? 'text-lift' : 'text-muted'}`}>{f.weekday}</span>
              <span className="font-mono font-bold text-[17px] leading-tight">{f.d}</span>
              <span className={`w-1.5 h-1.5 rounded-full mt-1 ${hasBooking(d) ? 'bg-lift' : 'bg-transparent'}`} />
            </button>
          )
        })}
      </div>

      <Panel className="mt-1.5 divide-y divide-edge">
        {rows.map((row, i) =>
          row.kind === 'booked' ? (
            <div key={i} className="flex items-center gap-3 p-3 border-l-[3px] border-l-lift bg-lift/[0.07]">
              <div className="font-mono text-[13px] text-lift w-[92px] shrink-0">{rangeLabel(row.b.start_hour, row.b.end_hour)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Lock size={12} className="text-lift shrink-0" />
                  <b className="font-semibold text-[14px] truncate">{nameOf(row.b.member)}</b>
                </div>
                <span className="text-muted text-[12.5px] truncate block">{row.b.note}</span>
              </div>
              {row.b.member === me && (
                <button onClick={() => onRelease(row.b.id)}
                  className="font-cond font-semibold uppercase tracking-wide text-[11px] text-muted border border-edge rounded px-2.5 py-1.5 shrink-0">
                  Release
                </button>
              )}
            </div>
          ) : (
            <button key={i} onClick={() => openBook(row.h)}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-steel2/40">
              <div className="font-mono text-[13px] text-dim w-[92px] shrink-0">{hourLabel(row.h)}</div>
              <span className="flex-1 text-muted text-[13px]">Open — tap to claim</span>
              <Plus size={16} className="text-muted shrink-0" />
            </button>
          )
        )}
      </Panel>

      {booking && (
        <BookModal date={day} start={booking.start} maxHours={booking.maxHours}
          onClose={() => setBooking(null)}
          onBook={b => { if (!hasConflict(lift, b.date, b.start_hour, b.end_hour)) onBook({ ...b, member: me }) }} />
      )}
    </div>
  )
}
