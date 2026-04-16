import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

export default function RequireAuth({ children }) {
  const { isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (isLoading) return null
  if (isAuthenticated) return children

  const returnTo = `${location.pathname}${location.search}${location.hash}`
  return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />
}

