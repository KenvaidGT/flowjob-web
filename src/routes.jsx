import React from 'react'
import Dashboard from './pages/Dashboard.jsx'
import Tasks from './pages/Tasks.jsx'
import Statistics from './pages/Statistics.jsx'
import Achievements from './pages/Achievements.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Admin from './pages/Admin.jsx'
import Login from './pages/Login.jsx'
import AuthCallback from './pages/AuthCallback.jsx'
import Profile from './pages/Profile.jsx'
import RequireAuth from './auth/RequireAuth.jsx'

export const routes = [
  { path: '/', element: <Dashboard /> },
  { path: '/tasks', element: <Tasks /> },
  { path: '/statistics', element: <Statistics /> },
  { path: '/achievements', element: <Achievements /> },
  { path: '/leaderboard', element: <Leaderboard /> },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <Admin />
      </RequireAuth>
    ),
  },
  { path: '/profile', element: <Profile /> },
  { path: '/login', element: <Login /> },
  { path: '/auth/discord/callback', element: <AuthCallback /> },
]