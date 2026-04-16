import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { completeDiscordLoginFromHash } = useAuth()
  const [message, setMessage] = useState('Finishing login…')

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const { returnTo } = await completeDiscordLoginFromHash(window.location.hash)
        if (cancelled) return
        window.history.replaceState({}, document.title, window.location.pathname)
        navigate(returnTo, { replace: true })
      } catch (e) {
        if (cancelled) return
        setMessage(e instanceof Error ? e.message : String(e))
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [completeDiscordLoginFromHash, navigate])

  return (
    <div className="auth-page">
      <h1>Discord Login</h1>
      <p>{message}</p>
    </div>
  )
}

