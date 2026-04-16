import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/statistics', label: 'Statistics' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/profile', label: 'Profile' },
]

export default function Layout({ children }) {
  const { isLoading, isAuthenticated, user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="header">
        <div className="container header-inner">
          <h2 className="brand">FlowJob</h2>
          <nav className="nav" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? <Link to="/admin">Admin</Link> : null}
          </nav>

          <div className="header-auth">
            {isLoading ? null : isAuthenticated ? (
              <>
                <Link to="/profile" className="user-chip">
                  <img
                    className="user-chip__avatar"
                    src={
                      user?.avatar
                        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
                        : 'https://cdn.discordapp.com/embed/avatars/0.png'
                    }
                    alt=""
                  />
                  <span className="user-chip__name">{user?.global_name || user?.username || 'User'}</span>
                </Link>
                <button type="button" className="btn btn--small btn--ghost" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <Link className="btn btn--small btn--discord" to="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="main container">{children}</main>

      <footer className="footer">
        <div className="container">© FlowJob</div>
      </footer>
    </div>
  )
}
