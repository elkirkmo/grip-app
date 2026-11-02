import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

/** Also read by the inline script in index.html, which applies a saved choice before the page draws. */
export const THEME_KEY = 'grip.theme'

// Until the renter picks one, the theme follows the device. Storage can be blocked, so a pick
// then lasts until the page closes.
let memory: Theme | null = null

function chosen(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return memory
  }
}

function deviceTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getSnapshot(): Theme {
  return chosen() ?? deviceTheme()
}

/** A .dark or .light class on <html> overrides the device setting (see index.css). */
function apply(theme: Theme | null) {
  const classes = document.documentElement.classList
  classes.toggle('dark', theme === 'dark')
  classes.toggle('light', theme === 'light')
}

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  const query = window.matchMedia?.('(prefers-color-scheme: dark)')
  // Another tab picking a theme fires this here.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_KEY && event.key !== null) return
    apply(chosen())
    listener()
  }
  window.addEventListener('storage', onStorage)
  query?.addEventListener('change', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
    query?.removeEventListener('change', listener)
  }
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot)
}

export function toggleTheme() {
  const next: Theme = getSnapshot() === 'dark' ? 'light' : 'dark'
  try {
    localStorage.setItem(THEME_KEY, next)
  } catch {
    // Kept in memory below.
  }
  memory = next
  apply(next)
  listeners.forEach((listener) => listener())
}
