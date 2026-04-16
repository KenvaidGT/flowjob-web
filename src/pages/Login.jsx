import React, { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { getDiscordConfig } from '../auth/discord.js'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

export default function Login() {
  const query = useQuery()
  const navigate = useNavigate()
  const { startDiscordLogin } = useAuth()
  const returnTo = query.get('returnTo') || '/profile'
  const { clientId, redirectUri, scopes } = getDiscordConfig()

  const missingConfig = !clientId

  return (
    <div className="auth-page">
      <h1>Login</h1>
      <p>Sign in with Discord to access the admin panel and your profile.</p>

      {missingConfig ? (
        <div className="card">
          <h3>Missing Discord config</h3>
          <p>
            Set <code>VITE_DISCORD_CLIENT_ID</code> (and make sure your Discord app has the redirect URL below).
          </p>
          <div className="kv">
            <div className="kv__key">Redirect URL</div>
            <div className="kv__value">
              <code>{redirectUri}</code>
            </div>
            <div className="kv__key">Scopes</div>
            <div className="kv__value">
              <code>{scopes}</code>
            </div>
          </div>
        </div>
      ) : (
        <div className="auth-actions">
          <button
            type="button"
            className="btn btn--discord"
            onClick={() => startDiscordLogin({ returnTo })}
          >
            Continue with Discord
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => navigate('/')}>
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

