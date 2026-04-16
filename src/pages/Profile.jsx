import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { fetchDiscordGuilds } from '../auth/discord.js'

function avatarUrl(user) {
  if (!user) return 'https://cdn.discordapp.com/embed/avatars/0.png'
  if (user.avatar) return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
  const discriminator = Number(user.discriminator || 0)
  const index = Number.isFinite(discriminator) ? discriminator % 5 : 0
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

export default function Profile() {
  const { isLoading, isAuthenticated, user, session, error, startDiscordLogin, refreshUser, logout } = useAuth()
  const [guilds, setGuilds] = useState(null)
  const [guildsError, setGuildsError] = useState(null)
  const hasGuildScope = useMemo(() => (session?.scope || '').split(/\s+/g).includes('guilds'), [session])

  useEffect(() => {
    let cancelled = false

    async function loadGuilds() {
      if (!hasGuildScope || !session?.accessToken) return
      try {
        const data = await fetchDiscordGuilds(session)
        if (!cancelled) setGuilds(data)
      } catch (e) {
        if (!cancelled) setGuildsError(e instanceof Error ? e.message : String(e))
      }
    }

    loadGuilds()
    return () => {
      cancelled = true
    }
  }, [hasGuildScope, session])

  if (isLoading) {
    return (
      <div className="auth-page">
        <h1>Profile</h1>
        <p>Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-page">
        <h1>Profile</h1>
        <p>You are not logged in.</p>
        <button type="button" className="btn btn--discord" onClick={() => startDiscordLogin({ returnTo: '/profile' })}>
          Continue with Discord
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1>Profile</h1>
      {error ? <p className="text-danger">{error}</p> : null}

      <div className="profile">
        <div className="card profile-card">
          <div className="profile-header">
            <img className="avatar" src={avatarUrl(user)} alt="" />
            <div>
              <div className="profile-name">
                {user?.global_name || user?.username || 'Discord user'}
              </div>
              <div className="profile-meta">
                <span>
                  <code>{user?.id}</code>
                </span>
                {user?.email ? <span>{user.email}</span> : null}
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button type="button" className="btn" onClick={() => refreshUser()}>
              Refresh
            </button>
            <button type="button" className="btn btn--danger" onClick={logout}>
              Logout
            </button>
          </div>

          <div className="kv">
            <div className="kv__key">Provider</div>
            <div className="kv__value">
              <code>{session?.provider}</code>
            </div>
            <div className="kv__key">Scopes</div>
            <div className="kv__value">
              <code>{session?.scope || '-'}</code>
            </div>
            <div className="kv__key">Token expires</div>
            <div className="kv__value">
              <code>{session?.expiresAt ? new Date(session.expiresAt).toISOString() : '-'}</code>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Admin access</h3>
          <p>
            This UI currently authenticates via Discord. Role/admin checks should be enforced by the backend (not in the
            browser).
          </p>
        </div>

        <div className="card">
          <h3>Guilds</h3>
          {!hasGuildScope ? (
            <p>
              Add <code>guilds</code> to <code>VITE_DISCORD_SCOPES</code> to list servers.
            </p>
          ) : guildsError ? (
            <p className="text-danger">{guildsError}</p>
          ) : guilds ? (
            <div className="guilds">
              {guilds.slice(0, 20).map((g) => (
                <div key={g.id} className="guild">
                  <div className="guild__name">{g.name}</div>
                  <div className="guild__id">
                    <code>{g.id}</code>
                  </div>
                </div>
              ))}
              {guilds.length > 20 ? <p>Showing first 20 servers.</p> : null}
            </div>
          ) : (
            <p>Loading…</p>
          )}
        </div>
      </div>
    </div>
  )
}
