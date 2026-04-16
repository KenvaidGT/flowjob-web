const DISCORD_API_BASE = 'https://discord.com/api/v10'
const DISCORD_AUTHORIZE_URL = 'https://discord.com/oauth2/authorize'

function randomState() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  }
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
}

export function getDiscordConfig() {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID
  const redirectUri =
    import.meta.env.VITE_DISCORD_REDIRECT_URI || `${window.location.origin}/auth/discord/callback`
  const scopes = (import.meta.env.VITE_DISCORD_SCOPES || 'identify email')
    .split(/[,\s]+/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' ')

  return { clientId, redirectUri, scopes }
}

export function createDiscordLoginUrl({ returnTo } = {}) {
  const { clientId, redirectUri, scopes } = getDiscordConfig()
  if (!clientId) {
    throw new Error('Missing VITE_DISCORD_CLIENT_ID')
  }

  const state = randomState()
  sessionStorage.setItem(
    `flowjob.discord.state:${state}`,
    JSON.stringify({ returnTo: returnTo || '/profile', createdAt: Date.now() })
  )

  const url = new URL(DISCORD_AUTHORIZE_URL)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'token')
  url.searchParams.set('scope', scopes)
  url.searchParams.set('state', state)
  url.searchParams.set('prompt', 'consent')
  return url.toString()
}

export function parseDiscordHash(hashString) {
  const raw = (hashString || '').startsWith('#') ? hashString.slice(1) : hashString || ''
  const params = new URLSearchParams(raw)
  const error = params.get('error')
  const errorDescription = params.get('error_description')

  if (error) {
    return { ok: false, error, errorDescription }
  }

  const accessToken = params.get('access_token')
  const tokenType = params.get('token_type') || 'Bearer'
  const expiresIn = Number(params.get('expires_in') || '0')
  const scope = params.get('scope') || ''
  const state = params.get('state') || ''

  if (!accessToken) {
    return { ok: false, error: 'missing_access_token', errorDescription: 'No access_token in URL hash.' }
  }

  return { ok: true, accessToken, tokenType, expiresIn, scope, state }
}

export async function fetchDiscordMe({ accessToken, tokenType = 'Bearer' }) {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: { Authorization: `${tokenType} ${accessToken}` },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Discord /users/@me failed (${response.status}): ${body || response.statusText}`)
  }

  return response.json()
}

export async function fetchDiscordGuilds({ accessToken, tokenType = 'Bearer' }) {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
    headers: { Authorization: `${tokenType} ${accessToken}` },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Discord /users/@me/guilds failed (${response.status}): ${body || response.statusText}`)
  }

  return response.json()
}

export function consumeDiscordState(state) {
  if (!state) return null
  const key = `flowjob.discord.state:${state}`
  const value = sessionStorage.getItem(key)
  if (!value) return null
  sessionStorage.removeItem(key)
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

