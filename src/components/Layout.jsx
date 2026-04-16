import React from 'react'
import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/statistics', label: 'Statistics' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/admin', label: 'Admin' },
  { to: '/profile', label: 'Profile' },
]

export default function Layout({ children }) {
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
          </nav>
        </div>
      </header>

      <main className="main container">{children}</main>

      <footer className="footer">
        <div className="container">© FlowJob</div>
      </footer>
    </div>
  )
}
