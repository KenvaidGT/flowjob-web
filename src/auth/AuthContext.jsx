import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { consumeDiscordState, createDiscordLoginUrl, fetchDiscordMe, parseDiscordHash } from './discord.js'

const STORAGE_KEY = 'flowjob.auth'

function loadStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.accessToken || !parsed?.expiresAt) return null
    if (Date.now() >= parsed.expiresAt) return null
    return parsed
  } catch {
    return null
  }
}

function storeSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadStoredSession())
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const isAuthenticated = Boolean(session?.accessToken)

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
    setUser(null)
    setError(null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!session?.accessToken) return null
    const me = await fetchDiscordMe(session)
    setUser(me)
    return me
  }, [session])

  const startDiscordLogin = useCallback(({ returnTo } = {}) => {
    setError(null)
    const url = createDiscordLoginUrl({ returnTo })
    window.location.assign(url)
  }, [])

  const completeDiscordLoginFromHash = useCallback(
    async (hashString) => {
      setError(null)
      const parsed = parseDiscordHash(hashString)
      if (!parsed.ok) {
        throw new Error(parsed.errorDescription || parsed.error)
      }

      if (!parsed.state) {
        throw new Error('Missing OAuth state. Please try logging in again.')
      }

      const statePayload = consumeDiscordState(parsed.state)
      if (!statePayload) {
        throw new Error('Invalid OAuth state. Please try logging in again.')
      }

      const expiresAt = Date.now() + Math.max(0, parsed.expiresIn) * 1000
      const newSession = {
        provider: 'discord',
        accessToken: parsed.accessToken,
        tokenType: parsed.tokenType,
        scope: parsed.scope,
        expiresAt,
      }

      storeSession(newSession)
      setSession(newSession)
      const me = await fetchDiscordMe(newSession)
      setUser(me)

      const returnTo = statePayload?.returnTo || '/profile'
      return { returnTo }
    },
    []
  )

  useEffect(() => {
    if (!session?.expiresAt) return undefined
    const msLeft = session.expiresAt - Date.now()
    if (msLeft <= 0) {
      logout()
      return undefined
    }

    const id = window.setTimeout(() => logout(), msLeft)
    return () => window.clearTimeout(id)
  }, [session?.expiresAt, logout])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      setIsLoading(true)
      try {
        const stored = loadStoredSession()
        if (!stored) {
          if (!cancelled) {
            setSession(null)
            setUser(null)
          }
          return
        }

        if (!cancelled) setSession(stored)
        const me = await fetchDiscordMe(stored)
        if (!cancelled) setUser(me)
      } catch (e) {
        if (!cancelled) {
          clearSession()
          setSession(null)
          setUser(null)
          setError(e instanceof Error ? e.message : String(e))
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      session,
      user,
      error,
      startDiscordLogin,
      completeDiscordLoginFromHash,
      refreshUser,
      logout,
    }),
    [
      isLoading,
      isAuthenticated,
      session,
      user,
      error,
      startDiscordLogin,
      completeDiscordLoginFromHash,
      refreshUser,
      logout,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
