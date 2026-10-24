import { useSyncExternalStore } from 'react'
import { clearApiError } from './friendlyErrors'

/**
 * "Session expired" state. The axios response interceptor calls notifySessionExpired() on a 401, and
 * <SessionExpiredModal /> (mounted once in App) shows the popup. Many requests can fail at the same time,
 * so the popup opens once.
 */
let open = false
const listeners = new Set()
const emit = () => listeners.forEach((listener) => listener())

// Screens where a 401 is expected (wrong password, OTP…) and no popup should appear.
const PUBLIC_SCREEN = /#\/(login|register|forgot_password|set_forgot_password)/

export const notifySessionExpired = () => {
  if (open || PUBLIC_SCREEN.test(window.location.hash)) return
  open = true
  emit()
}

export const isSessionExpiredOpen = () => open

export const dismissSessionExpired = () => {
  clearApiError()
  if (!open) return
  open = false
  emit()
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** React hook: true while the popup should be visible. */
export const useSessionExpired = () => useSyncExternalStore(subscribe, () => open)
