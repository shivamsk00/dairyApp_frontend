import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openChildWindow: () => ipcRenderer.send('open-child-window'),
  openSecondWindow: () => ipcRenderer.send('open-second-window'),
  openCusomerWindow: () => ipcRenderer.send('open-cutomer-win'),

  onSecondWindowClosed: (callback) => {
    ipcRenderer.on('second-window-closed', callback)
  },

  onCutomerWindowClosed: (callback) => {
    ipcRenderer.on('customer-win-close', callback)
  },

  removeCustomerWindowClose: (callback) => {
    ipcRenderer.removeListener('customer-win-close', callback)
  }
}

// Expose APIs to renderer safely
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
