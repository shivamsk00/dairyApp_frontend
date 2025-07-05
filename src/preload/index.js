import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 🪟 Window Controls
  openChildWindow: () => ipcRenderer.send('open-child-window'),
  openSecondWindow: () => ipcRenderer.send('open-second-window'),
  openCusomerWindow: () => ipcRenderer.send('open-cutomer-win'),
  printSlip: (data) => ipcRenderer.send('print-slip', data),
  upadateStartDownload: (data) => ipcRenderer.send('start-update-download', data),
  checkForUpdate: () => ipcRenderer.send('check-for-update'),

  onUpdateMessage: (callback) => {
    ipcRenderer.on('update-message', (event, message) => {
      callback(message)
    })
  },

  onUpdateProgress: (callback) => {
    ipcRenderer.on('update-progress', (_, percent) => callback(percent))
  },

  // 📦 App Info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
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
