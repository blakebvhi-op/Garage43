import { Eyebrow, H2, Panel, Tag } from './ui'
import { CATEGORIES } from '../data/seed'
import { money, balanceOf, nameOf, fmtDate, rangeLabel, monthStartISO } from '../store'

function RsvpButtons({ event, me, onSet }) {
  const mine = event.rsvp?.[me]
  const opts = [
    { v: 'going', label: 'Going', on: 'bg-hazard text-ink border-hazard' },
    { v: 'maybe', label: 'Maybe', on: 'bg-meet text-ink border-meet' },
    { v: 'out',   label: 'Out',   on: 'bg-steel2 text-chalk border-edge' },
  ]
  return (
    <div className="flex gap-1.5 flex-wrap">
      {opts.map(o => (
        <button key={o.v} onClick={() => onSet(event.id, mine === o.v ? null : o.v)}
          className={`font-cond font-semibold uppercase tracking-wide text-[12px] px-3 py-1.5 rounded border ${
            mine === o.v ? o.on : 'bg-ink text-muted border-edge'}`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Dashboard({ events, receipts, poll, lift = [], me, onRsvp, go }) {
  const balance = balanceOf(receipts)
  const monthStart = monthStartISO()
  const spentThisMonth = receipts
    .filter(r => r.amount < 0 && r.date >= monthStart)
    .reduce((s, r) => s + Math.abs(r.amount), 0)

  const upcoming = [...events].sort((a, b) => a.date.localeCompare(b.date))
  const nextParty = upcoming.find(e => e.type === 'party') || upcoming[0]
  const nextLifts = [...lift]
    .sort((a, b) => a.date.localeCompare(b.date) || a.start_hour - b.start_hour)
    .slice(0, 2)
  const recent = [...receipts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)

  const going = nextParty ? Object.values(nextParty.rsvp || {}).filter(v => v === 'going').length : 0
  const maybe = nextParty ? Object.values(nextParty.rsvp || {}).filter(v => v === 'maybe').length : 0
  const pollVotes = poll ? poll.options.reduce((s, o) => s + o.votes.length, 0) : 0
  const nd = nextParty ? fmtDate(nextParty.date) : null

  return (
    <div className="p-4 pb-6 md:px-6 md:max-w-[820px]">
      <Eyebrow>Bay 43</Eyebrow>
      <H2>The Board</H2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Fund */}
        <Panel className="p-4 md:col-span-2">
          <Eyebrow>Garage Fund</Eyebrow>
          <div className="font-mono font-bold text-[40px] tracking-tighter leading-none mt-1.5">
            ${balance.toFixed(2)}
          </div>
          <div className="text-muted text-[13px] mt-1.5">
            {spentThisMonth > 0 ? `$${spentThisMonth.toFixed(2)} spent this month` : 'Nothing spent yet this month'}
          </div>
        </Panel>

        {/* Next up */}
        <Panel className="p-4">
          <div className="flex items-center justify-between mb-2.5">
            <Eyebrow>Next Up</Eyebrow>
            {nextParty && <Tag type={nextParty.type} />}
          </div>
          {nextParty ? (
            <div className="flex gap-3 items-start">
              <div className="text-center bg-ink border border-edge rounded-md px-2.5 py-1.5 min-w-[50px]">
                <div className="font-cond font-bold uppercase text-[11px] tracking-widest" style={{ color: CATEGORIES[nextParty.type].color }}>{nd.weekday}</div>
                <div className="font-mono font-bold text-[22px] leading-none mt-0.5">{nd.d}</div>
              </div>
              <div>
                <h3 className="font-display font-bold text-[16px] mb-1">{nextParty.title}</h3>
                <div className="text-muted text-[12.5px] mb-2.5">{nextParty.time} · {going} going · {maybe} maybe</div>
                <RsvpButtons event={nextParty} me={me} onSet={onRsvp} />
              </div>
            </div>
          ) : (
            <button onClick={() => go('calendar')} className="text-muted text-sm">No events yet — add one →</button>
          )}
        </Panel>

        {/* Lift schedule */}
        <Panel className="p-4">
          <div className="flex items-center justify-between mb-2.5">
            <Eyebrow>Lift Schedule</Eyebrow>
            <Tag type="lift" />
          </div>
          {nextLifts.length ? nextLifts.map(l => (
            <div key={l.id} className="flex items-center justify-between py-2 dashed-b last:border-0">
              <div className="min-w-0">
                <b className="font-semibold text-sm block truncate">{l.note}</b>
                <span className="text-muted text-xs">{nameOf(l.member)} · {fmtDate(l.date).full} · {rangeLabel(l.start_hour, l.end_hour)}</span>
              </div>
            </div>
          )) : (
            <button onClick={() => go('lift')} className="text-muted text-sm">Lift's open — book a slot →</button>
          )}
        </Panel>

        {/* Open vote */}
        {poll && (
          <Panel className="p-4">
            <div className="flex items-center justify-between mb-2.5">
              <Eyebrow>Open Vote</Eyebrow>
            </div>
            <h3 className="font-display font-bold text-[16px] mb-2">{poll.question}</h3>
            <div className="text-muted text-xs mb-3">{poll.options.length} options · {pollVotes} vote{pollVotes === 1 ? '' : 's'} so far</div>
            <button onClick={() => go('forum')} className="bg-hazard text-ink font-cond font-bold uppercase tracking-wide text-[13px] px-3 py-2 rounded-md">
              Cast your vote →
            </button>
          </Panel>
        )}

        {/* Recent receipts */}
        <Panel className="p-4">
          <div className="flex items-center justify-between mb-2.5">
            <Eyebrow>Recent Receipts</Eyebrow>
            <button onClick={() => go('receipts')} className="text-hazard text-xs font-cond font-semibold uppercase tracking-wide">All →</button>
          </div>
          {recent.length ? recent.map(r => (
            <div key={r.id} className="flex items-center justify-between py-2 dashed-b last:border-0">
              <div className="min-w-0">
                <b className="font-semibold text-sm block truncate">{r.vendor}</b>
                <span className="text-muted text-xs">{nameOf(r.by)} · {fmtDate(r.date).m} {Number(r.date.slice(-2))}</span>
              </div>
              <span className={`font-mono font-bold ${r.amount < 0 ? 'text-chalk' : 'text-good'}`}>{money(r.amount)}</span>
            </div>
          )) : (
            <button onClick={() => go('receipts')} className="text-muted text-sm">No receipts logged yet →</button>
          )}
        </Panel>
      </div>
    </div>
  )
}
