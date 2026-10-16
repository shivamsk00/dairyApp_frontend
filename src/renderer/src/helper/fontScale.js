import { useSyncExternalStore } from 'react'

/**
 * Font-size preference: one scale for the whole app and one extra scale for the sidebar.
 *
 * Both are multipliers (1 = the original size). They are kept in localStorage, written to the CSS
 * variables below, and every font size in the compiled CSS follows them (see postcss-font-scale.js).
 *
 *   --ui-font-base     whole app
 *   --ui-sidebar-font  sidebar, on top of the whole-app scale
 */
const KEY = 'uiFontScale'
export const MIN_SCALE = 0.8
export const MAX_SCALE = 1.5
export const DEFAULT_SCALES = { base: 1, sidebar: 1 }

export const FONT_PRESETS = [
  { value: 0.9, label: 'Small' },
  { value: 1, label: 'Default' },
  { value: 1.15, label: 'Large' },
  { value: 1.3, label: 'Extra large' }
]

const clamp = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 1
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(n * 100) / 100))
}

const read = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
    return { base: clamp(saved?.base ?? 1), sidebar: clamp(saved?.sidebar ?? 1) }
  } catch {
    return { ...DEFAULT_SCALES }
  }
}

let current = read()
const listeners = new Set()

const apply = (scales) => {
  const root = document.documentElement
  root.style.setProperty('--ui-font-base', String(scales.base))
  root.style.setProperty('--ui-sidebar-font', String(scales.sidebar))
}

const emit = () => listeners.forEach((listener) => listener())

export const getFontScales = () => current

/** Change one or both scales; applied immediately and remembered. */
export const setFontScales = (patch) => {
  current = {
    base: clamp(patch.base ?? current.base),
    sidebar: clamp(patch.sidebar ?? current.sidebar)
  }
  apply(current)
  try {
    localStorage.setItem(KEY, JSON.stringify(current))
  } catch {
    /* the scale still applies for this session */
  }
  emit()
}

export const resetFontScales = () => setFontScales(DEFAULT_SCALES)

/** Apply the saved scales and keep every open window (milk collection, cash entry…) in step. */
export const initFontScale = () => {
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

/** React hook: the current scales (re-renders when they change). */
export const useFontScales = () => useSyncExternalStore(subscribe, getFontScales)
