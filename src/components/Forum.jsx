import { useState } from 'react'
import { ArrowUp, MessageSquare, Pin } from 'lucide-react'
import { Eyebrow, H2, Panel, Avatar, inputCls } from './ui'
import { SEED_POSTS } from '../data/seed'
import { nameOf } from '../store'

function Poll({ poll, me, onVote }) {
  const myVote = poll.options.find(o => o.votes.includes(me))?.id
  const total = poll.options.reduce((s, o) => s + o.votes.length, 0)
  const max = Math.max(...poll.options.map(o => o.votes.length))

  return (
    <div className="border border-edge rounded-md p-3 bg-ink">
      <div className="font-display font-bold text-[15px] mb-3">{poll.question}</div>
      {poll.options.map(o => {
        const pct = total ? Math.round((o.votes.length / total) * 100) : 0
        const mine = o.id === myVote
        const winning = myVote && o.votes.length === max
        return (
          <button key={o.id} disabled={!!myVote} onClick={() => onVote(o.id)}
            className={`relative overflow-hidden w-full text-left border rounded-md px-3 py-2.5 mb-2 text-sm flex justify-between items-center ${
              mine ? 'border-hazard' : 'border-edge'} ${myVote ? 'cursor-default' : 'cursor-pointer'}`}>
            <span className="absolute inset-0 z-0 transition-[width] duration-500"
              style={{ width: myVote ? `${pct}%` : 0, background: winning ? 'rgba(95,164,99,.2)' : 'rgba(240,83,28,.15)' }} />
            <span className="relative z-10">{o.label}</span>
            {myVote && <span className="relative z-10 font-mono text-[13px] text-muted">{pct}%</span>}
          </button>
        )
      })}
      <div className="font-mono text-xs text-muted mt-1">
        {myVote
          ? `${total} votes · you voted "${poll.options.find(o => o.id === myVote).label}" · closes ${poll.closes}`
          : `${total} votes · tap to vote · closes ${poll.closes}`}
      </div>
    </div>
  )
}

export default function Forum({ poll, me, onVote }) {
  const [draft, setDraft] = useState('')
  return (
    <div className="p-4 pb-6 md:px-6 md:max-w-[820px]">
      <Eyebrow>6 members · 3 active threads</Eyebrow>
      <H2>The Forum</H2>

      <Panel className="flex gap-2.5 items-center p-3 mb-3.5">
        <input className={inputCls} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Post to the garage…" />
        <button className="bg-hazard text-ink font-cond font-bold uppercase tracking-wide px-3.5 py-2.5 rounded-md text-[13px] shrink-0">
          Post
        </button>
      </Panel>

      {/* Pinned poll */}
      <Panel className="p-4 mb-3">
        <div className="flex items-center gap-2.5 mb-2.5">
          <Avatar id={poll.author} />
          <div><b className="text-sm">{nameOf(poll.author)}</b> <span className="text-muted text-xs font-mono">· {poll.age}</span></div>
          <span className="ml-auto flex items-center gap-1 font-cond font-semibold uppercase tracking-wider text-[10px] text-hazard">
            <Pin size={11} /> Pinned
          </span>
        </div>
        <Poll poll={poll} me={me} onVote={onVote} />
      </Panel>

      {SEED_POSTS.map(p => (
        <Panel key={p.id} className="p-4 mb-3">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Avatar id={p.author} />
            <div><b className="text-sm">{nameOf(p.author)}</b> <span className="text-muted text-xs font-mono">· {p.age}</span></div>
          </div>
          <p className="text-[14.5px] leading-relaxed mb-2.5">{p.body}</p>
          <div className="flex gap-4 text-muted text-[12.5px]">
            <span className="flex items-center gap-1.5"><ArrowUp size={14} /> {p.up}</span>
            <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {p.replies} replies</span>
          </div>
        </Panel>
      ))}
    </div>
  )
}
