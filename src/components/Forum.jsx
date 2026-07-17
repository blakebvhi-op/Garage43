import { useState } from 'react'
import { ArrowUp, MessageSquare, Pin, Plus, X } from 'lucide-react'
import { Eyebrow, H2, Panel, Avatar, inputCls } from './ui'
import { nameOf, timeAgo } from '../store'

function Poll({ poll, me, onVote }) {
  const myVote = poll.options.find(o => o.votes.includes(me))?.id
  const total = poll.options.reduce((s, o) => s + o.votes.length, 0)
  const max = Math.max(...poll.options.map(o => o.votes.length), 0)

  return (
    <div className="border border-edge rounded-md p-3 bg-ink">
      <div className="font-display font-bold text-[15px] mb-3">{poll.question}</div>
      {poll.options.map(o => {
        const pct = total ? Math.round((o.votes.length / total) * 100) : 0
        const mine = o.id === myVote
        const winning = myVote && o.votes.length === max && max > 0
        return (
          <button key={o.id} disabled={!!myVote} onClick={() => onVote(o.id)}
            className={`relative overflow-hidden w-full text-left border rounded-md px-3 py-2.5 mb-2 text-sm flex justify-between items-center ${
              mine ? 'border-hazard' : 'border-edge'} ${myVote ? 'cursor-default' : 'cursor-pointer'}`}>
            <span className="absolute inset-0 z-0 transition-[width] duration-500"
              style={{ width: myVote ? `${pct}%` : 0, background: winning ? 'rgb(var(--good) / .2)' : 'rgb(var(--hazard) / .15)' }} />
            <span className="relative z-10">{o.label}</span>
            {myVote && <span className="relative z-10 font-mono text-[13px] text-muted">{pct}%</span>}
          </button>
        )
      })}
      <div className="font-mono text-xs text-muted mt-1">
        {myVote
          ? `${total} vote${total === 1 ? '' : 's'} · you voted "${poll.options.find(o => o.id === myVote).label}"`
          : `${total} vote${total === 1 ? '' : 's'} · tap to vote`}
      </div>
    </div>
  )
}

function Composer({ me, onPost, onCreatePoll }) {
  const [mode, setMode] = useState('post') // 'post' | 'poll'
  const [text, setText] = useState('')
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])

  const post = () => { if (text.trim()) { onPost(text.trim()); setText('') } }
  const create = () => {
    const opts = options.map(o => o.trim()).filter(Boolean)
    if (question.trim() && opts.length >= 2) {
      onCreatePoll(question.trim(), opts)
      setQuestion(''); setOptions(['', ''])
    }
  }

  return (
    <Panel className="p-3 mb-3.5">
      <div className="flex gap-1 mb-3 bg-ink border border-edge rounded-md p-1 w-fit">
        {[['post', 'Post'], ['poll', 'Poll']].map(([k, label]) => (
          <button key={k} onClick={() => setMode(k)}
            className={`font-cond font-semibold uppercase tracking-wide text-[12px] px-3 py-1.5 rounded ${
              mode === k ? 'bg-steel2 text-chalk' : 'text-muted'}`}>
            {label}
          </button>
        ))}
      </div>

      {mode === 'post' ? (
        <div className="flex gap-2.5 items-center">
          <input className={inputCls} value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && post()} placeholder="Post to the garage…" />
          <button onClick={post}
            className="bg-hazard text-ink font-cond font-bold uppercase tracking-wide px-3.5 py-2.5 rounded-md text-[13px] shrink-0">
            Post
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input className={inputCls} value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask the crew a question…" />
          {options.map((o, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className={inputCls} value={o}
                onChange={e => setOptions(opts => opts.map((x, j) => j === i ? e.target.value : x))}
                placeholder={`Option ${i + 1}`} />
              {options.length > 2 && (
                <button onClick={() => setOptions(opts => opts.filter((_, j) => j !== i))} className="text-muted shrink-0"><X size={16} /></button>
              )}
            </div>
          ))}
          <div className="flex justify-between items-center">
            {options.length < 4
              ? <button onClick={() => setOptions(opts => [...opts, ''])} className="flex items-center gap-1 text-muted font-cond uppercase tracking-wide text-[12px]"><Plus size={14} /> Option</button>
              : <span />}
            <button onClick={create}
              className="bg-hazard text-ink font-cond font-bold uppercase tracking-wide px-3.5 py-2.5 rounded-md text-[13px]">
              Start poll
            </button>
          </div>
        </div>
      )}
    </Panel>
  )
}

export default function Forum({ posts = [], poll, me, onVote, onPost, onCreatePoll }) {
  const ordered = [...posts].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))

  return (
    <div className="p-4 pb-6 md:px-6 md:max-w-[820px]">
      <Eyebrow>The garage, out loud</Eyebrow>
      <H2>The Forum</H2>

      <Composer me={me} onPost={onPost} onCreatePoll={onCreatePoll} />

      {poll && (
        <Panel className="p-4 mb-3">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Avatar id={poll.author} />
            <div><b className="text-sm">{nameOf(poll.author)}</b> <span className="text-muted text-xs font-mono">· poll</span></div>
            <span className="ml-auto flex items-center gap-1 font-cond font-semibold uppercase tracking-wider text-[10px] text-hazard">
              <Pin size={11} /> Active
            </span>
          </div>
          <Poll poll={poll} me={me} onVote={onVote} />
        </Panel>
      )}

      {ordered.length === 0 && !poll && (
        <div className="border border-dashed border-edge rounded-md p-6 text-center text-muted">
          Nothing here yet. Say something or start a poll.
        </div>
      )}

      {ordered.map(p => (
        <Panel key={p.id} className="p-4 mb-3">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Avatar id={p.author} />
            <div><b className="text-sm">{nameOf(p.author)}</b> <span className="text-muted text-xs font-mono">· {timeAgo(p.created_at)}</span></div>
          </div>
          <p className="text-[14.5px] leading-relaxed">{p.body}</p>
        </Panel>
      ))}
    </div>
  )
}
