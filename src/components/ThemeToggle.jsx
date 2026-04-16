import React from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'
  const title = isDark ? 'Light theme' : 'Dark theme'

  return (
    <button
      type="button"
      className="theme-toggle theme-toggle--floating"
      onClick={onToggle}
      aria-label={label}
      title={title}
    >
      {isDark ? <Moon className="theme-toggle__icon" /> : <Sun className="theme-toggle__icon" />}
    </button>
  )
}
