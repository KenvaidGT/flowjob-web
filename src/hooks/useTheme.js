import { useEffect, useState } from 'react'

export const THEME_STORAGE_KEY = 'flowjob.theme'

function getSystemTheme() {
  if (!window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readStoredTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    return saved === 'dark' || saved === 'light' ? saved : null
  } catch {
    return null
  }
}

function writeStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Ignore write errors (e.g. blocked storage).
  }
}

function applyThemeToDocument(theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export function useTheme() {
  const [theme, setTheme] = useState(() => readStoredTheme() ?? getSystemTheme())

  useEffect(() => {
    applyThemeToDocument(theme)
    writeStoredTheme(theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return { theme, setTheme, toggleTheme }
}
