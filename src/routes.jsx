import React from 'react'
import SimplePage from './pages/SimplePage.jsx'

export const routes = [
  { path: '/', element: <SimplePage title="Dashboard" description="Overview of your progress and recent activity." /> },
  { path: '/tasks', element: <SimplePage title="Tasks" description="Browse and solve algorithmic challenges." /> },
  { path: '/statistics', element: <SimplePage title="Statistics" description="Visual insights into performance and progress." /> },
  { path: '/achievements', element: <SimplePage title="Achievements" description="Track badges and milestones earned." /> },
  { path: '/leaderboard', element: <SimplePage title="Leaderboard" description="Compare results with other users." /> },
  { path: '/admin', element: <SimplePage title="Admin Panel" description="Create and manage tasks, users, and achievements." /> },
  { path: '/profile', element: <SimplePage title="Profile" description="User profile and settings." /> },
]
