import { createContext, useContext, useEffect, useState } from 'react'

const ThemeCtx = createContext({ theme: 'light', setTheme: () => {}, toggleTheme: () => {} })
const STORAGE_KEY = 'neeva-theme'

function initialTheme() {
 if (typeof window === 'undefined') return 'light'
 const saved = localStorage.getItem(STORAGE_KEY)
 if (saved === 'light' || saved === 'dark') return saved
 return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
 const [theme, setTheme] = useState(initialTheme)

 useEffect(() => {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
  localStorage.setItem(STORAGE_KEY, theme)
 }, [theme])

 const value = { theme, setTheme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }
 return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => useContext(ThemeCtx)
