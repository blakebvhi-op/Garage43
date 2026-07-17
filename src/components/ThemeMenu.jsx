import { Check } from 'lucide-react'
import { Modal, Eyebrow } from './ui'
import { THEMES } from '../themes'

export default function ThemeMenu({ current, onPick, onClose }) {
  return (
    <Modal title="Color scheme" onClose={onClose}>
      <Eyebrow className="mb-3">Just for you — this only changes how it looks on your account.</Eyebrow>
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map(t => {
          const active = t.id === current
          return (
            <button key={t.id} onClick={() => onPick(t.id)}
              className="rounded-lg border p-3 text-left relative"
              style={{ background: t.panel, borderColor: active ? t.accent : 'rgba(255,255,255,.12)' }}>
              {active && (
                <span className="absolute top-2 right-2 grid place-items-center rounded-full w-5 h-5"
                  style={{ background: t.accent }}>
                  <Check size={13} color={t.bg} strokeWidth={3} />
                </span>
              )}
              <div className="flex gap-1.5 mb-3">
                <span className="w-6 h-6 rounded" style={{ background: t.bg, border: '1px solid rgba(255,255,255,.1)' }} />
                <span className="w-6 h-6 rounded" style={{ background: t.accent }} />
              </div>
              <div className="font-cond font-semibold uppercase tracking-wide text-[13px]" style={{ color: '#EAE7DE' }}>
                {t.name}
              </div>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}
