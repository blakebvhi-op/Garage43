import { useState } from 'react'
import { useAuth } from '../auth'
import AuthShell from './AuthShell'
import { Panel, Eyebrow, inputCls, btnPrimary } from './ui'

export default function ProfileSetup() {
  const { saveProfile, signOut, session } = useAuth()
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  const go = async () => {
    if (!name.trim()) return
    setBusy(true); setErr(null)
    const error = await saveProfile(name)
    setBusy(false)
    if (error) setErr(error.message)
  }

  return (
    <AuthShell>
      <Panel className="p-5">
        <Eyebrow>Welcome to the garage</Eyebrow>
        <h2 className="font-display font-bold text-[18px] mt-1 mb-1">What should the crew call you?</h2>
        <p className="text-muted text-[13px] mb-4">This is the name shown on your RSVPs, receipts, and lift bookings.</p>
        <input className={inputCls} value={name} autoFocus
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && go()}
          placeholder="e.g. Blake" />
        {err && <div className="text-hazard text-[13px] mt-2">{err}</div>}
        <button disabled={busy} className={`${btnPrimary} w-full mt-4`} onClick={go}>
          {busy ? 'Saving…' : 'Enter the garage'}
        </button>
      </Panel>
      <button onClick={signOut} className="block mx-auto text-dim text-[12px] mt-4 font-cond uppercase tracking-wide">
        Signed in as {session?.user?.email} · Sign out
      </button>
    </AuthShell>
  )
}
