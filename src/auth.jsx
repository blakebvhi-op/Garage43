import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isOnline } from './supabase'
import { registerProfiles } from './store'
import { MEMBERS, ME as DEFAULT_ME } from './data/seed'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

function initialsFrom(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const s = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.trim().slice(0, 2)
  return s.toUpperCase()
}

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)

  const loadProfiles = useCallback(async (sess) => {
    const { data, error } = await supabase.from('profiles').select('*')
    if (!error && data) {
      registerProfiles(data)
      setProfile(data.find(p => p.id === sess.user.id) || null)
    }
  }, [])

  useEffect(() => {
    // No Supabase configured -> run with the demo identity, no login screen.
    if (!isOnline) {
      registerProfiles(MEMBERS)
      const demo = MEMBERS.find(m => m.id === DEFAULT_ME) || MEMBERS[0]
      setProfile({ id: demo.id, name: demo.name, initials: demo.initials })
      setReady(true)
      return
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s) loadProfiles(s)
      else setProfile(null)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfiles(session).finally(() => setReady(true))
      else setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [loadProfiles])

  const signInWithPassword = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signUpWithPassword = (email, password) =>
    supabase.auth.signUp({ email, password })

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })

  const signOut = () => supabase.auth.signOut()

  const saveProfile = async (name) => {
    const row = { id: session.user.id, name: name.trim(), initials: initialsFrom(name) }
    const { error } = await supabase.from('profiles').upsert(row)
    if (!error) { registerProfiles([row]); setProfile(row) }
    return error
  }

  const me = isOnline ? session?.user?.id : DEFAULT_ME

  return (
    <AuthCtx.Provider value={{
      ready, online: isOnline, session, profile, me,
      signInWithPassword, signUpWithPassword, signInWithGoogle, signOut, saveProfile,
    }}>
      {children}
    </AuthCtx.Provider>
  )
}
