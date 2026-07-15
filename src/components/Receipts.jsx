import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Eyebrow, H2, Panel, Modal, inputCls, btnPrimary } from './ui'
import { money, balanceOf, nameOf, fmtDate } from '../store'

function LogReceipt({ me, onAdd, onClose }) {
  const [vendor, setVendor] = useState('')
  const [note, setNote] = useState('')
  const [amount, setAmount] = useState('')
  const [kind, setKind] = useState('out') // out = spent, in = deposit
  const [icon, setIcon] = useState('🛒')
  const valid = vendor.trim() && parseFloat(amount) > 0

  const ICONS = ['🛒', '🔥', '🧻', '🧊', '💵', '🔧', '🍔', '🥤']

  return (
    <Modal title="Log a receipt" onClose={onClose}>
      <div className="space-y-3">
        <div className="flex gap-2">
          <button onClick={() => setKind('out')}
            className={`flex-1 font-cond font-semibold uppercase tracking-wide text-[12.5px] py-2 rounded-md border ${
              kind === 'out' ? 'border-hazard text-hazard bg-hazard/10' : 'border-edge text-muted'}`}>
            Spent from fund
          </button>
          <button onClick={() => setKind('in')}
            className={`flex-1 font-cond font-semibold uppercase tracking-wide text-[12.5px] py-2 rounded-md border ${
              kind === 'in' ? 'border-good text-good bg-good/10' : 'border-edge text-muted'}`}>
            Deposit
          </button>
        </div>
        <div>
          <Eyebrow className="mb-1.5">Where / what</Eyebrow>
          <input className={inputCls} value={vendor} onChange={e => setVendor(e.target.value)} placeholder="e.g. Costco run" />
        </div>
        <div>
          <Eyebrow className="mb-1.5">What it was for</Eyebrow>
          <input className={inputCls} value={note} onChange={e => setNote(e.target.value)} placeholder="Snacks & drinks · cookout" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <Eyebrow className="mb-1.5">Amount</Eyebrow>
            <input type="number" inputMode="decimal" step="0.01" className={inputCls} value={amount}
              onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <Eyebrow className="mb-1.5">Tag</Eyebrow>
            <div className="flex gap-1 flex-wrap max-w-[150px]">
              {ICONS.map(i => (
                <button key={i} onClick={() => setIcon(i)}
                  className={`w-8 h-8 rounded-md border grid place-items-center text-base ${
                    icon === i ? 'border-hazard bg-hazard/10' : 'border-edge'}`}>{i}</button>
              ))}
            </div>
          </div>
        </div>
        <button disabled={!valid} className={`${btnPrimary} w-full`}
          onClick={() => {
            const a = parseFloat(amount)
            onAdd({
              vendor: vendor.trim(),
              note: note.trim() || '—',
              amount: kind === 'out' ? -Math.abs(a) : Math.abs(a),
              by: me, icon,
              date: new Date().toISOString().slice(0, 10),
            })
            onClose()
          }}>
          Save receipt
        </button>
      </div>
    </Modal>
  )
}

export default function Receipts({ receipts, me, onAddReceipt }) {
  const [logging, setLogging] = useState(false)
  const balance = balanceOf(receipts)
  const inMonth = receipts.filter(r => r.date >= '2026-03-01')
  const cashIn = inMonth.filter(r => r.amount > 0).reduce((s, r) => s + r.amount, 0)
  const cashOut = inMonth.filter(r => r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0)
  const list = [...receipts].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="p-4 pb-6 md:px-6 md:max-w-[820px]">
      <Eyebrow>Garage Fund · card ••4390</Eyebrow>
      <H2>Receipts & Ledger</H2>

      <Panel className="flex justify-between items-end gap-3 p-4 mb-3.5">
        <div>
          <Eyebrow>Current Balance</Eyebrow>
          <div className="font-mono font-bold text-[34px] tracking-tight leading-none mt-1">${balance.toFixed(2)}</div>
          <div className="text-muted text-xs mt-1.5">
            +${cashIn.toFixed(0)} in · −${cashOut.toFixed(2)} out this month
          </div>
        </div>
        <button onClick={() => setLogging(true)}
          className="flex items-center gap-1.5 bg-hazard text-ink font-cond font-bold uppercase tracking-wide text-[13px] px-3.5 py-2.5 rounded-md shrink-0">
          <Plus size={16} /> Log
        </button>
      </Panel>

      <Panel>
        {list.map(r => (
          <div key={r.id} className="flex gap-3 items-center p-3 border-b border-edge last:border-0">
            <div className="w-[38px] h-[38px] rounded-md bg-ink border border-edge grid place-items-center text-lg shrink-0">
              {r.icon || '🧾'}
            </div>
            <div className="flex-1 min-w-0">
              <b className="font-semibold text-[14.5px] block truncate">{r.vendor}</b>
              <span className="text-muted text-[12.5px] font-mono">{r.note}</span>
            </div>
            <div className="text-right shrink-0">
              <div className={`font-mono font-bold text-[15px] ${r.amount > 0 ? 'text-good' : 'text-chalk'}`}>{money(r.amount)}</div>
              <div className="text-muted text-[11px] font-cond uppercase tracking-wide">
                {nameOf(r.by)} · {fmtDate(r.date).m} {Number(r.date.slice(-2))}
              </div>
            </div>
          </div>
        ))}
      </Panel>

      {logging && <LogReceipt me={me} onClose={() => setLogging(false)} onAdd={onAddReceipt} />}
    </div>
  )
}
