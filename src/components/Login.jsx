import { useState } from 'react'
import { useAuth } from '../auth'
import AuthShell from './AuthShell'
import { Panel, Eyebrow, inputCls, btnPrimary } from './ui'

export default function Login() {
  const { signInWithPassword, signUpWithPassword, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState('in') // 'in' | 'up'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!email.trim() || !password) return
    setBusy(true); setMsg(null)
    const fn = mode === 'in' ? signInWithPassword : signUpWithPassword
    const { data, error } = await fn(email.trim(), password)
    setBusy(false)
    if (error) { setMsg({ t: 'err', m: error.message }); return }
    if (mode === 'up' && !data.session) {
      setMsg({ t: 'ok', m: 'Account created. If email confirmation is on, confirm via email then sign in.' })
      setMode('in')
    }
    // On success with a session, the app flips to the hub automatically.
  }

  return (
    <AuthShell>
      <Panel className="p-5">
        <div className="flex gap-1 mb-4 bg-ink border border-edge rounded-md p-1">
          {[['in', 'Sign in'], ['up', 'Create account']].map(([k, label]) => (
            <button key={k} onClick={() => { setMode(k); setMsg(null) }}
              className={`flex-1 font-cond font-semibold uppercase tracking-wide text-[12.5px] py-2 rounded ${
                mode === k ? 'bg-steel2 text-chalk' : 'text-muted'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <Eyebrow className="mb-1.5">Email</Eyebrow>
            <input className={inputCls} type="email" autoComplete="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="you@garage43.com" />
          </div>
          <div>
            <Eyebrow className="mb-1.5">Password</Eyebrow>
            <input className={inputCls} type="password"
              autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()} placeholder="••••••••" />
          </div>

          {msg && (
            <div className={`text-[13px] ${msg.t === 'err' ? 'text-hazard' : 'text-good'}`}>{msg.m}</div>
          )}

          <button disabled={busy} className={`${btnPrimary} w-full`} onClick={submit}>
            {busy ? 'One sec…' : mode === 'in' ? 'Sign in' : 'Create account'}
          </button>
        </div>

        <div className="flex items-center gap-3 my-4">
          <span className="flex-1 h-px bg-edge" />
          <span className="font-cond uppercase tracking-wide text-[11px] text-dim">or</span>
          <span className="flex-1 h-px bg-edge" />
        </div>

        <button onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-2.5 bg-chalk text-ink font-cond font-semibold uppercase tracking-wide text-[13px] py-2.5 rounded-md">
          <GoogleG /> Continue with Google
        </button>
      </Panel>
      <p className="text-center text-dim text-[12px] mt-4 font-cond uppercase tracking-wide">Members only · Bay 43</p>
    </AuthShell>
  )
}

function GoogleG() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16z" />
      <path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.7-2.9-.7-4.7s.3-3.3.7-4.7l-7.8-6.1C1 16.3 0 20 0 24s1 7.7 2.6 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.8-5.8l-7.1-5.5c-2 1.3-4.6 2.1-8.7 2.1-6.4 0-11.7-3.7-13.6-9.1l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}
