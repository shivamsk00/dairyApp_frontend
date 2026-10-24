import { create } from 'zustand'

// Holds the app-update status pushed by the main process ('update-status'). It listens once for
// the whole session, so download progress is not lost when the user changes page.
const useUpdateStore = create((set, get) => ({
  // { state: 'idle'|'checking'|'available'|'downloading'|'downloaded'|'up-to-date'|'error', ... }
  status: { state: 'idle' },
  // The user pressed "Later" on the ready-to-install card (it shrinks to a small pill).
  dismissed: false,
  initialized: false,

  init: async () => {
    const api = window.api
    if (get().initialized || !api?.onUpdateStatus) return
    set({ initialized: true })

    let received = false
    api.onUpdateStatus((status) => {
      received = true
      // A new kind of status (e.g. available -> downloading) always shows the full card again.
      set((state) => ({ status, dismissed: state.status.state === status.state ? state.dismissed : false }))
    })
    // A check may already have finished (e.g. at startup, before the user logged in).
    const current = await api.getUpdateStatus?.()
    if (current && !received) set({ status: current })
  },

  checkNow: async () => {
    const api = window.api
    if (!api?.checkForUpdate) return
    set({ dismissed: false })
    try {
      await api.checkForUpdate()
    } catch {
      set({ status: { ...get().status, state: 'error', message: 'Could not check for updates.' } })
    }
  },

  // The user pressed Update: download the new version, then install it.
  startUpdate: async () => {
    set({ dismissed: false })
    await window.api?.upadateStartDownload?.()
  },

  restartAndInstall: () => window.api?.restartAndInstall?.(),

  dismiss: () => {
    if (get().status.state === 'downloaded' || get().status.state === 'available') set({ dismissed: true })
    else window.api?.dismissUpdateStatus?.()
  },

  showReadyCard: () => set({ dismissed: false })
}))

export default useUpdateStore
