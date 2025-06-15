import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 🪟 Window Controls
  openChildWindow: () => ipcRenderer.send('open-child-window'),
  openSecondWindow: () => ipcRenderer.send('open-second-window'),
  openCusomerWindow: () => ipcRenderer.send('open-cutomer-win'),

  // 🧩 Utility
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  on: (channel, callback) => ipcRenderer.on(channel, (event, data) => callback(data)),

  // 🧼 Window closed events
  onSecondWindowClosed: (callback) => {
    ipcRenderer.on('second-window-closed', callback)
  },
  onCutomerWindowClosed: (callback) => {
    ipcRenderer.on('customer-win-close', callback)
  }
}

// ✅ Expose to Renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('ContextBridge exposure failed:', error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
