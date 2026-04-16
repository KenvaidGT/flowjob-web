import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { useTheme } from './hooks/useTheme.js'
import { routes } from './routes.jsx'

export default function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <BrowserRouter>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <Layout>
        <Routes>
          {routes.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
