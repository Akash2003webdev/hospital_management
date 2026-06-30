import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) {
        console.error('fetchProfile error:', error.message, error)
        return null
      }
      if (data) {
        setProfile(data)
        return data
      }
    } catch (err) {
      console.error('Profile fetch error:', err)
    }
    return null
  }

  // ============================================================
  // STEP 1: session-a kanipidikkurom (sync mattum, DB call illa)
  // ============================================================
  // IMPORTANT: onAuthStateChange callback-ku INGA await vechi DB call
  // (fetchProfile) panna koodathu. Adhu Supabase-oda known deadlock bug -
  // callback-ku ulla async supabase call panna, andha client oda internal
  // session lock (_acquireLock) deadlock aagidum, getSession()/fetchProfile
  // permanent ah hang aagi "Loading..." infinite ah stuck aagidum.
  // (ref: supabase/gotrue-js#762, supabase/supabase-js#2013)
  // Adhanala inga session-a set pannrom mattum - DB fetch-a STEP 2 oda
  // separate useEffect-ku move panniten.
  useEffect(() => {
    let active = true
    let initialCheckDone = false

    // Safety net: edhachum 6 seconds-ku mela hang aana, force ah
    // loading-a false pannidum - app permanent ah stuck aaga vidamatom.
    const safetyTimer = setTimeout(() => {
      if (active) setLoading(false)
    }, 6000)

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!active) return
      initialCheckDone = true
      clearTimeout(safetyTimer)
      console.log('[Auth] getSession resolved:', { hasSession: !!session, userId: session?.user?.id, error })
      // session kandupudichom na mattum set pannrom. session null ah
      // வந்தாலும், idhu real "logged out" ah irukkalam, illa
      // onAuthStateChange-oda INITIAL_SESSION event innum varadhuku
      // munnadi race aaagi vandhirukalam. Adhanala null ah irundha,
      // udane user-a clear pannama, listener-a decide pannisaikurom.
      if (session?.user) {
        setUser(session.user)
      }
      setLoading(false)
    }).catch((err) => {
      console.error('getSession error:', err)
      if (active) {
        initialCheckDone = true
        clearTimeout(safetyTimer)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      console.log('[Auth] onAuthStateChange fired:', { event, hasSession: !!session, userId: session?.user?.id })
      // Idhu callback - 100% sync ah vekkanum, await/async DB call kuda venam.
      setUser(session?.user ?? null)
      setLoading(false)
      if (!session?.user) setProfile(null)
      if (!initialCheckDone) {
        initialCheckDone = true
        clearTimeout(safetyTimer)
      }
    })

    return () => {
      active = false
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [])

  // ============================================================
  // STEP 2: user maarum pothu mattum, profile-a separate ah fetch pannrom
  // ============================================================
  // Idhu onAuthStateChange callback-ku VELIYA irukku, adhanala lock
  // deadlock risk illa - idhu safe ah DB call panna mudiyum idhulendhu.
  useEffect(() => {
    let active = true
    if (user) {
      setProfileLoading(true)
      fetchProfile(user.id).finally(() => {
        if (active) setProfileLoading(false)
      })
    } else {
      setProfile(null)
      setProfileLoading(false)
    }
    return () => {
      active = false
    }
  }, [user])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signUp = async (email, password, name, role = 'patient', extraData = {}) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        name,
        email,
        role,
      })
      if (profileError) throw profileError

      if (role === 'patient') {
        await supabase.from('patients').insert({
          user_id: data.user.id,
          age: extraData.age || null,
          gender: extraData.gender || null,
          phone: extraData.phone || null,
        })
      }
    }
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const getDashboardRoute = (profileData) => {
    const p = profileData || profile
    if (!p) return '/'
    const routes = {
      admin: '/admin-dashboard',
      doctor: '/doctor-dashboard',
      nurse: '/nurse-dashboard',
      patient: '/patient-dashboard',
    }
    return routes[p.role] || '/'
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileLoading, signIn, signUp, signOut, getDashboardRoute, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
