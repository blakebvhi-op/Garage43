import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Eyebrow, H2, Tag, Modal, inputCls, btnPrimary } from './ui'
import { CATEGORIES } from '../data/seed'
import { fmtDate, nameOf, rangeLabel } from '../store'

const FILTERS = [
  { f: 'all',   label: 'All' },
  { f: 'lift',  label: 'Lift' },
  { f: 'party', label: 'Party' },
  { f: 'meet',  label: 'Meeting' },
]

function AddEvent({ onAdd, onClose }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('party')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [desc, setDesc] = useState('')
  const valid = title.trim() && date

  return (
    <Modal title="Add to the calendar" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <Eyebrow className="mb-1.5">What is it</Eyebrow>
          <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Dyno Day + Cookout" />
        </div>
        <div>
          <Eyebrow className="mb-1.5">Type</Eyebrow>
          <div className="flex gap-2">
            {Object.entries(CATEGORIES).map(([k, c]) => (
              <button key={k} onClick={() => setType(k)}
                className="flex-1 font-cond font-semibold uppercase tracking-wide text-[12.5px] py-2 rounded-md border"
                style={type === k
                  ? { color: c.color, borderColor: c.color, background: c.color + '1f' }
                  : { color: '#8B939C', borderColor: '#3A424B' }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <Eyebrow className="mb-1.5">Date</Eyebrow>
            <input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="flex-1">
            <Eyebrow className="mb-1.5">Time</Eyebrow>
            <input className={inputCls} value={time} onChange={e => setTime(e.target.value)} placeholder="7:00 PM" />
          </div>
        </div>
        <div>
          <Eyebrow className="mb-1.5">Details</Eyebrow>
          <input className={inputCls} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Anything to know" />
        </div>
        <button disabled={!valid} className={`${btnPrimary} w-full`}
          onClick={() => { onAdd({ title: title.trim(), type, date, time: time.trim() || 'All day', details: desc.trim() }); onClose() }}>
          Add event
        </button>
      </div>
    </Modal>
  )
}

export default function Calendar({ events, lift = [], onAddEvent }) {
  const [filter, setFilter] = useState('all')
  const [adding, setAdding] = useState(false)

  // Lift reservations show up here as read-only lift entries (managed on the Lift tab)
  const liftItems = lift.map(b => ({
    id: 'cal-' + b.id,
    type: 'lift',
    title: `${nameOf(b.member)} — lift`,
    date: b.date,
    time: rangeLabel(b.start_hour, b.end_hour),
    details: b.note,
    sort: b.start_hour,
  }))

  const list = [...events, ...liftItems]
    .filter(e => filter === 'all' || e.type === filter)
    .sort((a, b) => a.date.localeCompare(b.date) || String(a.time).localeCompare(String(b.time)))

  const byDay = {}
  list.forEach(e => { (byDay[e.date] = byDay[e.date] || []).push(e) })

  return (
    <div className="p-4 pb-6 md:px-6 md:max-w-[820px]">
      <div className="flex items-start justify-between">
        <div>
          <Eyebrow>March 2026</Eyebrow>
          <H2>Garage Calendar</H2>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 bg-hazard text-ink font-cond font-bold uppercase tracking-wide text-[12.5px] px-3 py-2 rounded-md shrink-0">
          <Plus size={16} /> Event
        </button>
      </div>

      <div className="flex gap-2 mb-3.5 flex-wrap">
        {FILTERS.map(({ f, label }) => {
          const on = filter === f
          const color = CATEGORIES[f]?.color
          return (
            <button key={f} onClick={() => setFilter(f)}
              className="font-cond font-semibold uppercase tracking-wide text-[12.5px] px-3 py-1.5 rounded-full border bg-steel flex items-center gap-1.5"
              style={on
                ? { color: color || '#EAE7DE', borderColor: color || '#EAE7DE' }
                : { color: '#8B939C', borderColor: '#3A424B' }}>
              {color && <span className="w-2 h-2 rounded-[2px]" style={{ background: color }} />}
              {label}
            </button>
          )
        })}
      </div>

      {Object.keys(byDay).length === 0 ? (
        <div className="border border-dashed border-edge rounded-md p-4 text-center text-muted">
          Nothing scheduled in this filter yet.
        </div>
      ) : (
        Object.entries(byDay).map(([date, evs]) => (
          <div key={date} className="mb-1.5">
            <div className="flex justify-between font-cond font-semibold uppercase tracking-wider text-xs text-muted pt-3.5 pb-2 border-b border-edge mb-2.5">
              <span>{fmtDate(date).full}</span>
              <span>{evs.length} event{evs.length > 1 ? 's' : ''}</span>
            </div>
            {evs.map(e => (
              <div key={e.id} className="flex gap-3 p-3 rounded-r-md bg-steel mb-2.5 border-l-[3px]"
                style={{ borderLeftColor: CATEGORIES[e.type].color }}>
                <div className="font-mono text-[12.5px] text-muted shrink-0 pt-0.5 w-[62px]">{e.time}</div>
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-[15px] mb-0.5">{e.title}</h4>
                  <p className="text-muted text-[12.5px]">{e.details}</p>
                  <div className="mt-1.5"><Tag type={e.type} /></div>
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      {adding && <AddEvent onClose={() => setAdding(false)} onAdd={onAddEvent} />}
    </div>
  )
}
