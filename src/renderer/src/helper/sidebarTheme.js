import { useSyncExternalStore } from 'react'

/**
 * Sidebar colour preference. The theme name is written to <html data-sidebar-theme="…">; the colours
 * for each theme live in components/ui/ui.css. Remembered in localStorage and kept in step across the
 * app's windows.
 */
const KEY = 'uiSidebarTheme'

export const DEFAULT_SIDEBAR_THEME = 'cyan'

export const SIDEBAR_THEMES = [
  { value: 'cyan', label: 'Cyan light + white', hint: 'Default · light cyan fading to white' },
  { value: 'cloud', label: 'White cloud', hint: 'Soft white with clouds' },
  { value: 'dark', label: 'Dark navy', hint: 'The original dark menu' }
]

const isTheme = (value) => SIDEBAR_THEMES.some((theme) => theme.value === value)

const read = () => {
  try {
    const saved = localStorage.getItem(KEY)
    return isTheme(saved) ? saved : DEFAULT_SIDEBAR_THEME
  } catch {
    return DEFAULT_SIDEBAR_THEME
  }
}

let current = read()
const listeners = new Set()

const apply = (theme) => {
  document.documentElement.setAttribute('data-sidebar-theme', theme)
}

const emit = () => listeners.forEach((listener) => listener())

export const getSidebarTheme = () => current

export const setSidebarTheme = (theme) => {
  current = isTheme(theme) ? theme : DEFAULT_SIDEBAR_THEME
  apply(current)
  try {
    localStorage.setItem(KEY, current)
  } catch {
    /* the choice still applies for this session */
  }
  emit()
}

/** Apply the saved theme at startup and follow changes made in other windows. */
export const initSidebarTheme = () => {
  apply(current)
  window.addEventListener('storage', (event) => {
    if (event.key === KEY || event.key === null) {
      current = read()
      apply(current)
      emit()
    }
  })
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** React hook: the current theme name (re-renders when it changes). */
export const useSidebarTheme = () => useSyncExternalStore(subscribe, getSidebarTheme)
