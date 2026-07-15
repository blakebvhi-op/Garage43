import { CATEGORIES } from '../data/seed'
import { initialsOf } from '../store'
import { X } from 'lucide-react'

export function Eyebrow({ children, className = '' }) {
  return (
    <div className={`font-cond font-semibold uppercase tracking-[0.14em] text-[11px] text-muted ${className}`}>
      {children}
    </div>
  )
}

export function H2({ children }) {
  return <h2 className="font-display font-extrabold text-[22px] tracking-tight mt-0.5 mb-3.5">{children}</h2>
}

export function Panel({ children, className = '' }) {
  return <div className={`bg-steel border border-edge rounded-md ${className}`}>{children}</div>
}

export function Avatar({ id, size = 30 }) {
  const initials = initialsOf(id)
  return (
    <span
      className="rounded-full bg-steel2 border border-edge grid place-items-center font-mono text-chalk shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  )
}

export function Tag({ type }) {
  const c = CATEGORIES[type]
  if (!c) return null
  return (
    <span
      className="font-cond font-semibold uppercase tracking-wide text-[10.5px] px-1.5 py-0.5 rounded inline-flex items-center gap-1.5 border"
      style={{ color: c.color, background: c.color + '20', borderColor: c.color + '55' }}
    >
      <span className="w-2 h-2 rounded-[2px]" style={{ background: c.color }} />
      {c.label}
    </span>
  )
}

export function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-steel border border-edge rounded-t-xl sm:rounded-xl max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <div className="hazard-strip h-1.5 rounded-t-xl" />
        <div className="flex items-center justify-between px-4 py-3 border-b border-edge">
          <h3 className="font-display font-bold text-[17px]">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-chalk">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

export const inputCls =
  'w-full bg-ink border border-edge rounded-md text-chalk px-3 py-2.5 text-sm ' +
  'placeholder:text-dim focus:border-hazard'

export const btnPrimary =
  'bg-hazard text-ink font-cond font-bold uppercase tracking-wide text-[13px] px-4 py-2.5 rounded-md ' +
  'disabled:opacity-40'
